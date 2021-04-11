import { LightningElement, track, wire } from 'lwc';
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

import TIME_ENTRY_OBJECT from '@salesforce/schema/TimeEntry__c';
import TIME_ENTRY_PROJECT_TEAM_MEMBER_FIELD from '@salesforce/schema/TimeEntry__c.Project_Team_Member__c';
import TIME_ENTRY_PROJECT_TASK_FIELD from '@salesforce/schema/TimeEntry__c.Project_Task__c';
import TIME_ENTRY_STATUS_FIELD from '@salesforce/schema/TimeEntry__c.Status__c';
import TIME_ENTRY_STARTTIME_FIELD from '@salesforce/schema/TimeEntry__c.Start__c';
import TIME_ENTRY_ENDTIME_FIELD from '@salesforce/schema/TimeEntry__c.End__c';
import TIME_ENTRY_DAILYRATE_FIELD from '@salesforce/schema/TimeEntry__c.Project_Team_Member__r.Project_Daily_Rate__c';

// PROJECT_TEAM_MEMBER fields
import PROJECT_TEAM_MEMBER_DAILYRATE_FIELD from '@salesforce/schema/Project_Team_Member__c.Project_Daily_Rate__c';
import PROJECT_TEAM_MEMBER_NAME_FIELD from '@salesforce/schema/Project_Team_Member__c.Name';
import PROJECT_TEAM_MEMBER_PROJECT_FIELD from '@salesforce/schema/Project_Team_Member__c.Project__c';

import TIME_ENTRY_DESCRIPTION_FIELD from '@salesforce/schema/TimeEntry__c.Description__c';


export default class TimeTracker extends LightningElement {

    LABELS = {
        CARD_TITLE: 'Time Tracking',
        TOAST_TITLE_ERROR: 'An error occured during processing!',
        TOAST_TITLE_STARTED_SUCCESS: 'Recording of Time Entry successfully started!',
        TOAST_TITLE_STOPPED_SUCCESS: 'Recording successfully stopped. Time Entry submitted.',
        TOAST_TITLE_STOPPED_ERROR: 'TimeTracking_Toast_CanNotStopRecording',
        TOAST_TITLE_RECORDING_ABORTED: 'Recording aborted! Time Entry has been deleted.'
    }

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
        if (this.activeTimeEntry) this.isLoading = false;
    }

    @track isRecording = false;
    @track isLoading = true;
    @track isWorking = false;
    @track activeTimeEntryId;
    @track activeTimeEntry;
    @track currentTime= new Date().toISOString()
    @wire(getRecord, {
        recordId: '$projectTeamMemberId', fields: [PROJECT_TEAM_MEMBER_NAME_FIELD, PROJECT_TEAM_MEMBER_DAILYRATE_FIELD, PROJECT_TEAM_MEMBER_PROJECT_FIELD]
    })
    projectTeamMember


    /**                                LIFECYCLE METHODS                                */
    connectedCallback() {
        getUnfinishedTimeEntries()
            .then((data) => {
                if (data && data.length >= 1) {
                    this.isRecording = Boolean(data.length >= 1);
                    this.activeTimeEntryId = data[0].Id
                    this.isLoading = false;
                }
                
                if (!this.isRecording) {
                    this.isLoading = false;
                }
            });

        setInterval(() => {
            this.currentTime = new Date().toISOString()
        }, 1000);

    }

    /**                                 EVENT HANDLING                                  */

    startRecording() {
        console.log("start recording-*********");

        this.isWorking = true;
        let newTimeEntry = this.createTimeEntryForInsert();
        newTimeEntry.fields.cm_bm__DailyRate__c = this.ProjectMemberDailyRate.data.fields.cm_bm__Project_Daily_Rate__c.value
        newTimeEntry.fields.cm_bm__Project__c = this.projectTeamMember.data.fields.cm_bm__Project__c.value
        newTimeEntry.fields.cm_bm__Start__c = this.currentTime
        newTimeEntry.fields.cm_bm__Project_Team_Member__c = this.template.querySelector('[data-id="InputProject_Team_Member__c"]').value
        newTimeEntry.fields.cm_bm__Project_Task__c = this.template.querySelector('[data-id="InputProject_Task__c"]').value

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
        debugger
        let updateTimeEntry = this.createTimeEntryRecordInputForField(TIME_ENTRY_ENDTIME_FIELD.fieldApiName, this.currentTime);

        updateRecord(updateTimeEntry)
            .then((updatedRecord) => {
                this.dispatchToast('success', this.LABELS.TOAST_TITLE_STOPPED_SUCCESS);
                this.updateActiveTimeEntry(updatedRecord);
                this.isWorking = false;
                this.isRecording = false;

            })
            .catch((error) => {
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
        let timeEntryUpdate = this.createTimeEntryRecordInputForField(event.currentTarget.name, event.currentTarget.value);
        debugger
        this.updateTimeEntryRecord(timeEntryUpdate);
    }

    /**                                GETTERS & SETTERS                                 */
    get projectTeamMemberId() {
        return this.template.querySelector('[data-id="InputProject_Team_Member__c"]').value
    }
    get isReady() {
        return !this.isRecording && !this.isLoading;
    }

    get isFullyLoaded() {
        return this.isRecording && !this.isLoading;
    }

    // get EmployeeId() {
    //     return getFieldValue(this.activeTimeEntry, TIME_ENTRY_EMPLOYEE_FIELD);
    // }
    // get ProjectTeamMemberId() {
    //     return getFieldValue(this.activeTimeEntry, TIME_ENTRY_PROJECT_TEAM_MEMBER_FIELD);
    // }

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
        return getFieldValue(this.activeTimeEntry, TIME_ENTRY_STARTTIME_FIELD);
    }


    get ProjectMemberDailyRate() {
        if (this.projectTeamMember) {
            return getFieldValue(this.projectTeamMember, PROJECT_TEAM_MEMBER_DAILYRATE_FIELD);
        } else {
            return this.DailyRate
        }
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
        if (updatedRecord.fields.cm_bm__End__c.value !== null && updatedRecord.fields.cm_bm__End__c.value > updatedRecord.fields.cm_bm__Start__c.value) {
            this.isRecording = false;
            this.activeTimeEntry = undefined;
            this.activeTimeEntryId = undefined;
        } else {
            this.activeTimeEntry = updatedRecord;
        }
    }

    updateTimeEntryRecord(recordInput) {
        updateRecord(recordInput)
            .then((updatedRecord) => {
                this.updateActiveTimeEntry(updatedRecord);
                this.isWorking = false;
            });
    }

}