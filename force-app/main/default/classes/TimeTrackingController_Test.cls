@isTest
public class TimeTrackingController_Test {

    
    static testMethod void test_getUnfinishedTimeEntries(){
		Test.startTest(); 	
         cm_bm__TimeEntry__c te=new cm_bm__TimeEntry__c(cm_bm__DailyRate__c=100.0,OwnerId=UserInfo.getUserId() , cm_bm__End__c=null, cm_bm__Start__c= DateTime.newInstance(2021,03,10,12, 45, 56));   
        	insert te;
       		TimeTrackingController.getUnfinishedTimeEntries();
         Test.stopTest(); 
        
   List<cm_bm__TimeEntry__c> lstTE= [SELECT Id FROM cm_bm__TimeEntry__c WHERE cm_bm__End__c = null];
      
         system.assertEquals(lstTE.size()>0,true);
   }

}