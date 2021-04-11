@isTest
public class ScheduleHolidaysLoadingAPI_Test {
    static testMethod void test_Schedulable_Execute(){
     
         Test.startTest();
       // This test runs a scheduled job at 00h00 Every Month
          String CRON_EXP = '0 0 0 1 1/1 ? *';
       // Schedule the test job
       String jobId = System.schedule('Scheduler_Load_Holidays_Test', CRON_EXP, new ScheduleHolidaysLoadingAPI());
          Test.stopTest();  
      // Get the information from the CronTrigger API object 
         CronTrigger ct = [SELECT Id, CronExpression, TimesTriggered, NextFireTime FROM CronTrigger WHERE id = :jobId]; 
      // Verify the job has not run 
      System.assertEquals(0, ct.TimesTriggered); 
      // Verify the next time the job will run  
    
     //the first day of the next month  at 00:00  (myExpectedNextFireTime)
 	DateTime dToday =System.Date.Today();
	datetime nextmonth=dToday.addmonths(1);
 	DateTime dm1 = date.valueof(nextmonth).toStartOfMonth();
	//NextFireTime of the CronTrigger is set by salesforce two hours before the time defined in the CronExpression 
	DateTime myExpectedNextFireTime=dm1.addHours(-2);
	system.debug(myExpectedNextFireTime);
     System.assertEquals(String.valueOf(myExpectedNextFireTime) , String.valueOf(ct.NextFireTime),'error in scheduler');   
    
    }
}