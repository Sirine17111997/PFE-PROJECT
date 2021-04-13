public with sharing class AbsenceController{
	@AuraEnabled(cacheable = true)
	public static List<AbsenceManagerWrapper> getTreeData(){
		List<AbsenceManager__c> absM = [Select ID, Name, employee__r.Name, (select ID, Name, StartDate__c, EndDate__c
		                                                                    from Absences__r)
		                                from AbsenceManager__c];//where year__c='2020'
		List<AbsenceManagerWrapper> aooo = new List<AbsenceManagerWrapper>();
		for (AbsenceManager__c a : absM){
			AbsenceManagerWrapper aWraper = new AbsenceManagerWrapper();
			aWraper.name = 'E' + a.ID;
			aWraper.label = a.employee__r.Name;
			aWraper.expanded = true;
			aWraper.disabled = true;
			List<Items> co = new List<Items>();
			for (Absence__c c : a.Absences__r){
				Items conWrapp = new Items();
				conWrapp.name = c.ID;
				conWrapp.label = c.Name;
				// conWrapp.label = String.valueOf(c.StartDate__c);
				conWrapp.StartDate = String.valueOf(c.StartDate__c);
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
	public static List<Absence__c> getAbsencesForApproval(){
		List<Absence__c> absences;
		absences = [select ID, Name, absencemanager__r.employee__r.Name, StartDate__c, EndDate__c, Reason__c, Note__c, Certificate__c, Workdays__c
		            from Absence__c
		            where Approval__c = 'Ausstehend'];
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