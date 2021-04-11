import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
export default class HrmAbsence extends LightningElement {
    @track absenceId ;
    @track isAbsence;
    @track isAbsenceManager;
    @track isAbsenceItemMenu = true;
    @track isEquipmentItemMenu = false;
    @track isEmploymentItemMenu = false;
    @track isJobsItemMenu = false;
    @track isSetupItemMenu = false;
    
    @wire(CurrentPageReference) pageRef;

    handleselectAbsence(event) {
        
       
        this.absenceId = event.detail;
        this.isAbsence = true;
        this.isAbsenceManager = false;

       
       
    }
    
    handleselectAbsenceManager(event) {
        
       
      this.absenceId = event.detail;
      this.isAbsenceManager = true;
      this.isAbsence = false;
    }

    connectedCallback() {
      registerListener('itemmenuselected', this.handleItemMenuSelected, this);
  }

  disconnectedCallback() {
      unregisterAllListeners(this);
  }

  handleItemMenuSelected(itemMenuSelected) {
    switch (itemMenuSelected)  {
      case 'absences': {
        this.isAbsenceItemMenu = true;
        this.isEquipmentItemMenu = false;
       this.isEmploymentItemMenu = false;
       this.isJobsItemMenu = false;
        this.isSetupItemMenu = false;
      }
      break;
     
      case 'employment': {
        this.isAbsenceItemMenu = false;
        this.isEquipmentItemMenu = false;
       this.isEmploymentItemMenu = true;
       this.isJobsItemMenu = false;
        this.isSetupItemMenu = false;
      }
      break;
      case 'equipment': {
        this.isAbsenceItemMenu = false;
        this.isEquipmentItemMenu = true;
       this.isEmploymentItemMenu = false;
       this.isJobsItemMenu = false;
        this.isSetupItemMenu = false;
      }
      break;
      case 'jobs': {
        this.isAbsenceItemMenu = false;
        this.isEquipmentItemMenu = false;
       this.isEmploymentItemMenu = false;
       this.isJobsItemMenu = true;
        this.isSetupItemMenu = false;
      }
      break;
      case 'setup': {
        this.isAbsenceItemMenu = false;
        this.isEquipmentItemMenu = false;
       this.isEmploymentItemMenu = false;
       this.isJobsItemMenu = false;
        this.isSetupItemMenu = true;
      }
      break;
    }
    

  }
}