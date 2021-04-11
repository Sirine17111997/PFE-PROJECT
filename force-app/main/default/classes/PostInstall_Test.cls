@isTest
public class PostInstall_Test {
 static testMethod void test_Schedulable_onInstall(){
          Test.startTest();
		PostInstall postinstall = new PostInstall();
		Test.testInstall(postinstall,  new Version(1, 0));
           Test.stopTest(); 
     
     
       List<cm_bm__MyHoliday__c> lstH = [ SELECT Id FROM cm_bm__MyHoliday__c];
       system.assertEquals(lstH.size()>0,true);
       
    }
}