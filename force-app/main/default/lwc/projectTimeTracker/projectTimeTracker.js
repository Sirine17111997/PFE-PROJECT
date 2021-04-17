import { LightningElement, track, wire,api } from 'lwc';


import {
    getRecordCreateDefaults,
    generateRecordInputForCreate,
    createRecord,
    getRecord,
    updateRecord,
    deleteRecord,
    getFieldValue
} from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceDMLErrors } from 'c/utilities';

import getUnfinishedTimeEntries from '@salesforce/apex/TimeTrackingController.getUnfinishedTimeEntries';
import getProjectTeamMember from '@salesforce/apex/TimeTrackingController.getProjectTeamMember';



import TIME_ENTRY_OBJECT from '@salesforce/schema/TimeEntry__c';
import TIME_ENTRY_PROJECT_TEAM_MEMBER_FIELD from '@salesforce/schema/TimeEntry__c.Project_Team_Member__c';
import TIME_ENTRY_PROJECT_TASK_FIELD from '@salesforce/schema/TimeEntry__c.Project_Task__c';
import TIME_ENTRY_STATUS_FIELD from '@salesforce/schema/TimeEntry__c.Status__c';
import TIME_ENTRY_STARTTIME_FIELD from '@salesforce/schema/TimeEntry__c.Start__c';
import TIME_ENTRY_ENDTIME_FIELD from '@salesforce/schema/TimeEntry__c.End__c';
import TIME_ENTRY_DAILYRATE_FIELD from '@salesforce/schema/TimeEntry__c.Project_Team_Member__r.Project_Daily_Rate__c';
import TIME_ENTRY_DESCRIPTION_FIELD from '@salesforce/schema/TimeEntry__c.Description__c';

// PROJECT_TEAM_MEMBER fields(we can add additional fields if needed)
import PROJECT_TEAM_MEMBER_DAILYRATE_FIELD from '@salesforce/schema/Project_Team_Member__c.Project_Daily_Rate__c';
import PROJECT_TEAM_MEMBER_NAME_FIELD from '@salesforce/schema/Project_Team_Member__c.Project__r.Name';
import PROJECT_TEAM_MEMBER_PROJECT_FIELD from '@salesforce/schema/Project_Team_Member__c.Project__c';

// PROJECT_TASK fields(we can add additional fields if needed)
import PROJECT_TASK_NAME_FIELD from '@salesforce/schema/ProjectTask__c.Name';
import PROJECT_TASK_PROJECT_FIELD from '@salesforce/schema/ProjectTask__c.Project__c';

export default class ProjectTimeTracker extends LightningElement {

    // @track projectId;
    // @wire(getRecord, { recordId: '$projectId', fields: [PROJECT_TEAM_MEMBER_NAME_FIELD] })
    // projectTeamMember

    LABELS = {
        CARD_TITLE: 'Time Tracking',
        TOAST_TITLE_ERROR: 'An error occured during processing!',
        TOAST_TITLE_STARTED_SUCCESS: 'Recording of Time Entry successfully started!',
        TOAST_TITLE_STOPPED_SUCCESS: 'Recording successfully stopped. Time Entry submitted.',
        TOAST_TITLE_STOPPED_ERROR: 'TimeTracking_Toast_CanNotStopRecording',
        TOAST_TITLE_RECORDING_ABORTED: 'Recording aborted! Time Entry has been deleted.',
        TOAST_TITLE_RECORDING_REQUIRED_FIELDS: 'Please fill all the time entry required fields.'
    }

    @track activeTimeEntry;
    @track projectTeamMemberId;
    @track projectTaskId;
    @track isRecording = false;
    @track isLoading = true;
    @track isWorking = false;
    @track activeTimeEntryId;
    @track currentTime = new Date().toISOString()

    @api recordId;
   
    @wire(getRecordCreateDefaults, { objectApiName: TIME_ENTRY_OBJECT })
    timeEntryDefaults;

    @wire(getRecord, {
        recordId: '$activeTimeEntryId',
        fields: [
            TIME_ENTRY_PROJECT_TEAM_MEMBER_FIELD,
            TIME_ENTRY_PROJECT_TASK_FIELD,
            TIME_ENTRY_STATUS_FIELD,
            TIME_ENTRY_STARTTIME_FIELD,
            TIME_ENTRY_ENDTIME_FIELD,
            TIME_ENTRY_DAILYRATE_FIELD,
            TIME_ENTRY_DESCRIPTION_FIELD]
    })
    getTimeEntryRecord({ data }) {
        this.activeTimeEntry = data;
        if (this.activeTimeEntry) {
            this.template.querySelector('[data-id="InputProject_Team_Member__c"]').value = projectsTeamMember;
            this.template.querySelector('[data-id="InputProject_Task__c"]').value = data.fields.Project_Task__c.value;
            this.isLoading = false;
        }
    }
    @wire(getProjectTeamMember, {projectId:'$recordId',fields: [PROJECT_TEAM_MEMBER_NAME_FIELD] })
    projectsTeamMember;
    
    // @wire(getProjectTeamMember, {
    //     idProject: '$projectTeamMemberId', fields: [PROJECT_TEAM_MEMBER_NAME_FIELD, PROJECT_TEAM_MEMBER_DAILYRATE_FIELD, PROJECT_TEAM_MEMBER_PROJECT_FIELD]
    // })
    // projectTeamMember;


    @wire(getRecord, {
        recordId: '$projectTaskId', fields: [PROJECT_TASK_NAME_FIELD, PROJECT_TASK_PROJECT_FIELD]
    })
    projectTask

    /**                                LIFECYCLE METHODS                                */
    connectedCallback() {
        //start timer 
        setInterval(() => {
            this.currentTime = new Date().toISOString()
        }, 1000);

        //get unfinished time entry
        getUnfinishedTimeEntries().then((data) => {
            console.log('getUnfinishedTimeEntries ==> data.length ::' + data.length);
            if (data && data.length >= 1) {
                this.isRecording = true
                this.activeTimeEntryId = data[0].Id
                this.isLoading = false;
            }
            if (!this.isRecording) {
                this.isLoading = false;
            }
        });
    }

    /**                                 EVENT HANDLING                                  */

    startRecording() {
        console.log("start recording-*********");

        this.isWorking = true;
        let newTimeEntry = this.createTimeEntryForInsert();

        newTimeEntry.fields.DailyRate__c = this.projectTeamMember.data.fields.Project_Daily_Rate__c.value
        newTimeEntry.fields.Project__c = this.projectTeamMember.data.fields.Project__c.value
        newTimeEntry.fields.Start__c = this.currentTime
        newTimeEntry.fields.Project_Team_Member__c = this.projectTeamMemberId

        newTimeEntry.fields.Project_Task__c = this.projectTaskId

        createRecord(newTimeEntry)
            .then((newRecord) => {
                this.isRecording = true;
                this.isWorking = false;
                this.dispatchToast('success', this.LABELS.TOAST_TITLE_STARTED_SUCCESS);
                this.activeTimeEntry = newRecord;
                this.activeTimeEntryId = newRecord.id;
            })
            .catch((error) => {
                this.dispatchToast('error', this.LABELS.TOAST_TITLE_ERROR, reduceDMLErrors(error));
                this.isRecording = false;
                this.isWorking = false;
            });
    }

    stopRecording() {
        console.log("stop recording-*********");
        this.isWorking = true;
        let fieldsMap = new Map();
        fieldsMap[TIME_ENTRY_ENDTIME_FIELD.fieldApiName] = this.currentTime.substr(0, 19)
        fieldsMap[TIME_ENTRY_DESCRIPTION_FIELD.fieldApiName] = this.template.querySelector('[data-id="InputDescription__c"]').value

        let updateTimeEntry = this.createTimeEntryRecordInputForFields(fieldsMap);
        updateRecord(updateTimeEntry)
            .then((updatedRecord) => {
                this.dispatchToast('success', this.LABELS.TOAST_TITLE_STOPPED_SUCCESS);
                this.updateActiveTimeEntry(updatedRecord);
                this.isWorking = false;
                this.isRecording = false;
                this.clearInputs(
                    this.template.querySelector('[data-id="InputProject_Task__c"]'),
                    this.template.querySelector('[data-id="InputProject_Team_Member__c"]'))
            }).catch((error) => {
                this.dispatchToast('error', this.LABELS.TOAST_TITLE_STOPPED_ERROR, reduceDMLErrors(error));
                this.isWorking = false;
            });
    }

    deleteRecording() {
        this.isWorking = true;
        deleteRecord(this.activeTimeEntryId)
            .then(() => {
                this.dispatchToast('warning', this.LABELS.TOAST_TITLE_RECORDING_ABORTED);
                this.activeTimeEntryId = undefined;
                this.activeTimeEntry = undefined;
                this.isRecording = false;
                this.isWorking = false;
            })
            .catch((error) => {
                this.dispatchToast('error', this.LABELS.TOAST_TITLE_ERROR, reduceDMLErrors(error));
                this.isWorking = false;
            });
    }

    updateRecordLookup(event) {
        this.isWorking = true;
        let timeEntryUpdate = this.createTimeEntryRecordInputForField(
            event.currentTarget.fieldName,
            (event.detail && event.detail.value.length === 0) ? '' : (event.detail.value)[0]
        );

        this.updateTimeEntryRecord(timeEntryUpdate);
    }

    updateRecordValue(event) {
        this.isWorking = true;
        this.isLoading = true;
        let timeEntryUpdate = this.createTimeEntryRecordInputForField(event.currentTarget.name, event.currentTarget.value);
        // this.updateTimeEntryRecord(timeEntryUpdate);
        updateRecord(timeEntryUpdate)
            .then((updatedRecord) => {
                // this.updateActiveTimeEntry(updatedRecord)
                this.isWorking = false;
                this.isLoading = false;
            });
    }

    changeProjectTeamMember(event) {
        this.projectTeamMemberId = event.target.value
    }

    changeProjectTask(event) {
        this.projectTaskId = event.target.value
    }
    /**                                GETTERS & SETTERS                                 */

    get isReady() {
        return !this.isRecording && !this.isLoading;
    }

    get isFullyLoaded() {
        return this.isRecording && !this.isLoading;
    }


    get Project_TaskId() {
        return getFieldValue(this.activeTimeEntry, TIME_ENTRY_PROJECT_TASK_FIELD);
    }

    get DailyRate() {
        return getFieldValue(this.activeTimeEntry, TIME_ENTRY_DAILYRATE_FIELD);
    }

    get Description() {
        return getFieldValue(this.activeTimeEntry, TIME_ENTRY_DESCRIPTION_FIELD);
    }

    get startTime() {
        return getFieldValue(this.activeTimeEntry, TIME_ENTRY_STARTTIME_FIELD) ? getFieldValue(this.activeTimeEntry, TIME_ENTRY_STARTTIME_FIELD) : this.currentTime
    }





    /**                                     HELPERS                                      */

    createTimeEntryRecordInputForField(fieldName, fieldValue) {
        let recordInput = {
            fields: {
                Id: this.activeTimeEntryId
            }
        }
        recordInput.fields[fieldName] = fieldValue;
        return recordInput;
    }

    createTimeEntryRecordInputForFields(fieldsMap) {
        let recordInput = {
            fields: {
                Id: this.activeTimeEntryId
            }
        }
        for (const [fieldName, fieldValue] of Object.entries(fieldsMap)) {
            recordInput.fields[fieldName] = fieldValue;
        }
        return recordInput;
    }
    createTimeEntryForInsert() {
        if (!this.timeEntryDefaults.data) {
            return undefined;
        }

        return generateRecordInputForCreate(
            this.timeEntryDefaults.data.record,
            this.timeEntryDefaults.data.objectInfos[TIME_ENTRY_OBJECT.objectApiName]
        );
    }

    dispatchToast(variant, title, message) {
        let toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toast);
    }

    updateActiveTimeEntry(updatedRecord) {

        this.isRecording = false;
        this.activeTimeEntry = undefined;
        this.activeTimeEntryId = undefined;
        this.isWorking = false;
        this.activeTimeEntry = updatedRecord;

    }


    updateTimeEntryRecord(recordInput) {
        updateRecord(recordInput)
            .then((updatedRecord) => {
                this.isWorking = false
                debugger
            });
    }
    /**
     * @param {array} inputs
     * reset specific input fields in a form 
     */
    clearInputs(...inputs) {
        inputs.forEach(inputField => {
            inputField.reset()
        });
    }





}