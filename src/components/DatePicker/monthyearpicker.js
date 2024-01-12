import {owl} from "@odoo/owl"

const {Component} = owl
const {useState} = owl.hooks

export class MonthYearPicker extends Component {
    static template = ""
    static props = ["initialMonth", "initialYear", "onMonthYearSelected"]
    static modes = {
        MONTH: "month",
        YEAR: "year"
    }

    setup() {
        this.state = useState({
            mode: MonthYearPicker.modes.MONTH,
            selectedMonth: this.props.initialMonth || ((new Date()).getMonth() + 1),
            selectedYear: this.props.initialYear || ((new Date()).getFullYear())
        })
        this.state.showingYear = this.state.selectedYear
        this.state.startYearRange = Math.floor(this.state.selectedYear / 12) * 12
    }

    changeMode(mode) {
        this.state.mode = mode
    }

    get items() {
        const ret = []
        if (this.state.mode === MonthYearPicker.modes.MONTH) {
            for (let i = 0; i < 12; i++) {
                ret.push({
                    id: i,
                    value: i + 1,
                    text: "Tháng " + (i + 1),
                    onClick: () => this.onSelectMonth(i + 1)
                })
            }
        } else {
            const startYear = this.state.startYearRange
            for(let i = 0 ; i  < 12; i++) {
                ret.push({
                    id: i,
                    value: startYear + i,
                    text: startYear + i,
                    onClick: () => this.onSelectYear(startYear + i)
                })
            }
        }
        return ret
    }

    isSelected(item) {
        if (this.state.mode === MonthYearPicker.modes.MONTH) {
            return (this.state.selectedMonth === item.value) && (this.state.showingYear === this.state.selectedYear)
        } else {
            return this.state.selectedYear === item.value
        }
    }

    onSelectMonth(month) {
        this.state.selectedMonth = month
        this.state.selectedYear = this.state.showingYear
        if (this.props.onMonthYearSelected) {
            this.props.onMonthYearSelected(this.state.selectedMonth, this.state.selectedYear)
        }
    }
    onSelectYear(year) {
        this.state.selectedYear = year
        this.state.mode = MonthYearPicker.modes.MONTH
        this.state.showingYear = year
    }

    next() {
        if (this.state.mode === MonthYearPicker.modes.YEAR) {
            this.state.startYearRange += 12
        } else {
            this.state.showingYear++;
        }
    }

    prev() {
        if (this.state.mode === MonthYearPicker.modes.YEAR) {
            this.state.startYearRange -= 12
        } else {
            this.state.showingYear--;
        }
    }

    get title() {
        if (this.state.mode === MonthYearPicker.modes.MONTH) {
            return this.state.showingYear
        } else return "Chọn năm"
    }
}