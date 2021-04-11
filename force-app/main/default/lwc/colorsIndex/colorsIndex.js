import { LightningElement, api, track } from 'lwc';
import getEventsCategories from '@salesforce/apex/EventsAPI.getEventsCategories';
import updateEventsCategories from '@salesforce/apex/EventsAPI.updateEventsCategories';

export default class ColorsIndex extends LightningElement {

    // options    
    // Events:    approved | pending | rejected  | holiday
    // Colors:    #7cfc00  | #add8e6 | #ff4500   | #777777

    //selected colors
    @api svalue;
    // @track strvalues;
    @track options;


    //handle checkbox selection
    handleChange(e) {

        //get the selected values
        this.svalue = e.detail.value;
        // this.strvalues= this.svalue.toString()
        const selectedEvent = new CustomEvent("valuechange", {
            detail: this.svalue
        });

        this.dispatchEvent(selectedEvent);
        this.saveSelection()
    }

    // @wire(updateEventsCategories, { eventsColors: '$strvalues' })
    // wireSelection({ error, data }) {
    //     if (data) {
    //         console.log(data);
    //     } else if (error) {
    //         console.log(error);
    //     }
    // }


    /**
     *save lightning-checkbox-group  selection to database
    */

    saveSelection() {
        updateEventsCategories({ eventsColors: this.svalue.toString() })
    }


    loadCategories() {
        getEventsCategories().then((data) => {
            console.log(data);
            this.data = data

            // load options for the lightning-checkbox-group (which needs label and value)
            this.options = data.map(x => {
                return {
                    label: x.cm_bm__label__c,
                    value: x.cm_bm__color__c
                }
            })

            //filter events by selected__c attribute 
            let tmp = data.filter(p => {
                if (p.cm_bm__selected__c == true)
                    return p
            }
            )
            this.svalue = tmp.map(x => x.cm_bm__color__c)

        })
    }

    connectedCallback() {
        console.log("cb colorsIndex.js");
        this.loadCategories()
    }


}