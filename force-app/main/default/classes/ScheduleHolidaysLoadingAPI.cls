global with sharing class ScheduleHolidaysLoadingAPI implements Schedulable  {
    global void execute(SchedulableContext ctx) {
  	 EventsAPI.loadAllHolidays();
    }
    
   
}