/** @description
 * Receives an UI Error Object and reduces it to a readable error message: Method
 * tries to extract details and returns the most precise DML error
 * 
 * @param   errorObject     The DML error object
 * @returns                 Most specific error message from error object
 */
const reduceDMLErrors = (errorObject) => {
    let errMsg = 'Unknown Error!';
    if (errorObject.body.message) errMsg = errorObject.body.message;
    if (errorObject.body.output && errorObject.body.output.errors.length >= 1) {
        let errMsgs = [];
        errorObject.body.output.errors.forEach((err) => errMsgs.push(err.message));
        errMsg = errMsgs.join('; ');
    }
    if (errorObject.body.output && errorObject.body.output.fieldErrors) {
        let fieldErrors = errorObject.body.output.fieldErrors;
        let errMsgs = [];
        Object.keys(fieldErrors).forEach((fieldErrorKey) => errMsgs.push(fieldErrors[fieldErrorKey][0].message));
        errMsg = errMsgs.join('; ');
    }
    return errMsg;
}

export { 
    reduceDMLErrors
};