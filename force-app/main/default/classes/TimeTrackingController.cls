/** @Description
*   Static UI API for time tracking functionality */
public with sharing class TimeTrackingController {

    /** @Description
    *   Retrieves List of non-ended / unfinished time entries (Ids only) for the current user.
    *   The Time Entries are ordered by created date (most recent first)
    *
    *   @return             List of unfinished Time Entries.
    */
    @AuraEnabled(cacheable=false)
    public static List<TimeEntry__c> getUnfinishedTimeEntries(){
        return [SELECT Id
                FROM TimeEntry__c WHERE OwnerId = :UserInfo.getUserId() AND End__c = null
                ORDER BY CreatedDate DESC];
    }
    
@AuraEnabled(cacheable=true)
    public static List<Project_Team_Member__c> getProjectTeamMember(String projectId) {
        return [SELECT Id, Name,Project__r.Name from Project_Team_Member__c where Project__r.id = :projectId];
    }
    
}