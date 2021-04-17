import { LightningElement,track,wire } from 'lwc';
import getOpportunityTM from '@salesforce/apex/SearchTeamMember.getOpportunityTM';
const DELAY = 300;

export default class SearchOppTm extends LightningElement {
    @track search = '';
    @track error;
    // @track selectedAccount;
    @track selectedOppTeamMember;
    // @track showAccountsListFlag = false;
    @track showOppListFlag = false;
    @wire(getOpportunityTM, { searchText: '$search' })
   opportunities;
    handleKeyUp(event) {
        if (!this.showOppListFlag) {
            
            this.showOppListFlag = true;
            this.template
                .querySelector('.opportunities_list')
                .classList.remove('slds-hide');
        }
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.search = searchKey;
        }, DELAY);
    }
    handleOptionSelect(event) {
        this.selectedOppTeamMember = event.currentTarget.dataset.name;
        this.template
            .querySelector('.selectedOption')
            .classList.remove('slds-hide');
        this.template
            .querySelector('.opportunities_list')
            .classList.add('slds-hide');
        this.template
            .querySelector('.slds-combobox__form-element')
            .classList.add('slds-input-has-border_padding');
    }
    handleRemoveSelectedOption() {
        this.template
            .querySelector('.selectedOption')
            .classList.add('slds-hide');
        this.template
            .querySelector('.slds-combobox__form-element')
            .classList.remove('slds-input-has-border_padding');

        this.showOppListFlag = false;
    }







}