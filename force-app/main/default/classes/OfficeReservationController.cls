public with sharing class OfficeReservationController {
  @AuraEnabled(cacheable=true)
  public static List<Reservation__c> getReservation() {
    return [
      SELECT
        Name,
        id,
        DateDeReservation__c,
        Occupeur__r.name,
        bureau__r.Libelle__c,
        bureau__r.Salle__r.Libel__c,
        bureau__c,
        Occupeur__c
      FROM Reservation__c
      WHERE DateDeReservation__c >= TODAY AND status__c = 'validée'
    ];
  }

  @AuraEnabled(cacheable=true)
  public static string getListSallesWithBureaux() {
    //SELECT Id,Libel__c,ville__c, (SELECT Id,Libel__c FROM bureaux__r)FROM Salle__c

    //return  JSON.Serialize([select id, Libel__c, Ville__c ,(select Id, Libel__c from Bureaux__r) from Salle__c ]);
    List<SallesWrapper> vListSallesWrapper = new List<SallesWrapper>();

    //recuperer la liste des salles existantes avec les bureaux reliés
    for (Salle__c salleItem : [
      SELECT Id, Libel__c, Ville__c, (SELECT Id, Libelle__c FROM Bureaux__r)
      FROM Salle__c
    ]) {
      SallesWrapper vSallesWrapper = new SallesWrapper();
      vSallesWrapper.Id = salleItem.Id;
      vSallesWrapper.Libelle = salleItem.Libel__c;
      //   vSallesWrapper.Ville = salleItem.Ville__c;

      for (Bureau__c bureauItem : salleItem.Bureaux__r) {
        if (null == vSallesWrapper.Bureaux)
          vSallesWrapper.Bureaux = new List<BureauWrapper>();

        BureauWrapper vBureauRap = new BureauWrapper();
        vBureauRap.Id = bureauItem.Id;
        vBureauRap.Libelle = bureauItem.Libelle__c;
        vSallesWrapper.Bureaux.add(vBureauRap);
      }

      vListSallesWrapper.add(vSallesWrapper);
    }

    system.debug('###>vListSallesWrapper :' + vListSallesWrapper);

    return JSON.serialize(vListSallesWrapper);
  }

  public class SallesWrapper {
    @auraenabled
    public string Libelle { get; set; }
    @auraenabled
    public string Ville { get; set; }
    @auraenabled
    public Id Id { get; set; }
    @AuraEnabled
    public List<BureauWrapper> Bureaux { get; set; }
  }

  public class BureauWrapper {
    @auraenabled
    public string Libelle { get; set; }
    @auraenabled
    public Id Id { get; set; }
  }

  @AuraEnabled(cacheable=true)
  public static List<Salle__c> getinfo() {
    List<Salle__c> lisesalle = [
      SELECT Id, Libel__c, ville__c, (SELECT Id, Libelle__c FROM bureaux__r)
      FROM Salle__c
      LIMIT 10
    ];

    return lisesalle;
  }
}
