import {owl} from "@odoo/owl"

const {Component} = owl
const {useState, onMounted, onWillUnmount} = owl.hooks
import _ from "lodash"

export class TimePicker extends Component {
    static template = "TimePicker"
    static props = ["size", "onTimeSelected"]
    static modes = {
        HOUR: "hour",
        MINUTE: "minute"
    }

    setup() {
        this.state = useState({
            mode: TimePicker.modes.HOUR,
            selectedHour: 0,
            selectedMinute: 0,
            selectingItemId: 0,
            isSelecting: false
        })
        const mouseUpListener = this.onMouseUp.bind(this)
        onMounted((function () {
            window.addEventListener('mouseup', mouseUpListener)
        }))
        onWillUnmount(function() {
            window.removeEventListener("mouseup", mouseUpListener)
        })
    }

    get size() {
        return this.props.size || 192;
    }

    objectToStrStyle(obj) {
        return Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(";")
    }

    getItemCoordinate(item) {
        const alpha = Math.PI / 180 * item.angle;
        const distanceToCenter = item.distanceToCenter - item.radius
        const x = distanceToCenter * Math.sin(alpha)
        const y = -distanceToCenter * Math.cos(alpha)
        return {x: x + this.size / 2 - item.radius / 2, y: y + this.size / 2 - item.radius / 2}
    }

    getItemStyle(item) {
        const ret = {}
        const alpha = Math.PI / 180 * item.angle;
        const distanceToCenter = item.distanceToCenter - item.radius
        const x = distanceToCenter * Math.sin(alpha)
        const y = -distanceToCenter * Math.cos(alpha)
        const containerSize = item.radius;
        ret.top = `${y + this.size / 2 - containerSize / 2}px`
        ret.left = `${x + this.size / 2 - containerSize / 2}px`
        ret.width = `${containerSize}px`
        ret.height = `${containerSize}px`
        ret.display = "flex"
        ret["justify-content"] = "center"
        ret["align-items"] = "center"
        return this.objectToStrStyle(ret)
    }

    get items() {
        let ret = []
        if (this.state.mode === TimePicker.modes.HOUR) {
            for (let i = 0; i < 12; i++) {
                ret.push({
                    id: i,
                    text: i,
                    value: i,
                    distanceToCenter: this.size / 2 * 0.7,
                    angle: i * 30,
                    show: true,
                    radius: 20
                })
            }
            for (let i = 12; i < 24; i++) {
                ret.push({
                    id: i,
                    text: i,
                    value: i,
                    distanceToCenter: this.size / 2,
                    angle: (i - 12) * 30,
                    show: true,
                    radius: 20
                })
            }
        } else {
            for (let i = 0; i < 60; i++) {
                ret.push({
                    id: i,
                    text: i,
                    value: i,
                    distanceToCenter: this.size / 2,
                    angle: 360 / 60 * i,
                    show: (i % 5) === 0,
                    radius: 20
                })
            }
        }
        return ret
    }

    distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    }

    calAngle(OA, item) {
        const {x, y} = OA
        const alpha = -y / Math.sqrt(x * x + y * y)
        let angle = Math.acos(alpha) / Math.PI * 180
        if (x < 0) {
            angle = 360 - angle
        }
        let ret = Math.min(Math.abs(item.angle - angle), Math.abs((360 + item.angle) - angle))
        if (ret >= 360 - 1e-5) {
            ret -= 360
        }
        return ret
    }

    select(ev) {
        if (!this.state.isSelecting) return
        ev.preventDefault()
        ev.stopPropagation()
        const rect = ev.currentTarget.getBoundingClientRect();
        // Calculate the position relative to the element
        const clientX = ev.clientX || (ev.touches[0].clientX)
        const clientY = ev.clientY || (ev.touches[0].clientY)
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = this.size / 2
        const centerY = this.size / 2
        let matchedItem = null
        for (const item of this.items) {
            if (!matchedItem) {
                matchedItem = item
            } else {
                const angle1 = this.calAngle({x: x - centerX, y: y - centerY}, item)
                const angle2 = this.calAngle({x: x - centerX, y: y - centerY}, matchedItem)
                if (Math.abs(angle1 - angle2) < 1e-5) {
                    const dis1 = this.distance({x, y}, this.getItemCoordinate(item))
                    const dis2 = this.distance({x, y}, this.getItemCoordinate(matchedItem))
                    if (dis1 < dis2) {
                        matchedItem = item
                    }
                } else if (angle1 < angle2) {
                    matchedItem = item
                }
            }
        }

        if (matchedItem) {

            this.state.selectingItemId = matchedItem.id
        }
    }

    get throttledSelect() {
        return _.throttle(this.select.bind(this), 50)
    }

    get X2() {
        const item = this.items.find(item => item.id === this.state.selectingItemId)
        const alpha = Math.PI / 180 * item.angle;
        const distanceToCenter = item.distanceToCenter - item.radius
        return distanceToCenter * Math.sin(alpha)
    }

    get Y2() {
        const item = this.items.find(item => item.id === this.state.selectingItemId)
        const alpha = Math.PI / 180 * item.angle;
        const distanceToCenter = item.distanceToCenter - item.radius
        return -distanceToCenter * Math.cos(alpha)
    }

    onMouseDown(ev) {
        this.state.isSelecting = true
        this.throttledSelect(ev)
    }

    onMouseMove(ev) {
        this.throttledSelect(ev)
    }

    commitSelect() {
        if (!this.state.isSelecting) return
        this.state.isSelecting = false
        if (this.state.mode === TimePicker.modes.HOUR) {
            this.state.selectedHour = (this.items.find(item => item.id === this.state.selectingItemId)).value
            setTimeout(() => {
                this.state.mode = TimePicker.modes.MINUTE
                this.state.selectingItemId = (this.items.find(item => item.value === this.state.selectedMinute)).id
            }, 100)
        } else if (this.state.mode === TimePicker.modes.MINUTE) {
            this.state.selectedMinute = (this.items.find(item => item.id === this.state.selectingItemId)).value
            if (this.props.onTimeSelected) {
                this.props.onTimeSelected(this.state.selectedHour, this.state.selectedMinute)
            }
        }
    }

    onMouseUp(ev) {
        console.log("up")
        this.commitSelect(ev)
    }

    onMouseOut(ev) {
        this.commitSelect(ev)
    }
}