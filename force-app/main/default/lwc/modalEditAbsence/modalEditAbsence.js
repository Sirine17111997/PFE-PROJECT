import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';


export default class ModalEditAbsence extends LightningElement {

  @api showelement = false;
  @api Id;

  @api
  openModal(id) {
    this.Id = id
    this.showelement = true;
  }
  @api
  closeModal(event) {
    // hide the modal
    this.showelement = false;
  }
  handleSuccess(event) {
    this.showelement = false;
    // show success msg
    debugger
    this.dispatchEvent(
      new ShowToastEvent({
        title: 'Success',
        message: event.detail.apiName + 'was Updated.',
        variant: 'success',
      }),
    );

    //dispatch updated event
    let customEvent = new CustomEvent('updated', {
      detail: null
    })
    this.dispatchEvent(customEvent);
  }

  handleDelete(event) {

    this.showelement = false

    console.log(this.Id);
    
      deleteRecord(this.Id).then(() => {
      // show success msg
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Success',
          message: 'Absence with Id ' + this.Id + 'was Deleted.',
          variant: 'success',
        }),
      );

      let customEvent = new CustomEvent('deleted', {
        detail: null
      })
      this.dispatchEvent(customEvent);

    }
    )


  }

}