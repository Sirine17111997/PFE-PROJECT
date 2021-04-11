global with sharing class PostInstall implements InstallHandler {
  global  void onInstall(InstallContext context){ 
      //LOADING THE HOLIDAYS
     EventsAPI.loadAllHolidays();
         	
      //MAKE LOADING THE HOLIDAYS SCHEDULABLE 
           String sch = '0 0 0 1 1/1 ? *';
		   String jobID = System.schedule('loadAllHolidays', sch, new  ScheduleHolidaysLoadingAPI());
    
             //CREATING INITIAL EVENTS TYPES 
               if(Schema.sObjectType.cm_bm__EventsCategories__c.fields.cm_bm__label__c.isCreateable() &&
                  Schema.sObjectType.cm_bm__EventsCategories__c.fields.cm_bm__color__c.isCreateable() &&
                  Schema.sObjectType.cm_bm__EventsCategories__c.fields.cm_bm__selected__c.isCreateable()
                 ) {                
       		 cm_bm__EventsCategories__c ec1=new cm_bm__EventsCategories__c(cm_bm__label__c='Holidays',cm_bm__color__c='#777777',cm_bm__selected__c=false );
             cm_bm__EventsCategories__c ec2=new cm_bm__EventsCategories__c(cm_bm__label__c='Rejected Absence',cm_bm__color__c='#ff4500',cm_bm__selected__c=true );
        	 cm_bm__EventsCategories__c ec3=new cm_bm__EventsCategories__c(cm_bm__label__c='Approved Absence',cm_bm__color__c='#7cfc00',cm_bm__selected__c=false );
             cm_bm__EventsCategories__c ec4=new cm_bm__EventsCategories__c(cm_bm__label__c='Pending  Absence',cm_bm__color__c='#add8e6',cm_bm__selected__c=true );
             insert new List<cm_bm__EventsCategories__c>{ec1,ec2,ec3,ec4};
				 } 		 
               }
    
}