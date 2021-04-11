import { LightningElement, api, wire, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import FullCalendar from '@salesforce/resourceUrl/FullCalendarJS';
// import updateAbsenceDuration from '@salesforce/apex/EventsAPI.updateAbsenceDuration';
import getUserHolidays from '@salesforce/apex/EventsAPI.getUserHolidays';
import getAllAbsences from '@salesforce/apex/EventsAPI.getAllAbsences';
import getEventsCategories from '@salesforce/apex/EventsAPI.getEventsCategories';

import { helper } from './helper.js';

//lmsSubscriberWebComponent
// Import message service features required for subscribing and the message channel
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from 'lightning/messageService';
import SampleMC from '@salesforce/messageChannel/SampleMC__c';
import GoToDate from '@salesforce/messageChannel/GoToDate__c';

export default class FullCalendarJs extends LightningElement {

  LABELS = {
    // CARD_TITLE: 'Time Tracking',
    TOAST_TITLE_ERROR: 'An error occured during processing!',
  }


  //new absence button (absence created)
  //wire the message context
  @wire(MessageContext)
  messageContext;

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        SampleMC,
        (message) => this.handleNewAbsenceCreated(message),
        { scope: APPLICATION_SCOPE }
      );
    }
  }
  //selected  absence in absence list tree  button (absence created)
  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        GoToDate,
        (message) => this.goToDate(message.param),
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Handler for message received by component
  handleNewAbsenceCreated(message) {
    message ? this.init_calendar() : null
  }


  //unscubscribe from the message channel
  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }
  // ----------------------------
  @api currentDate = null;
  //may be loaded from database
  @api initialValues = []
  @api loadFromWrapper = false;

  @track spinnerFC = true;
  //get the new absence data as a  json object
  @api newAbsenceRecord;


  connectedCallback() {
    // Standard lifecycle hooks used to subscribe and unsubsubscribe to the message channel
    this.subscribeToMessageChannel();
    this.init_calendar()
  }

  init_calendar() {
    getEventsCategories().then((data) => {
      console.log(data);
      //get all values
      this.initialValues = data.map(x => {
        return {
          label: x.cm_bm__label__c,
          value: x.cm_bm__color__c,
          selected: x.cm_bm__selected__c
        }
      }) || []

      // preselected values
      this.preArr = this.initialValues.filter(p => {
        if (p.selected == true)
          return p
      }).map(x => x.value)
      this.filterEvents(this.preArr)
    })
  }


  //filter displayed events
  /**
   * @param {events data} evts 
   * @param {default date for the calendar} d 
   */
  @api
  filterEvents(evts) {
    //make sure modals (of edit/create  absence) are hidden 
    this.showmodal = false;
    //will take all events Holidays and Absences 
    let eventsList = []
    // holidays filling
    getUserHolidays()
      .then(result => {
        console.log('*** getUserHolidays : result');
        console.table(result);

        if (result.length > 0) {
          //get track of holidays 
          helper.listOfHolidays = [...result]
          debugger
          //actual holidays filling
          result.forEach(o => {
            eventsList.push({
              allDay: true,
              start: o.cm_bm__date__c,
              end: o.cm_bm__date__c,
              title: o.cm_bm__holidayName__c,
              editable: false,
              color: '#777777',
            })
          });
        }
        //absence filling
        getAllAbsences().then(result => {
          console.log('*** getAllAbsences : result');
          console.table(result);
          if (result.length > 0) {
            result.forEach(o => {
              eventsList.push({
                id: o.Id,
                allDay: true,
                start: o.cm_bm__StartDate__c,
                end: o.cm_bm__EndDate__c,
                title: o.cm_bm__Reason__c,
                editable: true,
                color: helper.getColorByApprovalName(o.cm_bm__Approval__c)
              })
            });
          }
          //filter events list by color 
          // please use lowercase letters for hex color codes  to avoid confusion     
          // Events:    approved | pending | rejected  | holiday
          // Colors:    #7cfc00  | #add8e6 | #ff4500   | #777777
          console.log("*** before filtering");
          console.table(eventsList);
          eventsList = eventsList.filter(evt => evts.includes(evt.color));
          // eventsList = this.myEventsList.filter(evt => evts.includes(evt.color));
          //build the calendar with the given eventsList 
          this.makeCalendar(eventsList);
        })
      })
  }

  //to make the code readable 
  makeCalendar(eventsList) {
    //we need to load jquery,moment and fullcalendar as static resources to be able 
    //to launch the full  calendar

    //custom css too have to be loaded before the full calendar , because we have no access 
    //to the full calendar style in fullCalendarJs.css file
    Promise.all([
      loadScript(this, FullCalendar + '/jquery.min.js'),
      loadScript(this, FullCalendar + '/jquery-ui.min.js'),
      loadScript(this, FullCalendar + '/moment.min.js'),
      loadScript(this, FullCalendar + '/fullcalendar.min.js'),

      loadStyle(this, FullCalendar + '/fullcalendar.min.css'),
      loadStyle(this, FullCalendar + '/custom.css')
    ]).then(() => {
      //loaded  modules from scripts are available only in this scope 
      //we may confuse the 'this' inside the configuration JSON object of fullcalendar with the 
      // 'this' referreing to the current lwc so we changed its name to 'thisElem' 

      // update 22-05-2020
      // let thisElem = this;
      //calling thiselem rerenders the component , instead we call
      //  the modal[c-modal-new-absence] or [c-modal-edit-absence]   rather than calling  the current component 
      //we have no problem instanciating a new component from one of them
      let newAbsenceElem = this.template.querySelector('c-modal-new-absence')
      let editAbsenceElem = this.template.querySelector('c-modal-edit-absence')
      //get the dom element to contain the Full calendar 
      const ele = this.template.querySelector('div.fullcalendarjs');

      //spinner to wait for the calendar to load (optional UI element)
      this.spinnerFC = false;
      // check if the Calendar will be reloaded on a preset date
      let presetDate = null
      let tmpPreset = $(ele).fullCalendar('getDate')
      if (tmpPreset._fullCalendar) { presetDate = helper.formatDate(tmpPreset) }

      //destroy the old calendar 
      $(ele).fullCalendar('destroy')

      //configure the dom Full calendar with JSON object 
      //some features are commented , we may need them in future use cases

      //we can checkout the docs of every word inside this JSON object here https://fullcalendar.io/docs/ 
      // for example  if we are looking  for :
      // plugins 
      // https://fullcalendar.io/docs/plugins/plugins 
      // 
      // eventClick 
      // https://fullcalendar.io/docs/plugins/eventClick 
      // 
      // interaction
      // https://fullcalendar.io/docs/plugins/interaction 


      $(ele).fullCalendar({
        plugins: ['interaction', 'dayGrid', 'list', 'timeGrid'],
        hiddenDays: [],
        header: {
          right: 'prev,next',
          center: 'title',
          left: 'month,basicWeek'//,basicDay,weekendToggle
        },
        // eventLimit: true,
        //display Monday as the first day of the week 
        firstDay: 1,
        selectable: true,
        // selectOverlap: false,
        // selectOverlap:function(event) {
        //   return event.rendering === 'background';
        // },
        // selectMinDistance:2,
        selectHelper: true,
        // defaultDate: new Date(),
        defaultDate: presetDate == null ? new Date() : presetDate,
        // gotoDate: customDefaultDate,
        navLinks: true,
        editable: true,
        eventClick: function (calEvent, jsEvent) {
          if (calEvent.color != "#777777") {
            // open popup only for non holidays 
            let editAbsenceId = calEvent.id
            editAbsenceElem.openModal(editAbsenceId);
          }
        },
        select: function (start, end) {
          console.log('selecting from' + start + 'to' + end);
          // let arrHolidays = helper.listOfHolidays.map(x => x.date__c)
          // let start_ = helper.formatDate(start);
          // let end_ = helper.formatDate(end);
          // if (
          //   !arrHolidays.includes(start_)
          //   && !helper.isWeekend(start_)
          //   && !arrHolidays.includes(end_)
          //   && !helper.isWeekend(end_)
          //   ) {}
          let newAbsence = {
            "cm_bm__StartDate__c": helper.formatDate(start),
            "cm_bm__EndDate__c": helper.addDays(end, (-1)),
            "cm_bm__Workdays__c": 0,
            "cm_bm__Approval__c": "",
            "cm_bm__Certificate__c": "",
            "cm_bm__DangerToEmployees__c": "",
            "cm_bm__AbsenceManager__c": "",
          }
          newAbsenceElem.openModal(newAbsence);
        },
        events: eventsList,
        //valid for 3 years (the previous,the current and the next one)
        validRange: {
          start: helper.addYears(new Date(), -1),
          end: helper.addYears(new Date(), +1)
        },
        // weekends: false,
        //same as weekends: false

        dayRender: function (date, cell) {
          let arrHolidays = helper.listOfHolidays.map(x => x.date__c)
          let currentDate = helper.formatDate(date);
          if (arrHolidays.includes(currentDate) || helper.isWeekend(currentDate)) {
            cell.addClass('my-custom-disabled-event');
            let evList = helper.listOfHolidays.filter(p => p.date__c == currentDate)
            if (evList.length > 0) {
              let eventName = evList[0].cm_bm__holidayName__c
              cell.html(`<h3>${eventName}</h3>`)
              cell.css('text-align', 'center')
              cell.css('vertical-align', 'middle')
              cell.css('color', 'white')
            }
          }
        },
        eventRender: function (eventObj, $el) {
          if (eventObj.color == "#777777") {
            let arrHolidays = helper.listOfHolidays.map(x => x.date__c)
            let currentDate = helper.formatDate(eventObj.start);
            if ((arrHolidays.includes(currentDate) || helper.isWeekend(currentDate))) {
              $el.css('display', 'none')
            }
          }
        },
        eventResize: function (event, delta, revertFunc) {

          let id = event.id
          let start = helper.formatDate(event.start).toString()
          let end = helper.formatDate(event.end).toString()

          helper.updateDates(id, start, end)
        },
        eventDrop: function (event) {

          // console.log(event.title + " was dropped on " + event.start.format());
          let id = event.id
          let start = helper.formatDate(event.start.format()).toString()
          let end = helper.formatDate(event.end.format()).toString()

          helper.updateDates(id, start, end)
        }
        // customButtons: {
        //   weekendToggle: {
        //     text: 'weekend',
        //     click: function ($el) {
        //       // $el.currentTarget.classList.add('fc-state-default')
        //       // setTimeout(() => {
        //       if ($(ele).fullCalendar('option', 'hiddenDays').length == 0) {
        //         $(ele).fullCalendar('option', 'hiddenDays', [0, 6])
        //       } else if ($(ele).fullCalendar('option', 'hiddenDays').length == 2) {
        //         $(ele).fullCalendar('option', 'hiddenDays', [])
        //       }
        //       // }, 100);
        //       $el.currentTarget.classList.add('fc-state-default')
        //       $el.currentTarget.classList.toggle('fc-state-active')
        //     }
        //   }
        // }
      });
      // $(ele).fullCalendar('rerenderEvents', eventsList)
      this.currentDate = null
    })
  }

  //we must load all scripts to be able to use the FC
  /**
   * 
   * @param {*} d : date with format 'YYYY-MM-DD' 
   */
  @api
  goToDate(d) {
    // let thisElem = this;
    let dt = helper.formatDate(d);
    Promise.all([
      loadScript(this, FullCalendar + '/jquery.min.js'),
      loadScript(this, FullCalendar + '/jquery-ui.min.js'),
      loadScript(this, FullCalendar + '/moment.min.js'),
      loadScript(this, FullCalendar + '/fullcalendar.min.js'),
      loadStyle(this, FullCalendar + '/fullcalendar.min.css'),
      loadStyle(this, FullCalendar + '/custom.css')
    ]).then(() => {
      const ele = this.template.querySelector('div.fullcalendarjs');
      $(ele).fullCalendar('gotoDate', dt)
      this.spinnerFC = false
    })
  }
  //get current date 
  @api
  getCurrentDate() {
    Promise.all([
      loadScript(this, FullCalendar + '/jquery.min.js'),
      loadScript(this, FullCalendar + '/jquery-ui.min.js'),
      loadScript(this, FullCalendar + '/moment.min.js'),
      loadScript(this, FullCalendar + '/fullcalendar.min.js'),
      loadStyle(this, FullCalendar + '/fullcalendar.min.css'),
      loadStyle(this, FullCalendar + '/custom.css'),
    ]).then(() => {
      const ele = this.template.querySelector('div.fullcalendarjs');
      let tmp = $(ele).fullCalendar('getDate')
      this.currentDate = helper.formatDate(tmp)
    })
  }

  @api
  toggleWeekend() {
    Promise.all([
      loadScript(this, FullCalendar + '/jquery.min.js'),
      loadScript(this, FullCalendar + '/jquery-ui.min.js'),
      loadScript(this, FullCalendar + '/moment.min.js'),
      loadScript(this, FullCalendar + '/fullcalendar.min.js'),
      loadStyle(this, FullCalendar + '/fullcalendar.min.css'),
      loadStyle(this, FullCalendar + '/custom.css'),
    ]).then(() => {
      const ele = this.template.querySelector('div.fullcalendarjs');

      if ($(ele).fullCalendar('option', 'hiddenDays').length == 0) {
        $(ele).fullCalendar('option', 'hiddenDays', [0, 6])
      } else if ($(ele).fullCalendar('option', 'hiddenDays').length == 2) {
        $(ele).fullCalendar('option', 'hiddenDays', [])
      }
    })

  }


  handleRecordsChange(e) {
    this.dispatchEvent(new CustomEvent('recordchange', {}))
  }



}