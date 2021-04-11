// appHelper.js
import updateAbsenceDuration from '@salesforce/apex/EventsAPI.updateAbsenceDuration';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export const helper = {
    //add or substract days   
    //return formatted date 'yyyy-mm-dd'
    addDays(d, days) {
        var daysMS = (24 * 60 * 60 * 1000) * days
        return this.formatDate(d += daysMS)
    }
    , addYears(d, years) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var c = new Date(year + years, month, day);

        return this.formatDate(c)
    },
    //return formatted date 'yyyy-mm-dd'
    formatDate(d) {
        return new Date(d).toISOString().substring(0, 10)
    },
    //get the color of the absence event based on the approval 
    getColorByApprovalName(approvalName) {
        if (approvalName == 'Ausstehend') return '#add8e6';
        if (approvalName == 'Abgelehnt') return '#ff4500';
        if (approvalName == 'Erteilt') return '#7cfc00';
    },
    listOfHolidays: [],
    isWeekend(d) {
        let dt = new Date(d)
        return dt.getDay() == 6 || dt.getDay() == 0
    },
    /**
     * @param {event to be updated} id 
     * @param {new start date with '2020-05-28' format for example} start 
     * @param {new end date with the same format} end 
     */
    updateDates(id, start, end) {
        updateAbsenceDuration({ 'idUpdate': id, 'startDate': start, 'endDate': end })
    }
    ,

    dispatchToast(variant, title, message) {
        let toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toast);
    }
}