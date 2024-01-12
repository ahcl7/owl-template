import {owl} from "@odoo/owl";
import './app.scss';

console.log(owl)
const {mount, Store, QWeb} = owl

import {Root} from "./components/Root";

const {loadFile} = owl.utils
let target = document.body

function createTaskStore() {
    const state = {
        nextId: 0,
        tasks: []
    }
    const actions = {
        toggleTask({state}, taskId) {
            const idx = state.tasks.findIndex(a => a.id === taskId)
            if (idx !== -1) {
                state.tasks[idx].isCompleted = !state.tasks[idx].isCompleted
            }
        },
        addTask({state}, text) {
            console.log("add task", text, state)
            if (text) {
                state.tasks.push({
                    id: state.nextId++,
                    text,
                    isCompleted: false
                })
            }
        },
        deleteTask({state}, taskId) {
            const idx = state.tasks.findIndex(a => a.id === taskId)
            if (idx !== -1) {
                state.tasks.splice(idx, 1)
            }
        }
    }
    const getters = {
        tasks({state}) {
            return state.tasks
        }
    }
    return new Store({state, actions, getters})
}
(async function setup() {
    const template1 = await loadFile(`./components/Root.xml`);
    const template2 = await loadFile(`./components/DatePicker/datetimepicker.xml`);
    const template3 = await loadFile(`./components/DatePicker/monthyearpicker.xml`);
    const template4 = await loadFile(`./components/DatePicker/timepicker.xml`);
    const qweb = new QWeb()
    qweb.addTemplates(template1)
    qweb.addTemplates(template2)
    qweb.addTemplates(template3)
    qweb.addTemplates(template4)
    const env = {
        qweb: qweb,
        store: createTaskStore()
        // possibly other stuff
    };

    mount(Root, {target: document.body, env });
})();