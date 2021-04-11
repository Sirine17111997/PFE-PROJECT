import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class HrmMenu extends LightningElement {
    selected;
   
    @wire(CurrentPageReference) pageRef;
    
    handleSelectItemMenu(event) {
        this.selected = event.detail.name;
       
        //FireEvent through pubsub approach 
    fireEvent(this.pageRef, 'itemmenuselected',this.selected);
}

 
}