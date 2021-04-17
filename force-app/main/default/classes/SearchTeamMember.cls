public with sharing class SearchTeamMember {
    public SearchTeamMember() {}

    @AuraEnabled(cacheable=true)
    public static List<OpportunityTeamMember> getOpportunityTM(String searchText){
        System.debug('opp=' +searchText);
        List<OpportunityTeamMember> opp = Database.query('SELECT Id,Name from OpportunityTeamMember WHERE Name LIKE \'%' + searchText +'%\' ');
        System.debug('opp=' +opp);
        return opp;
    }
    @AuraEnabled(cacheable=true)
    public static List<Project_Team_Member__c> getProjectsTM(String searchText){
        System.debug('projects=' +searchText);
        List<Project_Team_Member__c> projects = Database.query('SELECT Id, Name from Project_Team_Member__c WHERE Name LIKE \'%' + searchText +'%\' ');
        System.debug('projects=' +projects);
        return projects;
    }
}