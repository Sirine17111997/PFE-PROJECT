import { LightningElement, track, wire, api } from 'lwc';
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


import getCurrentOpportunityTeamMember from '@salesforce/apex/TimeTrackingController.getUnfinishedTimeEntries';


import OPP_TEAM_MEMBER_OBJECT from '@salesforce/schema/User';
import OPP_TEAM_MEMBER_OPP_FIELD from '@salesforce/schema/OpportunityTeamMember.OpportunityId';
import OPP_TEAM_MEMBER_USER_FIELD from '@salesforce/schema/OpportunityTeamMember.UserId';
import OPP_TEAM_MEMBER_START_TIME_FIELD from '@salesforce/schema/OpportunityTeamMember.StartTime__c';
import OPP_TEAM_MEMBER_END_TIME_FIELD from '@salesforce/schema/OpportunityTeamMember.EndTime__c';
import OPP_TEAM_MEMBER_DURATION_FIELD from '@salesforce/schema/OpportunityTeamMember.Duration__c';
import OPP_TEAM_MEMBER_IS_BUSY_FIELD from '@salesforce/schema/OpportunityTeamMember.IsBusy__c';

export default class OppTeamMemberTimeTracker extends LightningElement {

    LABELS = {
        CARD_TITLE: 'Team Member Time Tracking',
        TOAST_TITLE_ERROR: 'An error occured during processing!',
        TOAST_TITLE_STARTED_SUCCESS: 'Recording of Time Entry successfully started!',
        TOAST_TITLE_STOPPED_SUCCESS: 'Recording successfully stopped. Time Entry submitted.',
        TOAST_TITLE_STOPPED_ERROR: 'TimeTracking_Toast_CanNotStopRecording',
        TOAST_TITLE_RECORDING_ABORTED: 'Recording aborted! Time Entry has been deleted.'
    }

    @api recordId
    @track currentOpportunity = this.recordId
    @track currentOpportunity = null;
    @track isRecording = false;
    @track isLoading = true;
    @track isWorking = false;
    @track activeOpportunityTeamMemberId;
    @track activeTimeEntry;
    @track currentTime = new Date(Date.now()).toTimeString().substr(0, 8);


    @wire(getRecord, {
        recordId: '$oppTeamMemberId', fields: [
            OPP_TEAM_MEMBER_OPP_FIELD,
            OPP_TEAM_MEMBER_USER_FIELD,
            OPP_TEAM_MEMBER_START_TIME_FIELD,
            OPP_TEAM_MEMBER_END_TIME_FIELD,
            OPP_TEAM_MEMBER_DURATION_FIELD,
            OPP_TEAM_MEMBER_IS_BUSY_FIELD]
    })
    OpportunityTeamMember

    /**                                LIFECYCLE METHODS                                */
    connectedCallback() {
        this.isWorking = false;
        this.isLoading = false;
    }

    /**                                 EVENT HANDLING                                  */

    startRecording() {
        console.log("start recording-*********");
        debugger
        //update start time from null to now  
        //set isBusy true
        this.isWorking = true;

        this.OpportunityTeamMember.fields.cm_bm__Start__c = this.currentTime;
        this.OpportunityTeamMember.fields.cm_bm__isBusy__c = true;
        this.OpportunityTeamMember.fields.OpportunityId = this.currentOpportunity;

        updateRecord(OpportunityTeamMember)
            .then(() => {
                this.isRecording = true;
                this.isWorking = false;
                this.dispatchToast('success', this.LABELS.TOAST_TITLE_STARTED_SUCCESS);
            })
            .catch((error) => {
                this.dispatchToast('error', this.LABELS.TOAST_TITLE_ERROR, reduceDMLErrors(error));
                this.isRecording = false;
                this.isWorking = false;
            });
    }

    stopRecording() {
        this.isWorking = true;
        //calculate duration
        this.OpportunityTeamMember.fields.cm_bm__isBusy__c = false;
        this.OpportunityTeamMember.fields.cm_bm__duration__c += this.calculateDuration(OpportunityTeamMember.fields.cm_bm__Start__c, this.currentTime)
        //reset time tracking
        this.OpportunityTeamMember.fields.cm_bm__Start__c = null;
        this.OpportunityTeamMember.fields.cm_bm__End__c = null;

        updateRecord(OpportunityTeamMember)
            .then((updatedRecord) => {
                this.dispatchToast('success', this.LABELS.TOAST_TITLE_STOPPED_SUCCESS);
                this.isWorking = false;
                this.isRecording = false;

            })
            .catch((error) => {
                this.dispatchToast('error', this.LABELS.TOAST_TITLE_STOPPED_ERROR, reduceDMLErrors(error));
                this.isWorking = false;
            });
    }




    /**                                GETTERS & SETTERS                                 */
    get oppTeamMemberId() {

            return this.template.querySelector('[data-id="Input_UserId"]').value
    }
    get isReady() {
        return !this.isRecording && !this.isLoading;
    }

    get isFullyLoaded() {
        return this.isRecording && !this.isLoading;
    }


    get startTime() {
        return getFieldValue(this.oppTeamMemberId, OPP_TEAM_MEMBER_START_TIME_FIELD);
    }


    /**                                     HELPERS                                      */

    createTimeEntryRecordInputForField(fieldName, fieldValue) {
        let recordInput = {
            fields: {
                Id: this.activeOpportunityTeamMemberId
            }
        }
        recordInput.fields[fieldName] = fieldValue;
        return recordInput;
    }

    calculateDuration(start, end) {
        return end.getHours() - start.getHours() + (end.getMinutes() - start.getMinutes()) / 60
    }



    dispatchToast(variant, title, message) {
        let toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toast);
    }

    updateDuration(updatedRecord) {
        if (updatedRecord.fields.cm_bm__End__c.value !== null) {
            this.isRecording = false;
            this.activeTimeEntry = undefined;
            this.activeOpportunityTeamMemberId = undefined;
        } else {
            this.activeTimeEntry = updatedRecord;
        }
    }



}