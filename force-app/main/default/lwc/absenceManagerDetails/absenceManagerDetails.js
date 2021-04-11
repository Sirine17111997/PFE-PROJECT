import { LightningElement, api} from 'lwc';
import Absence__c from '@salesforce/schema/Absence__c';
import AbsenceManager__c from '@salesforce/schema/AbsenceManager__c';
export default class AbsenceManagerDetails extends LightningElement {
    @api absenceid;
    @api isabsence = false;
    @api isabsencemanager = false;

    absence=Absence__c;
    absenceManager=AbsenceManager__c;
    
}