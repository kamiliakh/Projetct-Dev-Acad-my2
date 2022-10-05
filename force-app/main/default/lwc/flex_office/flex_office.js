import { LightningElement, wire, track, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getListSallesWithBureaux from "@salesforce/apex/OfficeReservationController.getListSallesWithBureaux";
import getReservation from "@salesforce/apex/OfficeReservationController.getReservation";
import CUSTOM_OBJECT from "@salesforce/schema/reservation__c";
import createReservation from "@salesforce/apex/LwcCreateReservation.createReservation";
import UpdateReservation from "@salesforce/apex/LwcCreateReservation.UpdateReservation";

import { CloseActionScreenEvent } from "lightning/actions";

import { getRecord } from "lightning/uiRecordApi";
import USER_ID from "@salesforce/user/Id";
import PROFILE_NAME_FIELD from "@salesforce/schema/User.Profile.Name";
//import { getRecord} from 'lightning/uiRecordApi';

export default class flex_office extends LightningElement {
  // @api recordId;

  vfp = "/apex/EditPdfReservation?Id=a0J090000099cZiEAI";
  //url;
  get url() {
    return this.vfp + this.Id;
  }

  setbureau;
  Idvar;

  Salles = [];
  error;
  showSalles = false;
  isError = false;
  MsgError = "";

  showEdit = false;

  @track data;
  @track dataReservation = [];
  @track dataReservationDisplay = [];

  @track reservationRecord = CUSTOM_OBJECT;

  @track autresOptions = [];
  @track optionSalle = [];
  @track optionBureau = [];
  @track value = "";
  ProfileName;

  @track reservationRecordsList;

  @track columns = [
    { label: "Occupant", fieldName: "Occupeur", type: "string" },
    { label: "Salle", fieldName: "Salle", type: "string" },
    { label: "Bureau", fieldName: "Bureau", type: "string" },
    {
      label: "Date De Reservation",
      fieldName: "DateDeReservation",
      type: "string"
    },
    {
      type: "button",
      typeAttributes: {
        label: "Annuler",
        name: "Annuler",
        title: "VAnnuleriew",
        disabled: false,
        value: "Annuler",
        iconPosition: "left"
      }
    }
  ];

  //recuperer le nom du profil
  @wire(getRecord, { recordId: USER_ID, fields: [PROFILE_NAME_FIELD] })
  wiredUser({ error, data }) {
    if (data) {
      console.log(
        "ouffffffffff" +
          JSON.stringify(data.fields.Profile.value.fields.Name.value)
      );
      this.ProfileName = data.fields.Profile.value.fields.Name.value;
    }
    if (error) {
      console.log("error =====> " + JSON.stringify(error));
    }
  }

  @wire(getReservation) reservationRecords({ error, data }) {
    if (data) {
      this.data = data;
      this.dataReservation = Object.keys(this.data).map((item) => ({
        Id: this.data[item].Id,
        Occupeur: this.data[item].Occupeur__r.Name,
        Salle: this.data[item].bureau__r.Salle__r.Libel__c,
        Bureau: this.data[item].bureau__r.Libelle__c,
        DateDeReservation: this.data[item].DateDeReservation__c,
        Idbureau: this.data[item].bureau__c,
        IdOccupeur: this.data[item].Occupeur__c
      }));
      console.log(
        "la date de reservation  est :" + JSON.stringify(this.dataReservation)
      );
      console.log("les bureau sont :" + this.data[0].bureau__r.Libelle__c);
      console.log("les data sonts :" + JSON.stringify(this.data));

      if (this.ProfileName == "Employé") {
        this.dataReservationDisplay = this.dataReservation.filter(
          (item) => item.IdOccupeur == USER_ID
        );
      } else this.dataReservationDisplay = this.dataReservation;

      if (this.ProfileName != "Employé") {
        this.showEdit = false;
      } else this.showEdit = true;
    } else if (error) {
      this.data = undefined;
    }
  }

  @wire(getListSallesWithBureaux)
  wiredSalles({ error, data }) {
    if (data) {
      console.log("###>Data :" + data);

      this.Salles = JSON.parse(data);

      for (let i = 0; i < this.Salles.length; i++) {
        this.optionSalle = [
          ...this.optionSalle,
          { value: this.Salles[i].Id, label: this.Salles[i].Libelle }
        ];
      }

      this.Salles.forEach((optionAutreSalle) => {
        //this.autresOptions.push({value : optionSalle.Id, label : optionSalle.Libelle__c});
        this.autresOptions = [
          ...this.autresOptions,
          { value: optionAutreSalle.Id, label: optionAutreSalle.Libelle }
        ];
      });

      console.log("##>this.optionSalle :" + JSON.stringify(this.optionSalle));

      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.contacts = undefined;
    }
  }

  handlereserve() {
    console.log("je suis la");
    let vdate = this.template.querySelector("[data-field='resdate']").value;
    console.log("###### in querySelector:" + vdate);

    let combobox = this.template.querySelector(
      "[data-id='Bureaux disponibles']"
    );
    let vidbure = combobox ? combobox.value : null;

    console.log("###### bureau xxxxttt:", vidbure);

    createReservation({ dateres: vdate, idres: vidbure })
      .then((result) => {
        console.log("le resultat #######resulllllt " + JSON.stringify(result));

        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success!!",
            message: "la réservation a été creé avec succé!!",
            variant: "success"
          })
        );
      })
      .catch((error) => {
        console.log("oufffffffffff" + JSON.stringify(error));
        this.error = error.message;
      });
    setTimeout(function () {
      location.reload();
    }, 50);
  }

  handleSearchBureau() {
    //renvoit la liste des bureaux dispon,ilbles a cette datte
    console.log(
      "########### la liste des reservation est :" +
        JSON.stringify(this.dataReservation)
    );
    let vdateres = JSON.stringify(this.dataReservation);
    console.log("########### dataReservation" + vdateres);

    let datesaisie = this.template.querySelector(
      "[data-field='resdate']"
    ).value;

    let vdatesaisie = new Date(datesaisie);

    if (vdatesaisie >= new Date()) {
      this.isError = false;
      this.MsgError = "";
      console.log("########### in handleSearchBureau");
      let vdates = this.template.querySelector("[data-field='resdate']").value;
      console.log("###### in querySelector:" + vdates);

      this.showSalles = true;

      let ListResWithDate = this.dataReservation.filter(
        (item) => item.DateDeReservation == vdates
      );
      console.log("###### ListeResWithDate:" + JSON.stringify(ListResWithDate));

      this.setbureau = new Set();

      ListResWithDate.forEach((itemB) => {
        this.setbureau.add(itemB.Idbureau);
      });
      console.log("########### la liste des bureaux:" + this.setbureau);
    } else {
      this.isError = true;
      this.MsgError =
        "Date invalide : veuillez saisir une date supérieur ou égale a la date du jour";
    }
  }

  handleSpinner() {
    this.showSpinner = !this.showSpinner;
  }

  get sallesOptions() {
    console.log(
      "###>get :this.optionSalle :" + JSON.stringify(this.optionSalle)
    );
    return this.optionSalle;
  }

  handleChangeSalle(event) {
    this.selectedSalleValue = event.detail.value;
    console.log("##>This.Salles :" + this.Salles);
    let bureauOption = this.Salles.filter(
      (item) => item.Id == event.detail.value
    );
    console.log("bureauOption :" + JSON.stringify(bureauOption));
    this.optionBureau = [];

    bureauOption[0].Bureaux.forEach((itemBureau) => {
      //this.autresOptions.push({value : optionSalle.Id, label : optionSalle.Libelle__c});
      if (!this.setbureau.has(itemBureau.Id)) {
        this.optionBureau = [
          ...this.optionBureau,
          { value: itemBureau.Id, label: itemBureau.Libelle }
        ];
      }
    });

    //this.optionBureau = bureauOption[0].Bureaux;
    console.log("###> this.optionBureau :" + JSON.stringify(this.optionBureau));
  }

  handleEdit() {
    console.log("je suis dans bouton Edit");
    //eval("$A.get('e.force:refreshView').fire();");
    this.dispatchEvent(new CloseActionScreenEvent());
  }

  handleAnnule(event) {
    // const actionName = event.detail.action.name;
    const row = event.detail.row;
    console.log("je suis rentrer dans le bouton Annuler");
    console.log("L'ID de cette reservation est :  => " + row.Id);
    console.log(
      "la date de cette reservation est :  => " + row.DateDeReservation
    );

    let datederes = row.DateDeReservation;

    console.log("la date de res en string est  :" + datederes);

    var someDate = new Date(datederes);

    someDate.setDate(someDate.getDate() - 2);
    let vToday = new Date();

    console.log("vtodat est :" + vToday);
    console.log("someDate est :" + someDate);
    let Idvart = row.Id;

    if (someDate > vToday) {
      UpdateReservation({ Idresvar: Idvart })
        .then((result) => {
          console.log(
            "le resultat #######resulllllt " + JSON.stringify(result)
          );

          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success!!",
              message: "la réservation a été annulée!",
              variant: "success"
            })
          );
        })
        .catch((error) => {
          console.log("oufffffffffff" + JSON.stringify(error));
          this.error = error.message;
        });
      setTimeout(function () {
        location.reload();
      }, 50);
    } else {
      this.isError = true;
      this.MsgError = "L'annulation se fait au plus tard 48h a l'avance !";
    }
  }
}
