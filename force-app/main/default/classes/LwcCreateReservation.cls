public with sharing class LwcCreateReservation {
    string Idvar ;

    @AuraEnabled
    public static  Reservation__c createReservation(string dateres , string idres ) {
        Reservation__c v = new Reservation__c () ;
        v.status__c = 'validée' ;
        v.DateDeReservation__c = Date.valueOf(dateres) ;
        v.Bureau__c = Id.valueOf(idres) ;
        v.Occupeur__c = UserInfo.getUserId();

             insert v;
             return v ;
    }
     

    @AuraEnabled

    public static  Reservation__c UpdateReservation(string Idresvar ) {
        string Idvart ;
        Idvart= Idresvar ;
        Reservation__c vres = new Reservation__c () ;
        vres.status__c = 'Annulée' ;
          vres.Id = Id.valueOf(Idresvar);
             update vres ;
             return vres;
    }  
}



