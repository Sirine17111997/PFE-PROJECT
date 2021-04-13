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
             Employee__c	  e  = new Employee__c( Name='test emp', User__c=u.Id);
             insert e;
      	   	 AbsenceManager__c abm = new AbsenceManager__c(Name='test AbsenceManager',Employee__c=e.Id);
             insert abm; 
       		 Absence__c        ab1=new Absence__c(AbsenceManager__c=abm.Id,Approval__c='Ausstehend');
             Absence__c        ab2=new Absence__c(AbsenceManager__c=abm.Id,Approval__c='Erteilt');
             Absence__c        ab3=new Absence__c(AbsenceManager__c=abm.Id,Approval__c='Abgelehnt');
             List<Absence__c>  lstAb =new List<Absence__c>{ab1,ab2,ab3};
             insert lstAb;

			         
             
            MyHoliday__c mhS = new MyHoliday__c(holidayName__c= 'test nameHoliday',localName__c = 'test localNameHoliday ',
                                                              date__c = '08.08.2020',User__c = u.Id);
             
             EventsCategories__c ec1=new EventsCategories__c(label__c='test label_2',color__c='#0101aa',selected__c=false );
             EventsCategories__c ec2=new EventsCategories__c(label__c='test label_1',color__c='#a0aefe',selected__c=true );
             EventsCategories__c ec3=new EventsCategories__c(label__c='test label_3',selected__c=true );
             insert new List<EventsCategories__c>{ec1,ec2,ec3};
         }
    }
    
  static testMethod void test_getAllAbsences(){
         List<Absence__c> abList= EventsAPI.getAllAbsences();
          system.assertEquals(abList.size()>0,true);
    }
  
    static testMethod void test_getUserHolidays(){
        Test.startTest();
         EventsAPI.loadAllHolidays();
         List<MyHoliday__c> hList= EventsAPI.getUserHolidays();
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
           List<EventsCategories__c> lst = [ select Id  from EventsCategories__c ];
           system.assertEquals(lst.size()>0,true);
    }
      static testMethod void test_updateEventsCategories(){
            Test.startTest();
          EventsAPI.updateEventsCategories('#0101aa,#a0aefe');
            Test.stopTest(); 
          List<EventsCategories__c> lstC = [ select Id from EventsCategories__c where selected__c=true];
        //check if two are selected
          system.assertEquals(lstC.size(),2);
    }
   /*  static testMethod void test_deleteAbsenceById(){
        List<Absence__c>  lst1 = [select Id from Absence__c ];
        Test.startTest(); 	
        Absence__c abDel= [select Id from Absence__c][0];
        EventsAPI.deleteAbsenceById(abDel.Id);
        Test.stopTest(); 
        List<Absence__c> lst2 = [select Id from Absence__c];
        system.assertEquals(lst1.size()-lst2.size(),1);
      }*/
    
      static testMethod void test_loadAllHolidays(){
   		 Test.startTest(); 	
          EventsAPI.loadAllHolidays();
         Test.stopTest(); 
         List<MyHoliday__c> lstH = [ SELECT Id FROM MyHoliday__c];
         system.assertEquals(lstH.size()>0,true);
       }
           
   
}