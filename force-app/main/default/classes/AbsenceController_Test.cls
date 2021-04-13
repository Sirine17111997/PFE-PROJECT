@isTest
public class AbsenceController_Test {

     @testSetup static void setup() {
     
		Profile profile_admin=[SELECT Id, Name FROM Profile where Name ='System Administrator' limit 1][0];
		User u = new user();
		
        u.Alias = 'admin';
        u.LastName = 'LastName 123abc';
		u.Email = 'abc@testmail.com';
		u.Username = 'xyz@mailtest.com';
		u.CommunityNickname = 'BT123';
		u.LocaleSidKey = 'en_US';
		u.TimeZoneSidKey = 'GMT';
		u.ProfileID = profile_admin.Id;
		u.LanguageLocaleKey = 'en_US';
		u.EmailEncodingKey = 'UTF-8';
		
         insert u;
         System.runAs(u) {
         Employee__c	  e  = new Employee__c( Name='test emp', User__c=u.Id);
             insert e;
      	 AbsenceManager__c abm = new AbsenceManager__c(Name='test AbsenceManager',Employee__c=e.Id);
              insert abm;
         Absence__c        ab=new Absence__c(AbsenceManager__c=abm.Id,Approval__c='Ausstehend');
              insert ab;
             
         }
    }
    
       static testMethod void test_Items_AbsenceManagerWrapper(){
		AbsenceController.Items itm=new AbsenceController.Items();
    		itm.name = 'test item name';
			itm.label ='test item label';
			itm.expanded=true;
			itm.disabled=true;
		AbsenceController.AbsenceManagerWrapper amw=new AbsenceController.AbsenceManagerWrapper();
            amw.name='test AbsenceManagerWrapper name ';
			amw.label='test AbsenceManagerWrapper label';
			amw.expanded=true;
			amw.disabled=true;
            amw.items=new List<AbsenceController.Items>{itm};   
                  system.assertEquals(amw!=null,true);            
               }
    static testMethod void test_getTreeData(){
    	   List<AbsenceController.AbsenceManagerWrapper> result= AbsenceController.getTreeData();
    		system.assertEquals(result.size(),1);
    }
        static testMethod void test_getAbsencesForApproval(){
    	   List<Absence__c> result= AbsenceController.getAbsencesForApproval();
    		system.assertEquals(result.size(),1);
    }
}