public with sharing class EventsAPI{
	//called once a every week in a schedule apex
	public static void loadAllHolidays(){
		List<MyHoliday> results = new List<MyHoliday>();
		List<User> usersInfo = [SELECT Id, Country, State, Username, LastName
		                        FROM User
		                        where Country != null];
		List<MyHoliday__c> mhLst = new List<MyHoliday__c>();
		for (User u : usersInfo){
			List<Object> lstObj = new List<Object>();
			Integer currentYear = System.today().year();
			//StaticResource sr= [select id,body from StaticResource Where Name = 'Holidays_2021_DE'];
			//lstObj= (List<Object>)JSON.deserializeUntyped(sr.body.toString());
			if (Test.isRunningTest()){ 
				StaticResource sr = [select id, body
				                     from StaticResource
				                     Where Name = 'Holidays_2020_DE'];
				lstObj = (List<Object>)JSON.deserializeUntyped(sr.body.toString());
			} else{
				HttpResponse response = Public_Holidays_REST_API('https://date.nager.at/api/v2/PublicHolidays/'+String.valueOf(currentYear + '/' + u.Country),'GET');
				if (response.getStatusCode() == 200){
					lstObj = (List<Object>)JSON.deserializeUntyped(response.getBody());
				}
			}
			for (Object fld : lstObj){
				Map<String, Object> data = (Map<String, Object>)fld;
				MyHoliday mh = new MyHoliday();
				mh.userID = u.Id;
				mh.dateHoliday = (String)data.get('date');
				mh.nameHoliday = (String)data.get('name');
				mh.localNameHoliday = (String)data.get('localName');
				mh.countryCode = (String)data.get('countryCode');
				if (data.get('counties') != null){
					Object lstobjCnt = (Object)data.get('counties');
					List<String> lstCountiesStr = string.valueof(lstobjCnt).split(',');
					List<String> lst = new List<String>();
					for (String str : lstCountiesStr){
						str = str.replace(u.Country + '-', '');
						lst.add(str);
					}
					if (lst.contains(u.State)){
						mh.stateCode = u.State;
						results.add(mh);
					} else{
						results.add(mh);
					}
				} else{
					results.add(mh);
				}
			}
			for (MyHoliday res : results){
				if (Schema.sObjectType.MyHoliday__c.fields.holidayName__c.isCreateable() && Schema.sObjectType.MyHoliday__c.fields.localName__c.isCreateable() && Schema.sObjectType.MyHoliday__c.fields.date__c.isCreateable() && Schema.sObjectType.MyHoliday__c.fields.User__c.isCreateable()){
					MyHoliday__c mhS = new MyHoliday__c(holidayName__c = res.nameHoliday, localName__c = res.localNameHoliday, date__c = res.dateHoliday, User__c = u.Id);
					if (mhS != null){
						mhLst.add(mhS);
					}
				}
			}
		}
		if (mhLst.size() > 0){
			Database.insert(mhLst, false);
		}
	}

	public static HttpResponse Public_Holidays_REST_API(String endpoint, String method){
		Http http = new Http();
		HttpRequest request = new HttpRequest();
		request.setEndpoint(endpoint);
		request.setMethod(method);
		return http.send(request);
	}

	@AuraEnabled
	public static List<MyHoliday__c> getUserHolidays(){
		ID userId = UserInfo.getUserId();
		List<MyHoliday__c> result = new List<MyHoliday__c>();
		List<AggregateResult> lstRes = [SELECT holidayName__c, date__c, count(Name) cnt__c
		                                FROM MyHoliday__c
		                                WHERE User__c = :userId
		                                GROUP BY holidayName__c, date__c];
		for (AggregateResult ar : lstRes){
			MyHoliday__c mh = new MyHoliday__c();
			mh.holidayName__c = (String)ar.get('holidayName__c');
			mh.date__c = (String)ar.get('date__c');
			result.add(mh);
		}

		return result;
	}

	//get all absences (cacheable = true)
	@AuraEnabled
	public static List<Absence__c> getAllAbsences(){
		List<Absence__c> lstAbsences = [SELECT Id, StartDate__c, EndDate__c, Reason__c, Approval__c, Certificate__c, AbsenceManager__c, Note__c, Workdays__c, DangerToEmployees__c
		                                FROM Absence__c];

		return lstAbsences;
	}

	/*
	//get absences by employee
	 @AuraEnabled(cacheable = true)
	 public static List<Absence__c> getUserAbsences(){
	 Employee__c emp =[select Id,Name from  Employee__c
	//where Id=:empId
	 where Id='a003z00000t7BwIAAU'
	 limit 1];
	 List<Absence__c> lstAbsences = new List<Absence__c>();
	 string current_year=string.valueOf(System.Today().year());
	 AbsenceManager__c absenceManager = [select ID, (
	 select ID, Approval__c, Reason__c, StartDate__c, EndDate__c
	 from Absences__r)
	 from AbsenceManager__c
	 where year__c =:current_year
	//and employee__r.Name = :emp.Name
	 limit 1];


	 for (Absence__c absence : absenceManager.Absences__r){
	 lstAbsences.add(absence);
	 }
	 System.debug(lstAbsences);
	 return lstAbsences;
	 }
	 */
	//get events  categories for the connected user
	@AuraEnabled
	public static List<EventsCategories__c> getEventsCategories(){
		// ID userId = UserInfo.getUserId();
		List<EventsCategories__c> result = [select Id, Name, label__c, color__c, selected__c
		                                    from EventsCategories__c];
		return result;
	}

	//update events selection for the connected user
	@AuraEnabled
	public static void updateEventsCategories(String eventsColors){
		List<String> lstEvents = new List<String>();
		lstEvents = eventsColors.split(',');
		List<EventsCategories__c> lst = [select Id, color__c, selected__c
		                                 from EventsCategories__c];
		for (EventsCategories__c elem : lst){
			if (lstEvents.contains(elem.color__c)){
				elem.selected__c = true;
			} else{
				elem.selected__c = false;
			}
		}
		update lst;
	}

	/*//delete absence by id
	 @AuraEnabled
	 public static void deleteAbsenceById(String idDelete){
	 List<Absence__c> lstAbs= [select Id  from Absence__c where Id =: idDelete];
	 delete lstAbs;
	 }*/
	//update duration  by idUpdate , newStart and newEnd
	@AuraEnabled
	public static void updateAbsenceDuration(String idUpdate, String startDate, String endDate){
		List<Absence__c> lstAbs = [select Id, StartDate__c, EndDate__c
		                           from Absence__c
		                           where Id = :idUpdate];
		Date d1 = date.valueOf(startDate);
		Date d2 = date.valueOf(endDate);
		if (Schema.sObjectType.Absence__c.fields.StartDate__c.isUpdateable() && Schema.sObjectType.Absence__c.fields.EndDate__c.isUpdateable()){
			lstAbs[0].StartDate__c = d1;
			lstAbs[0].EndDate__c = d2;
			update lstAbs;
		}
	}

	public class MyHoliday{
		public MyHoliday(){
		}

		public String userID{ get; set; }

		public String dateHoliday{ get; set; }

		public String nameHoliday{ get; set; }

		public String localNameHoliday{ get; set; }

		public String countryCode{ get; set; }

		public String stateCode{ get; set; }
	}
}