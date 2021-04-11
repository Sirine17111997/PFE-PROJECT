import { LightningElement, track, wire } from 'lwc';
import getAbsencesForApproval from '@salesforce/apex/AbsenceController.getAbsencesForApproval';
import Absence__c from '@salesforce/schema/Absence__c';
import Name from '@salesforce/schema/Absence__c.Name';
import StartDate__c from '@salesforce/schema/Absence__c.StartDate__c';
import endDate__c from '@salesforce/schema/Absence__c.EndDate__c';
import Workdays__c from '@salesforce/schema/Absence__c.Workdays__c';
import approval__c from '@salesforce/schema/Absence__c.Approval__c';
import Certificate__c from '@salesforce/schema/Absence__c.Certificate__c';
import DangerToEmployees__c from '@salesforce/schema/Absence__c.DangerToEmployees__c';
import AbsenceManager__c from '@salesforce/schema/Absence__c.AbsenceManager__c';

const actions = [
    { label: 'Approve', name: 'approve' },
    { label: 'Reject', name: 'reject' },
    { label: 'Details', name: 'show_details' },
];


export default class AbsencesForApproval extends LightningElement {
    @track data;
    @track columns;
    @track error;
    @track record = {};   
    @track certificate = Certificate__c;
    @track workdays = Workdays__c;
    startdate='StartDate__c';
    nameEmployee;

     columns = [
   
        { label: 'Start', fieldName: this.startdate, type: 'date' },
        { label: 'End', fieldName: 'endDate__c', type: 'date'  },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        },
    ];

    @wire(getAbsencesForApproval)
    wiredAbsences({
        error,
        data
    }) {
        if (data) {
            this.data = data;
            // console.log(JSON.stringify(data, null, '\t'));
           //var parsedData = JSON.parse(data);
          //  this.nameEmployee= parsedData[0]["AbsenceManger__r"]["Employee__r"]["Name"]
            //looping through each row of the data to make columns in the same level
           // for (var i = 0; i < data.length; i++) { 
             //  var rowi = this.data[i]; 
                //as data columns with relationship __r can not be displayed directly in data table, so generating dynamic columns 
                //here you assign the related data to new variables
               //   rowi.Name = rowi.absencemanager__r.Employee__r.Name; 
                   //rowi.EmployeeId = rowi.absencemanager__r.Employee__r.Id;  
            //    } 
          //console.log(data.length);
         // console.log(JSON.stringify(data, null, '\t'));
        } else {
            this.error = error;
        }
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log(row);
        console.log(actionName);
        switch (actionName) {
            case 'approve':
                this.approveRow(row);
                break;
            case 'reject':
                this.deleteRow(row);
                break;
            case 'show_details':
                this.showRowDetails(row);
                break;
            default:
        }
    }

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
    }

}