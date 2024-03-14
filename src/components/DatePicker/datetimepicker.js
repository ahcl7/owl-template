import {owl} from "@odoo/owl";
import {MonthYearPicker} from "./monthyearpicker";
import {TimePicker} from "./timepicker";

const {useState, useRef} = owl.hooks
const {Component} = owl

export class MbfDatetimePicker extends Component {
    static template = "MbfDatetimePicker"
    static props = ["onSelectDate"]
    static components = {MonthYearPicker, TimePicker}
    static modes = {
        DATE: "date",
        TIME: "time",
        MONTH_YEAR: "monthyear"
    }

    setup() {
        this.state = useState({
            mode: MbfDatetimePicker.modes.DATE,
            selectedMonth: 1,
            selectedYear: 2024,
            selectedDate: 1,
            selectedHour: 0,
            selectedMinute: 0,
            selectedSecond: 0,
            showingMonth:  1,
            showingYear: 2024
        })

        console.log(useRef("asdf"))

    }

    get items() {
        let curId = 0
        const firstDayOfMonth = new Date(this.state.showingYear, this.state.showingMonth - 1, 1)
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1)
        const ret = []
        while (firstDayOfMonth.getDay() !== 6) {
            ret.push({
                id: curId++,
                value: firstDayOfMonth.getDate(),
                col: firstDayOfMonth.getDay() + 1,
                disabled: true
            })
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1);
        }
        ret.reverse()
        const date = new Date(this.state.showingYear, this.state.showingMonth)
        date.setDate(date.getDate() - 1);
        const noDays = date.getDate();
        for (let i = 0; i < noDays; i++) {
            date.setDate(i + 1);
            ret.push({
                id: curId++,
                value: i + 1,
                col: date.getDay() + 1,
                disabled: false
            })
        }
        const lastDayOfMonth = new Date(this.state.showingYear, this.state.showingMonth, 1)
        while (lastDayOfMonth.getDay() !== 0) {
            ret.push({
                id: curId++,
                value: lastDayOfMonth.getDate(),
                col: lastDayOfMonth.getDay() + 1,
                disabled: true
            })
            lastDayOfMonth.setDate(lastDayOfMonth.getDate() + 1);
        }

        return ret;
    }

    isSelected(item) {
        return item.value === this.state.selectedDate && !item.disabled && (this.state.showingMonth === this.state.selectedMonth) && (this.state.showingYear === this.state.selectedYear)
    }

    get selectedDateStr() {
        return `Tháng ${this.state.showingMonth} ${this.state.showingYear}`
    }

    nextMonth(ev) {
        this.state.showingMonth++;
        if (this.state.showingMonth === 13) {
            this.state.showingMonth = 1
            this.state.showingYear++;
        }
    }

    prevMonth(ev) {
        this.state.showingMonth--;
        if (this.state.showingMonth === 0) {
            this.state.showingMonth = 12
            this.state.showingYear--;
        }
    }

    emitSelectedDateTime() {
        const selectedDate = new Date(this.state.selectedYear, this.state.selectedMonth - 1, this.state.selectedDate, this.state.selectedHour, this.state.selectedMinute, this.state.selectedSecond)
        if (this.props.onSelectDate) {
            this.props.onSelectDate(selectedDate)
        }
    }
    selectDate(item) {
        if (item.disabled) return;
        this.state.selectedDate = item.value
        this.state.selectedMonth = this.state.showingMonth
        this.state.selectedYear = this.state.showingYear
        this.emitSelectedDateTime()
    }
    changeMode(mode) {
        this.state.mode = mode
    }
    onMonthYearSelected(month, year) {
        this.state.selectedMonth = month
        this.state.selectedYear = year
        this.state.showingMonth = month
        this.state.showingYear = year
        this.changeMode(MbfDatetimePicker.modes.DATE)
    }
    onTimeSelected(hour, minute) {
        console.log(hour, minute)
        this.state.selectedHour = hour
        this.state.selectedMinute = minute
        this.emitSelectedDateTime()
        this.changeMode(MbfDatetimePicker.modes.DATE)
    }
}