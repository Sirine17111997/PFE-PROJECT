import { LightningElement,track } from 'lwc';

export default class Content extends LightningElement {
    // @track accounts=[];
    @track oppTeamMember=[];
    select='';
    // @track contacts=[];
    @track projectTeamMember=[];
    @track selectedObject = '';
value = '';
    @track
    statusOptions = [{
            value: 'Opportunity Team Member',
            label: 'Opportunity Team Member'
        },
        {
            value: 'Project Team Member',
            label: 'Project Team Member'
        }
    ];
    handleChange(event) {
        
        console.log('hello');
        this.value = event.detail.value;

        console.log(this.value);
        if(this.value=='Opportunity Team Member'){
            this.selectedObject='Opportunity Team Member';
        }
        else{
            this.selectedObject='Project Team Member';
            console.log('else'+this.selectedObject)
        }
    }

    selectOpportunityTeamMember() {
        this.selectedObject = 'Opportunity Team Member';
    }
 
    selectProjectTeamMember() {
        this.selectedObject = 'Project Team Member';
     
    }
    get isOppTeamMember() {
        return this.selectedObject === "Opportunity Team Member";
    } 
    get isProjectTeamMember() {
        return this.selectedObject === "Project Team Member";
    } 


}