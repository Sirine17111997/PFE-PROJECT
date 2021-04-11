import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// import ABSENCE_PROJECT_TEAM_MEMBER_FIELD from '@salesforce/schema/TimeEntry__c.StartDate__c';
// import ABSENCE_OBJECT from '@salesforce/schema/TimeEntry__c';


export default class ModalNewAbsence extends LightningElement {
  constructor() {
    super();
  }
  @api showelement = false;

  @api newAbsenceRecord;

  @api
  openModal(record) {
    this.newAbsenceRecord = record
    this.showelement = true;
  }
  @api
  closeModal(event) {
    this.showelement = false;
  }

  handleSuccess(event) {
    console.log(event);
    this.showelement = false;
    // show success msg
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Success',
        message: event.detail.apiName + ' created.',
        variant: 'success',
      }),
    );

    //dispatch created event
    let customEvent = new CustomEvent('created', {
      detail: null
    })
    this.dispatchEvent(customEvent);
  }

  initializeObject() {
  }
}