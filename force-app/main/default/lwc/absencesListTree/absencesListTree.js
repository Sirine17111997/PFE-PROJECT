import { LightningElement, track, wire, api } from 'lwc';
import getTreeData from '@salesforce/apex/AbsenceController.getTreeData';

// lmsPublisherWebComponent.js
// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import GoToDate from '@salesforce/messageChannel/GoToDate__c';


export default class AbsencesListTree extends LightningElement {
    @wire(MessageContext)
    messageContext;

    @track error;
    selectedItemId;
    @track treeItems;
    @track mapIdStartDate = new Map()

    connectedCallback() {
        this.loadTreeData()
    }

    loadTreeData() {
        getTreeData().then(data => {
            //fill map Id absence start date
            this.createMapIdStartDate(data)
            //get deep copy of data array 
            this.treeItems = JSON.parse(JSON.stringify(data))
            //sort absences for each employee by absence StartDate
            this.treeItems.forEach(dataItem => {
                dataItem.items = dataItem.items.sort((a, b) => Date.parse(a.StartDate) - Date.parse(b.StartDate))
            })
        }).catch(ex => { this.error = ex })
    }


    // @wire(getTreeData)
    // wireTreeData({
    //     error,
    //     data
    // }) {
    //     if (data) {
    //         this.treeItems = data
    //         this.createMapIdStartDate(data)
    //         //  console.log(JSON.stringify(data, null, '\t'));
    //     } else {
    //         this.error = error;
    //     }
    // }

    handleOnselect(event) {
        //get selected absence id
        this.selectedItemId = event.detail.name;
        //message channel
        this.goToSelectedAbsenceDate(this.selectedItemId);
        // 1. Prevent default behavior of anchor tag click which is to navigate to the href url
        event.preventDefault();
        // 2. Read about event best practices at http://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_best_practices
        const selectEvent = new CustomEvent('selectabsence', {
            detail: this.selectedItemId
        });
        // 3. Fire the custom event 
        if (this.selectedItemId.slice(0, 1) !== 'E') {
            this.dispatchEvent(selectEvent);
        }
        else {
            this.dispatchEvent(new CustomEvent('selectabsencemanager', {
                detail: this.selectedItemId.substr(1)
            }));
        }


    }

    createMapIdStartDate(data) {
        data.map(e => e.items).forEach(e => e.forEach(item => {
            this.mapIdStartDate.set(item.name, item.StartDate)
        }));

    }

    goToSelectedAbsenceDate(id) {
        let selectedAbsenceStartDate = this.mapIdStartDate.get(id)
        this.handleSelectedAbsenceDate(selectedAbsenceStartDate)
    }

    //  publishing event to full calendar
    handleSelectedAbsenceDate(d) {
        const payload = { param: d };
        publish(this.messageContext, GoToDate, payload);
    }



}