import {owl} from "@odoo/owl";
import {MbfDatetimePicker} from "./DatePicker/datetimepicker";

const {Component, useState, tags,} = owl
const {xml} = tags;
const {useRef, onMounted, onWillUpdateProps, useStore, useDispatch, useGetter} = owl.hooks

class Task extends Component {
    static template = "TodoTask"
    static props = ["task"]

    setup() {
        this.dispatch = useDispatch()
    }

}

export class Root extends Component {
    static template = "TodoApp"
    static components = {MbfDatetimePicker}

    setup() {
        console.log(MbfDatetimePicker)
        // this.addTask = this.addTask.bind(this)
        // this.store = useStore(state => state)
        // this.dispatch = useDispatch()
        // const inputRef = useRef("add-input")
        // onMounted(() => {
        //     inputRef.el.focus()
        // })
    }

    addTask(ev) {
        if (ev.keyCode === 13) {
            const text = ev.target.value
            this.dispatch('addTask', (text))
            ev.target.value = ""
        }
    }

    onSelectDate(date) {
        console.log("on select date", date)
    }

}