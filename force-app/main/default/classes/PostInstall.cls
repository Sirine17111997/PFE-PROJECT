global with sharing class PostInstall implements InstallHandler {
  global  void onInstall(InstallContext context){ 
      //LOADING THE HOLIDAYS
     EventsAPI.loadAllHolidays();
         	
      //MAKE LOADING THE HOLIDAYS SCHEDULABLE 
           String sch = '0 0 0 1 1/1 ? *';
		   String jobID = System.schedule('loadAllHolidays', sch, new  ScheduleHolidaysLoadingAPI());
    
             //CREATING INITIAL EVENTS TYPES 
               if(Schema.sObjectType.EventsCategories__c.fields.label__c.isCreateable() &&
                  Schema.sObjectType.EventsCategories__c.fields.color__c.isCreateable() &&
                  Schema.sObjectType.EventsCategories__c.fields.selected__c.isCreateable()
                 ) {                
       		 EventsCategories__c ec1=new EventsCategories__c(label__c='Holidays',color__c='#777777',selected__c=false );
             EventsCategories__c ec2=new EventsCategories__c(label__c='Rejected Absence',color__c='#ff4500',selected__c=true );
        	 EventsCategories__c ec3=new EventsCategories__c(label__c='Approved Absence',color__c='#7cfc00',selected__c=false );
             EventsCategories__c ec4=new EventsCategories__c(label__c='Pending  Absence',color__c='#add8e6',selected__c=true );
             insert new List<EventsCategories__c>{ec1,ec2,ec3,ec4};
				 } 		 
               }
    
}