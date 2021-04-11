public with sharing class AbsenceController{
	@AuraEnabled(cacheable = true)
	public static List<AbsenceManagerWrapper> getTreeData(){
		List<cm_bm__AbsenceManager__c> absM = [Select ID, Name, employee__r.Name, (select ID, Name, cm_bm__StartDate__c, cm_bm__EndDate__c
		                                                                    from cm_bm__Absences__r)
		                                from cm_bm__AbsenceManager__c];//where year__c='2020'
		List<AbsenceManagerWrapper> aooo = new List<AbsenceManagerWrapper>();
		for (cm_bm__AbsenceManager__c a : absM){
			AbsenceManagerWrapper aWraper = new AbsenceManagerWrapper();
			aWraper.name = 'E' + a.ID;
			aWraper.label = a.employee__r.Name;
			aWraper.expanded = true;
			aWraper.disabled = true;
			List<Items> co = new List<Items>();
			for (cm_bm__Absence__c c : a.cm_bm__Absences__r){
				Items conWrapp = new Items();
				conWrapp.name = c.ID;
				conWrapp.label = c.Name;
				// conWrapp.label = String.valueOf(c.cm_bm__StartDate__c);
				conWrapp.StartDate = String.valueOf(c.cm_bm__StartDate__c);
				conWrapp.expanded = true;
				aWraper.disabled = false;
				co.add(conWrapp);
				system.debug(co);
			}
			aWraper.items = co;
			aooo.add(aWraper);
		}
		system.debug(aooo);
		return aooo;
	}

	@AuraEnabled(cacheable = true)
	public static List<cm_bm__Absence__c> getAbsencesForApproval(){
		List<cm_bm__Absence__c> absences;
		absences = [select ID, Name, absencemanager__r.employee__r.Name, cm_bm__StartDate__c, cm_bm__EndDate__c, cm_bm__Reason__c, Note__c, cm_bm__Certificate__c, cm_bm__Workdays__c
		            from cm_bm__Absence__c
		            where cm_bm__Approval__c = 'Ausstehend'];
		return absences;
	}

	public Class AbsenceManagerWrapper{
		@AuraEnabled
		public String name{ get; set; }

		@AuraEnabled
		public String label{ get; set; }

		@AuraEnabled
		public Boolean expanded{ get; set; }

		@AuraEnabled
		public Boolean disabled{ get; set; }

		@AuraEnabled
		public List<Items> items{ get; set; }
	}

	public Class Items{
		@AuraEnabled
		public String name{ get; set; }

		@AuraEnabled
		public String label{ get; set; }

		@AuraEnabled
		public String StartDate{ get; set; }

		@AuraEnabled
		public Boolean expanded{ get; set; }

		@AuraEnabled
		public Boolean disabled{ get; set; }
	}
}