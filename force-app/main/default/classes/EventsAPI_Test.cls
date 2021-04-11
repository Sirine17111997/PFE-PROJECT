@isTest
public class EventsAPI_Test {
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
    	u.Country='DE';
		u.State ='BW';
         insert u;
         System.runAs(u) {
             cm_bm__Employee__c	  e  = new cm_bm__Employee__c( Name='test emp', User__c=u.Id);
             insert e;
      	   	 cm_bm__AbsenceManager__c abm = new cm_bm__AbsenceManager__c(Name='test AbsenceManager',cm_bm__Employee__c=e.Id);
             insert abm; 
       		 cm_bm__Absence__c        ab1=new cm_bm__Absence__c(cm_bm__AbsenceManager__c=abm.Id,cm_bm__Approval__c='Ausstehend');
             cm_bm__Absence__c        ab2=new cm_bm__Absence__c(cm_bm__AbsenceManager__c=abm.Id,cm_bm__Approval__c='Erteilt');
             cm_bm__Absence__c        ab3=new cm_bm__Absence__c(cm_bm__AbsenceManager__c=abm.Id,cm_bm__Approval__c='Abgelehnt');
             List<cm_bm__Absence__c>  lstAb =new List<cm_bm__Absence__c>{ab1,ab2,ab3};
             insert lstAb;

			         
             
            cm_bm__MyHoliday__c mhS = new cm_bm__MyHoliday__c(holidayName__c= 'test nameHoliday',localName__c = 'test localNameHoliday ',
                                                              date__c = '08.08.2020',User__c = u.Id);
             
             cm_bm__EventsCategories__c ec1=new cm_bm__EventsCategories__c(cm_bm__label__c='test label_2',cm_bm__color__c='#0101aa',cm_bm__selected__c=false );
             cm_bm__EventsCategories__c ec2=new cm_bm__EventsCategories__c(cm_bm__label__c='test label_1',cm_bm__color__c='#a0aefe',cm_bm__selected__c=true );
             cm_bm__EventsCategories__c ec3=new cm_bm__EventsCategories__c(cm_bm__label__c='test label_3',cm_bm__selected__c=true );
             insert new List<cm_bm__EventsCategories__c>{ec1,ec2,ec3};
         }
    }
    
  static testMethod void test_getAllAbsences(){
         List<cm_bm__Absence__c> abList= EventsAPI.getAllAbsences();
          system.assertEquals(abList.size()>0,true);
    }
  
    static testMethod void test_getUserHolidays(){
        Test.startTest();
         EventsAPI.loadAllHolidays();
         List<cm_bm__MyHoliday__c> hList= EventsAPI.getUserHolidays();
        Test.stopTest(); 
        system.assertEquals(hList.size()>0,true);
    }
     static testMethod void test_MyHoliday(){
         Test.startTest();
        EventsAPI.MyHoliday mh = new EventsAPI.MyHoliday();
            mh.userID=UserInfo.getUserId();
			mh.dateHoliday= '08.08.2020'; 
			mh.nameHoliday='test nameHoliday'; 
			mh.localNameHoliday='test localNameHoliday '; 
			mh.countryCode='DE'; 
			mh.stateCode='BW'; 
           Test.stopTest(); 
    		system.assertEquals(mh!=null,true);
    }
       static testMethod void test_getEventsCategories(){
      		  Test.startTest();
           EventsAPI.getEventsCategories();
              Test.stopTest(); 
           List<cm_bm__EventsCategories__c> lst = [ select Id  from cm_bm__EventsCategories__c ];
           system.assertEquals(lst.size()>0,true);
    }
      static testMethod void test_updateEventsCategories(){
            Test.startTest();
          EventsAPI.updateEventsCategories('#0101aa,#a0aefe');
            Test.stopTest(); 
          List<cm_bm__EventsCategories__c> lstC = [ select Id from cm_bm__EventsCategories__c where cm_bm__selected__c=true];
        //check if two are selected
          system.assertEquals(lstC.size(),2);
    }
   /*  static testMethod void test_deleteAbsenceById(){
        List<cm_bm__Absence__c>  lst1 = [select Id from cm_bm__Absence__c ];
        Test.startTest(); 	
        cm_bm__Absence__c abDel= [select Id from cm_bm__Absence__c][0];
        EventsAPI.deleteAbsenceById(abDel.Id);
        Test.stopTest(); 
        List<cm_bm__Absence__c> lst2 = [select Id from cm_bm__Absence__c];
        system.assertEquals(lst1.size()-lst2.size(),1);
      }*/
    
      static testMethod void test_loadAllHolidays(){
   		 Test.startTest(); 	
          EventsAPI.loadAllHolidays();
         Test.stopTest(); 
         List<cm_bm__MyHoliday__c> lstH = [ SELECT Id FROM cm_bm__MyHoliday__c];
         system.assertEquals(lstH.size()>0,true);
       }
           
   
}