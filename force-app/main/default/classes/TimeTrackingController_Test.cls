@isTest
public class TimeTrackingController_Test {

    
    static testMethod void test_getUnfinishedTimeEntries(){
		Test.startTest(); 	
         TimeEntry__c te=new TimeEntry__c(DailyRate__c=100.0,OwnerId=UserInfo.getUserId() , End__c=null, Start__c= DateTime.newInstance(2021,03,10,12, 45, 56));   
        	insert te;
       		TimeTrackingController.getUnfinishedTimeEntries();
         Test.stopTest(); 
        
   List<TimeEntry__c> lstTE= [SELECT Id FROM TimeEntry__c WHERE End__c = null];
      
         system.assertEquals(lstTE.size()>0,true);
   }

}