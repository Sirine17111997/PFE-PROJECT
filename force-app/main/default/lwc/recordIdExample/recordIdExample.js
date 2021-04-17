import { LightningElement,api,wire,track } from 'lwc';
import getProjectTeamMember from '@salesforce/apex/TimeTrackingController.getProjectTeamMember';

export default class RecordIdExample extends LightningElement {
     @api recordId;
    @wire(getProjectTeamMember, {projectId:'$recordId' })
      projectsTeamMember;
}