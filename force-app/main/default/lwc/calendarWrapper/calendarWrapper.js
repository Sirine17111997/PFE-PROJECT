import { LightningElement, api, track } from 'lwc';


export default class CalendarWrapper extends LightningElement {
    @api options_ = []
    @api initval = []
    @track toggleCalendar = true;

    hanldeValueChange(e) {
        this.reloadCalendar(e);
    }

    reloadCalendar(e) {
        let evts = Object.values(e.detail || {}) || []
        this.template.querySelector('c-full-calendar-js').filterEvents(evts)
    }

    handleToggleCalendar() {
        this.toggleCalendar = !this.toggleCalendar
    }


    handleToggleCalendarWeekend() {
        this.template.querySelector('c-full-calendar-js').toggleWeekend()
    }

    //evts is array of colors
    handleOnRecordChange(e) {
        debugger
        let evts = this.template.querySelector('c-colors-index').svalue
        this.template.querySelector('c-full-calendar-js').filterEvents(evts)
    }

}

  //#region 
    // return [
    //     { label: 'Approved Absence', value: '#7cfc00' },
    //     { label: 'Pending  Absence', value: '#add8e6' },
    //     { label: 'Rejected Absence', value: '#ff4500' },
    //     { label: 'Holidays', value: '#777777' }
    // ];
    // }
    //#endregion