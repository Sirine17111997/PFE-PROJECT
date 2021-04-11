import { LightningElement, track, wire } from 'lwc';
import Absence__c from '@salesforce/schema/Absence__c';
import Name from '@salesforce/schema/Absence__c.Name';
import StartDate__c from '@salesforce/schema/Absence__c.StartDate__c';
import endDate__c from '@salesforce/schema/Absence__c.EndDate__c';
import Workdays__c from '@salesforce/schema/Absence__c.Workdays__c';
import approval__c from '@salesforce/schema/Absence__c.Approval__c';
import Certificate__c from '@salesforce/schema/Absence__c.Certificate__c';
import DangerToEmployees__c from '@salesforce/schema/Absence__c.DangerToEmployees__c';
import AbsenceManager__c from '@salesforce/schema/Absence__c.AbsenceManager__c';


// lmsPublisherWebComponent.js
// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import SampleMC from '@salesforce/messageChannel/SampleMC__c';

export default class NewAbsenceButton extends LightningElement {
    @wire(MessageContext)
    messageContext;

    // Respond to UI event by publishing message
    handleAbsenceCreated(id) {
        const payload = { param: 'created absence with id : ' + id };
        publish(this.messageContext, SampleMC, payload);
    }

    objectApiName = Absence__c;
    @track showModal = false;

    fields = [
        Name,
        StartDate__c,
        endDate__c,
        Workdays__c,
        approval__c,
        Certificate__c,
        DangerToEmployees__c,
        AbsenceManager__c
    ];

    /* javaScipt functions start */
    openModal() {
        // to open modal window set 'bShowModal' tarck value as true
        this.showModal = true;
    }

    handleSuccess(event) {
        //update  calendar: add the new created absence 
        this.handleAbsenceCreated(event.detail.id)
        this.closeModal()
    }

    closeModal() {
        // to close modal window set 'bShowModal' tarck value as false
        this.showModal = false;

    }

}