import { LightningElement,track,wire } from 'lwc';
import getProjectsTM from '@salesforce/apex/SearchTeamMember.getProjectsTM';
const DELAY = 300;

export default class SearchProjectTm extends LightningElement {
    @track search = '';
    @track error;
    // @track selectedAccount;
    @track selectedProjectTeamMember;
    // @track showAccountsListFlag = false;
    @track showProjectsListFlag = false;
    @wire(getProjectsTM, { searchText: '$search' })
    projects;
    handleKeyUp(event) {
        if (!this.showProjectsListFlag) {
            
            this.showProjectsListFlag = true;
            this.template
                .querySelector('.projects_list')
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
        this.selectedProjectTeamMember = event.currentTarget.dataset.name;
        this.template
            .querySelector('.selectedOption')
            .classList.remove('slds-hide');
        this.template
            .querySelector('.projects_list')
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

        this.showProjectsListFlag = false;
    }







}