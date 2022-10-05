public with sharing class GetRecords {


    @AuraEnabled(cacheable=true)
    public static List<Salle__c> getinfo() {
        List<Salle__c> lisesalle =[ SELECT Id,Libel__c,ville__c, (SELECT Id,Libelle__c FROM bureaux__r)
                                    FROM Salle__c
                                    LIMIT 10] ;

                                    
   return lisesalle ;
    }

}