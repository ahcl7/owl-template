import {owl} from "@odoo/owl"

const {Component} = owl
const {useState, onMounted} = owl.hooks
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
        onMounted((function() {
            window.addEventListener('mouseup', this.onMouseUp.bind(this))
        }).bind(this))
    }

    get size() {
        return this.props.size || 244;
    }

    objectToStrStyle(obj) {
        return Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(";")
    }

    getItemStyle(item) {
        const ret = {}
        const alpha = Math.PI / 180 * item.angle;
        const radius = item.radius - 20
        const x = radius * Math.sin(alpha)
        const y = -radius * Math.cos(alpha)
        const containerSize = 20;
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
                    radius: this.size / 2 * 0.7,
                    angle: i * 30,
                    show: true
                })
            }
            for (let i = 12; i < 24; i++) {
                ret.push({
                    id: i,
                    text: i,
                    value: i,
                    radius: this.size / 2,
                    angle: (i - 12) * 30,
                    show: true
                })
            }
        } else {
            for (let i = 0; i < 60; i++) {
                ret.push({
                    id: i,
                    text: i,
                    value: i,
                    radius: this.size / 2,
                    angle: 360 / 60 * i,
                    show: (i % 5) === 0
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
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const centerX = this.size / 2
        const centerY = this.size / 2
        let matchedItem = null
        for (const item of this.items) {
            if (true || this.distance({x, y}, {x: centerX, y: centerY}) >= item.radius - 40) {
                if (!matchedItem) {
                    matchedItem = item
                } else {
                    if (this.calAngle({x: x - centerX, y: y - centerY}, item) <
                        this.calAngle({x: x - centerX, y: y - centerY}, matchedItem)) {
                        matchedItem = item
                    }
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
        const radius = item.radius - 20
        return radius * Math.sin(alpha)
    }

    get Y2() {
        const item = this.items.find(item => item.id === this.state.selectingItemId)
        const alpha = Math.PI / 180 * item.angle;
        const radius = item.radius - 20
        return -radius * Math.cos(alpha)
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
        console.log("commit")
        this.state.isSelecting = false
        if (this.state.mode === TimePicker.modes.HOUR) {
            this.state.selectedHour = (this.items.find(item => item.id === this.state.selectingItemId)).value
            setTimeout(() => {
                this.state.mode = TimePicker.modes.MINUTE
            }, 100)
        } else if (this.state.mode === TimePicker.modes.MINUTE) {
            this.state.selectedMinute = (this.items.find(item => item.id === this.state.selectingItemId)).value
            if (this.props.onTimeSelected) {
                this.props.onTimeSelected(this.state.selectedHour, this.state.selectedMinute)
            }
        }
    }
    onMouseUp(ev) {
        console.log("mouse up")
        this.commitSelect(ev)
    }
    onMouseOut(ev) {
        console.log("mouse out")
        this.commitSelect(ev)
    }
}