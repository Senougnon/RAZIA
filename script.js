// Initialisez Firebase (remplacez les valeurs par vos propres identifiants)
var firebaseConfig = {
  apiKey: "AIzaSyDTxa2nD-EVgmSRrHWciqs7xdOkp12t5yA",
  authDomain: "razia-sarl.firebaseapp.com",
  databaseURL: "https://razia-sarl-default-rtdb.firebaseio.com",
  projectId: "razia-sarl",
  storageBucket: "razia-sarl.appspot.com",
  messagingSenderId: "490482635351",
  appId: "1:490482635351:web:fc82421e1907576a090912",
  measurementId: "G-Q2EWH7HJ8T"
};
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var produitsRef = database.ref('produits'); // Référence à la collection 'produits'
var debiteursRef = database.ref('debiteurs'); // Référence à la collection 'debiteurs'
var stocksRef = database.ref('stocks'); // Référence à la collection 'stocks'

// Fonction pour ajouter un produit (modifiée pour ajouter le debiteur)
function ajouterProduit() {
  // Vérifier si tous les champs sont remplis
  var inputs = document.getElementById("productForm").querySelectorAll("input, select");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      alert("Veuillez remplir tous les champs du formulaire.");
      return; // Arrêter l'exécution de la fonction
    }
  }

  // Afficher la barre de chargement
  document.getElementById("loadingBar").style.width = "0%";

  var productData = {
    date: document.getElementById("date").value,
    quantite: document.getElementById("quantite").value,
    designation: document.getElementById("designation").value,
    typeArticle: document.getElementById("typeArticle").value,
    categorie: document.getElementById("categorie").value,
    prixVente: document.getElementById("prixVente").value,
    RAP: document.getElementById("RAP").value,
    netBrut: document.getElementById("netBrut").value,
    prixBrut: document.getElementById("prixBrut").value,
    taux: document.getElementById("taux").value,
    freight: document.getElementById("freight").value,
    douaneTransport: document.getElementById("douaneTransport").value,
    fraisTransfert: document.getElementById("fraisTransfert").value,
    impotDocument: document.getElementById("impotDocument").value,
    reparation: document.getElementById("reparation").value,
    typeClient: document.getElementById("typeClient").value,
    ville: document.getElementById("ville").value,
    numeroTelephone: document.getElementById("numeroTelephone").value,
    commande: document.getElementById("commande").value,
    coutReviens: parseFloat(document.getElementById("coutReviens").value) || 0, // Ajout du champ coutReviens
    margeBenefice: parseFloat(document.getElementById("margeBenefice").value) || 0, // Ajout du champ margeBenefice
  };

  produitsRef.push(productData)
    .then(function () {
      // Animer la barre de chargement
      document.getElementById("loadingBar").style.width = "100%";

      // Attendre une courte durée pour que l'animation se termine
      setTimeout(function () {
        alert("Produit ajouté avec succès !");
        document.getElementById("productForm").reset();
        document.getElementById("loadingBar").style.width = "0%";
        // Réinitialiser la barre de chargement
        mettreAJourStocks(productData.designation, productData.quantite);

        // Vérifier si RAP > 0 pour ajouter un debiteur
        if (parseFloat(productData.RAP) > 0) {
          // Ajouter le debiteur à la liste des debiteurs après l'ajout du produit
          debiteursRef.push({
            date: productData.date,
            designation: productData.designation,
            numeroTelephone: productData.numeroTelephone,
            RAP: productData.RAP
          });
        }

        // Actualiser l'analyse après l'ajout d'un produit
        analyserProduits();
      }, 500); // Attendre 500 millisecondes (0.5 seconde)
    })
    .catch(function (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      alert("Une erreur est survenue.");
      document.getElementById("loadingBar").style.width = "0%"; // Réinitialiser la barre de chargement en cas d'erreur
    });
}

function afficherDetails() {
  masquerToutesSections();
  document.getElementById("detailsSection").style.display = "block";
  remplirTableau();
}

function remplirTableau() {
  var productTable = document.getElementById("produitTable").getElementsByTagName('tbody')[0];
  productTable.innerHTML = ''; // Effacer le contenu du tableau

  var moisPrecedent = null; // Variable pour suivre le mois précédent

  database.ref('produits').orderByChild('date').once('value') // Supprimer la limite limitToLast(100)
    .then(function (snapshot) {
      var produits = []; // Tableau pour stocker les produits
      snapshot.forEach(function (childSnapshot) {
        produits.push(childSnapshot.val());
      });

      // Inverser l'ordre des produits
      produits.reverse();

      // Parcourir les produits inversés
      produits.forEach(function (product) {
        var date = new Date(product.date);
        var moisActuel = date.getMonth(); // 0 pour janvier, 1 pour février, etc.

        // Ajouter une ligne de séparation si le mois a changé
        if (moisPrecedent !== null && moisActuel !== moisPrecedent) {
          var separatorRow = productTable.insertRow();
          separatorRow.classList.add('separateur-mois'); // Ajouter la classe CSS pour le style
          var emptyCell = separatorRow.insertCell();
          emptyCell.setAttribute('colspan', 22); // Fusionner les cellules pour couvrir toute la ligne
        }

        var row = productTable.insertRow();

        // Date
        var dateCell = row.insertCell();
        dateCell.textContent = product.date;

        // Quantité
        var quantiteCell = row.insertCell();
        quantiteCell.textContent = product.quantite;

        // Désignation
        var designationCell = row.insertCell();
        designationCell.textContent = product.designation;

        // Type d'Article
        var typeArticleCell = row.insertCell();
        typeArticleCell.textContent = product.typeArticle;

        // Catégorie
        var categorieCell = row.insertCell();
        categorieCell.textContent = product.categorie;

        // Prix de vente
        var prixVenteCell = row.insertCell();
        prixVenteCell.textContent = product.prixVente;

        // RAP
        var RAPCell = row.insertCell();
        RAPCell.textContent = product.RAP;

        // Prix Brut
        var prixBrutCell = row.insertCell();
        prixBrutCell.textContent = product.prixBrut;

        // Taux
        var tauxCell = row.insertCell();
        tauxCell.textContent = product.taux;

        // Prix Net
        var netBrutCell = row.insertCell();
        netBrutCell.textContent = product.netBrut;

        // Freight
        var freightCell = row.insertCell();
        freightCell.textContent = product.freight;

        // Douane et Transport
        var douaneTransportCell = row.insertCell();
        douaneTransportCell.textContent = product.douaneTransport;

        // Frais de transfert et Tenue de Compte
        var fraisTransfertCell = row.insertCell();
        fraisTransfertCell.textContent = product.fraisTransfert;

        // Impôt et Document
        var impotDocumentCell = row.insertCell();
        impotDocumentCell.textContent = product.impotDocument;

        // Réparation
        var reparationCell = row.insertCell();
        reparationCell.textContent = product.reparation;

        // Calculer le total des dépenses
        var totalDepenses = parseFloat(product.freight) +
          parseFloat(product.douaneTransport) +
          parseFloat(product.fraisTransfert) +
          parseFloat(product.impotDocument) +
          parseFloat(product.reparation);

        // Total
        var totalCell = row.insertCell();
        totalCell.textContent = totalDepenses.toFixed(2); // Afficher le total avec 2 décimales

        // Coût de Reviens du Produit
        var coutReviensCell = row.insertCell();
        coutReviensCell.textContent = product.coutReviens;

        // Marge Bénéfice
        var margeBeneficeCell = row.insertCell();
        margeBeneficeCell.textContent = product.margeBenefice;

        // Type de Client
        var typeClientCell = row.insertCell();
        typeClientCell.textContent = product.typeClient;

        // Ville
        var villeCell = row.insertCell();
        villeCell.textContent = product.ville;

        // Commande
        var commandeCell = row.insertCell();
        commandeCell.textContent = product.commande;

        // Numéro de Téléphone
        var numeroTelephoneCell = row.insertCell();
        numeroTelephoneCell.textContent = product.numeroTelephone;
        // Ajout d'un attribut pour le statut RAP
        numeroTelephoneCell.setAttribute('data-rap-status', product.RAP > 0 ? 'red' : 'black');

        // Ajouter les icônes de suppression et de modification
        var actionsCell = row.insertCell();
        var iconContainer = document.createElement("div");
        iconContainer.classList.add("icon-container");

        // Icône de suppression
        var iconDelete = document.createElement("i");
        iconDelete.classList.add("fas", "fa-trash", "icon-delete");
        iconDelete.onclick = function () {
          if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            // Supprimer le produit de Firebase
            produitsRef.child(childSnapshot.key).remove()
              .then(function () {
                // Mettre à jour le tableau des produits
                remplirTableau();

                // Supprimer le debiteur associé si nécessaire
                if (parseFloat(product.RAP) > 0) {
                  debiteursRef.orderByChild('numeroTelephone').equalTo(product.numeroTelephone).once('value',
                    function (debiteurSnapshot) {
                      if (debiteurSnapshot.exists()) {
                        debiteurSnapshot.forEach(function (debiteurChildSnapshot) {
                          debiteursRef.child(debiteurChildSnapshot.key).remove();
                        });
                      }
                    });
                }

                // Mettre à jour le tableau des debiteurs
                remplirTableauDebiteurs();

                // Mettre à jour le tableau des stocks
                mettreAJourStocks(product.designation, -product.quantite); // Quantité négative pour soustraire
                remplirTableauStocks();

                // Actualiser l'analyse après la suppression d'un produit
                analyserProduits();

                alert("Produit supprimé avec succès !");
              })
              .catch(function (error) {
                console.error("Erreur lors de la suppression du produit:", error);
                alert("Une erreur est survenue.");
              });
          }
        };
        iconContainer.appendChild(iconDelete);

        // Icône de modification
        var iconEdit = document.createElement("i");
        iconEdit.classList.add("fas", "fa-edit", "icon-edit");
        iconEdit.onclick = function () {
          ouvrirModalProduit(childSnapshot.key, product);
        };
        iconContainer.appendChild(iconEdit);

        actionsCell.appendChild(iconContainer);

        moisPrecedent = moisActuel; // Mettre à jour le mois précédent
      });
    })
    .catch(function (error) {
      console.error("Erreur lors de la récupération des détails des produits:", error);
      alert("Une erreur est survenue.");
    });
}

var tendanceChart = null; // Variable pour stocker l'objet du graphique

function afficherTendances() {
  masquerToutesSections();
  document.getElementById("tendancesSection").style.display = "block";
  creerGraphique(); // Créer le graphique
}

function creerGraphique() {
  // Récupérer les données de Firebase pour le graphique
  produitsRef.on('value', function (snapshot) {
    var labels = [];
    var quantiteData = [];
    var commandeData = [];
    var coutReviensData = [];
    var margeBeneficeData = [];
    // var tauxCroissanceData = [];

    snapshot.forEach(function (childSnapshot) {
      var product = childSnapshot.val();
      labels.push(product.date);
      quantiteData.push(parseFloat(product.quantite) || 0);
      commandeData.push(parseFloat(product.commande) || 0);
      coutReviensData.push(parseFloat(product.coutReviens) || 0);
      margeBeneficeData.push(parseFloat(product.margeBenefice) || 0);
      // tauxCroissanceData.push(parseFloat(product.tauxCroissance) || 0);
    });

    // Mettre à jour le graphique existant avec les nouvelles données
    if (tendanceChart) {
      tendanceChart.data.labels = labels;
      tendanceChart.data.datasets[0].data = quantiteData;
      tendanceChart.data.datasets[1].data = commandeData;
      tendanceChart.data.datasets[2].data = coutReviensData;
      tendanceChart.data.datasets[3].data = margeBeneficeData;
      // tendanceChart.data.datasets[4].data = tauxCroissanceData;
      tendanceChart.update();
    } else {
      // Créer le graphique si il n'existe pas encore
      var ctx = document.getElementById('tendanceChart').getContext('2d');
      tendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'Quantité',
              data: quantiteData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 1
            },
            {
              label: 'Commande',
              data: commandeData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 1
            },
            {
              label: 'Coût de Reviens',
              data: coutReviensData,
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderWidth: 1
            },
            {
              label: 'Marge Bénéfice',
              data: margeBeneficeData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 1
            },
            // {
            //   label: 'Taux de croissance',
            //   data: tauxCroissanceData,
            //   borderColor: 'rgba(153, 102, 255, 1)',
            //   backgroundColor: 'rgba(153, 102, 255, 0.2)',
            //   borderWidth: 1
            // }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  });
}

function calculerTauxCroissance() {
  var quantiteActuelle = parseFloat(document.getElementById("quantite").value) || 0;
  var dateActuelle = new Date(document.getElementById("date").value);

  // Trouver la quantité du mois précédent dans Firebase
  database.ref('produits')
    .orderByChild('date')
    .endAt(dateActuelle.getFullYear() + '-' + (dateActuelle.getMonth()) + '-01') // Exclure le mois actuel
    .limitToLast(1) // Récupérer le dernier enregistrement du mois précédent
    .once('value')
    .then(function (snapshot) {
      var quantitePrecedente = 0;
      snapshot.forEach(function (childSnapshot) {
        quantitePrecedente = parseFloat(childSnapshot.val().quantite) || 0;
      });

      // Calculer le taux de croissance
      var tauxCroissance = 0;
      if (quantitePrecedente !== 0) {
        tauxCroissance = ((quantiteActuelle - quantitePrecedente) / quantitePrecedente) * 100;
      }

      // Afficher le taux de croissance dans le champ
      document.getElementById("tauxCroissance").value = tauxCroissance.toFixed(2);
    })
    .catch(function (error) {
      console.error("Erreur lors du calcul du taux de croissance:", error);
    });
}

function calculerCoutReviens() {
  var netBrut = parseFloat(document.getElementById("netBrut").value) || 0;
  var freight = parseFloat(document.getElementById("freight").value) || 0;
  var douaneTransport = parseFloat(document.getElementById("douaneTransport").value) || 0;
  var fraisTransfert = parseFloat(document.getElementById("fraisTransfert").value) || 0;
  var impotDocument = parseFloat(document.getElementById("impotDocument").value) || 0;
  var reparation = parseFloat(document.getElementById("reparation").value) || 0;

  var coutReviens = netBrut + freight + douaneTransport + fraisTransfert + impotDocument + reparation;
  document.getElementById("coutReviens").value = coutReviens.toFixed(2);

  calculerMargeBenefice(); // Mettre à jour la marge bénéficiaire
}

function calculerMargeBenefice() {
  var prixVente = parseFloat(document.getElementById("prixVente").value) || 0;
  var coutReviens = parseFloat(document.getElementById("coutReviens").value) || 0;

  var margeBenefice = prixVente - coutReviens;
  document.getElementById("margeBenefice").value = margeBenefice.toFixed(2);
}

// Fonction pour analyser les produits (modifiée pour la synchronisation dynamique)
function analyserProduits() {
  var resultatsAnalyse = document.getElementById("resultatsAnalyse");
  resultatsAnalyse.innerHTML = ''; // Effacer les résultats précédents

  // Obtenir les valeurs de sélection pour la période
  var periode = document.getElementById("analysePeriode").value;
  var selectedYear = document.getElementById("anneeSelect").value;
  var selectedMonth = document.getElementById("moisSelect").value;
  var selectedWeek = document.getElementById("semaineSelect").value;

  // Définir la période à afficher (seulement pour l'analyse hebdomadaire)
  var periodeAffichee = '';
  if (periode === "hebdomadaire" && selectedWeek && selectedMonth && selectedYear) {
    var startDate = getStartDateOfWeek(selectedWeek, selectedMonth, selectedYear);
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Fin de la semaine
    periodeAffichee = 'Semaine ' + selectedWeek + ', ' + getMonthName(selectedMonth) + ' ' + selectedYear + ' (' +
      startDate.toLocaleDateString() + ' - ' + endDate.toLocaleDateString() + ')';
  }

  // Afficher la période sélectionnée (seulement pour l'analyse hebdomadaire)
  document.getElementById("periodeSelectionnee").innerHTML = periodeAffichee ? 'Période sélectionnée: <span style="font-weight: bold;">' +
    periodeAffichee + '</span>' : '';

  // Récupérer et analyser les données des produits
  produitsRef.on('value', function (snapshot) { // Utilisation de 'on' pour la synchronisation en temps réel
    var totalQuantite = 0;
    var totalCommande = 0;
    var totalCoutReviens = 0;
    var totalMargeBenefice = 0;
    var totalPrixVente = 0;
    var totalPrixNet = 0;
    var totalDepenses = 0;

    snapshot.forEach(function (childSnapshot) {
      var product = childSnapshot.val();
      var productDate = new Date(product.date);

      // Vérifier si le produit correspond à la période sélectionnée
      if (
        (periode === "annuelle" && productDate.getFullYear() == selectedYear) ||
        (periode === "mensuelle" && productDate.getFullYear() == selectedYear && productDate.getMonth() + 1 ==
          selectedMonth) ||
        (periode === "hebdomadaire" && productDate >= getStartDateOfWeek(selectedWeek, selectedMonth,
          selectedYear) && productDate <= new Date(getStartDateOfWeek(selectedWeek, selectedMonth,
          selectedYear)).setDate(new Date(getStartDateOfWeek(selectedWeek, selectedMonth,
          selectedYear)).getDate() + 6))
      ) {
        totalQuantite += parseFloat(product.quantite) || 0;
        totalCommande += parseFloat(product.commande) || 0;
        totalCoutReviens += parseFloat(product.coutReviens) || 0;
        totalMargeBenefice += parseFloat(product.margeBenefice) || 0;
        totalPrixVente += parseFloat(product.prixVente) || 0;
        totalPrixNet += parseFloat(product.netBrut) || 0;
        totalDepenses += (parseFloat(product.freight) || 0) + (parseFloat(product.douaneTransport) || 0) + (
          parseFloat(product.fraisTransfert) || 0) + (parseFloat(product.impotDocument) || 0) + (parseFloat(
          product.reparation) || 0);
      }
    });

    // Afficher les totaux calculés
    resultatsAnalyse.innerHTML += `
      <h3>Totaux pour la période sélectionnée</h3>
      <p>Quantité totale: ${totalQuantite.toFixed(2)}</p>
      <p>Total des commandes: ${totalCommande.toFixed(2)}</p>
      <p>Coût de revient total: ${totalCoutReviens.toFixed(2)}</p>
      <p>Total des prix de vente: ${totalPrixVente.toFixed(2)}</p>
      <p>Total des prix nets: ${totalPrixNet.toFixed(2)}</p>
      <p>Total des dépenses: ${totalDepenses.toFixed(2)}</p>
      <p>Marge bénéficiaire totale: ${totalMargeBenefice.toFixed(2)}</p> 
    `;
  });
}

// Fonction pour obtenir la date de début d'une semaine donnée
function getStartDateOfWeek(weekNumber, month, year) {
  var date = new Date(year, month - 1, 1); // Mois en JavaScript est basé sur 0
  var day = date.getDay(); // 0 pour dimanche, 1 pour lundi, etc.

  // Ajuster la date pour commencer la semaine à lundi
  var diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour les semaines commençant le dimanche
  date.setDate(diff);

  // Ajouter le nombre de jours pour atteindre la semaine souhaitée
  date.setDate(date.getDate() + (weekNumber - 1) * 7);

  return date;
}

// Fonction pour obtenir le nom du mois
function getMonthName(monthNumber) {
  var mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  return mois[monthNumber - 1];
}

function afficherAnalyses() {
  masquerToutesSections();
  document.getElementById("analysesSection").style.display = "block";
  analyserProduits(); // Appeler la fonction d'analyse 
}

// Écouteur d'événement pour le changement de période d'analyse (modifié pour la synchronisation dynamique)
document.getElementById("analysePeriode").addEventListener('change', function () {
  var periode = this.value;
  var anneeSelect = document.getElementById("anneeSelect");
  var moisSelect = document.getElementById("moisSelect");
  var semaineSelect = document.getElementById("semaineSelect");

  // Afficher/masquer les champs de sélection en fonction de la période sélectionnée
  anneeSelect.style.display = periode === "annuelle" || periode === "mensuelle" || periode ===
    "hebdomadaire" ? "inline-block" : "none";
  moisSelect.style.display = periode === "mensuelle" || periode === "hebdomadaire" ? "inline-block" :
    "none";
  semaineSelect.style.display = periode === "hebdomadaire" ? "inline-block" : "none";

  // Mettre à jour les options du champ de sélection des semaines en fonction du mois sélectionné
  if (periode === "hebdomadaire") {
    mettreAJourSemaines(moisSelect.value, anneeSelect.value);
  }

  // Analyser les produits en fonction de la période sélectionnée
  analyserProduits();
});


// Fonction pour mettre à jour les options du champ de sélection des semaines
function mettreAJourSemaines(month, year) {
  var semaineSelect = document.getElementById("semaineSelect");
  semaineSelect.innerHTML = ''; // Effacer les options existantes

  // Calculer le nombre de semaines dans le mois
  var numWeeks = getNumberOfWeeksInMonth(month, year);

  // Ajouter les options de semaine
  for (var i = 1; i <= numWeeks; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = 'Semaine ' + i;
    semaineSelect.add(option);
  }
}

// Fonction pour obtenir le nombre de semaines dans un mois donné
function getNumberOfWeeksInMonth(month, year) {
  var firstDay = new Date(year, month - 1, 1); // Mois en JavaScript est basé sur 0
  var lastDay = new Date(year, month, 0);
  var numDays = lastDay.getDate();

  // Ajuster le nombre de jours pour les semaines commençant le dimanche
  if (firstDay.getDay() !== 1) {
    numDays += firstDay.getDay() - 1;
  }

  return Math.ceil(numDays / 7);
}

// Remplir les options d'année (par exemple, 2020 à 2025)
var anneeSelect = document.getElementById("anneeSelect");
for (var i = new Date().getFullYear() - 5; i <= new Date().getFullYear() + 5; i++) {
  var option = document.createElement("option");
  option.value = i;
  option.text = i;
  anneeSelect.add(option);
}

// Remplir les options de mois
var moisSelect = document.getElementById("moisSelect");
var mois = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
for (var i = 0; i < mois.length; i++) {
  var option = document.createElement("option");
  option.value = i + 1; // Mois en JavaScript est basé sur 0
  option.text = mois[i];
  moisSelect.add(option);
}

// Écouteur d'événement pour le changement de mois
moisSelect.addEventListener('change', function () {
  mettreAJourSemaines(this.value, anneeSelect.value);
  analyserProduits(); // Analyser les produits pour la semaine sélectionnée
});

// Écouteurs d'événements pour la sélection de l'année, du mois et de la semaine (modifiés pour la synchronisation dynamique)
document.getElementById("anneeSelect").addEventListener('change', analyserProduits);
document.getElementById("moisSelect").addEventListener('change', analyserProduits);
document.getElementById("semaineSelect").addEventListener('change', analyserProduits);

// Fonction pour calculer le prix net
function calculerPrixNet() {
  var prixBrut = parseFloat(document.getElementById("prixBrut").value) || 0;
  var taux = parseFloat(document.getElementById("taux").value) || 0;
  var prixNet = prixBrut * taux;
  document.getElementById("netBrut").value = prixNet.toFixed(2);
}

// Fonction pour changer la couleur du numéro de téléphone
function changerCouleurTelephone() {
  var RAP = parseFloat(document.getElementById("RAP").value) || 0;
  var numeroTelephoneInput = document.getElementById("numeroTelephone");
  if (RAP > 0) {
    numeroTelephoneInput.style.color = 'red';
  } else {
    numeroTelephoneInput.style.color = 'black';
  }
}

// Fonction pour afficher la liste des debiteurs
function afficherDebiteurs() {
  masquerToutesSections();
  document.getElementById("debiteursSection").style.display = "block";
  remplirTableauDebiteurs(); // Remplir le tableau des debiteurs
}

// Fonction pour remplir le tableau des debiteurs (modifiée pour les boutons)
function remplirTableauDebiteurs() {
  var debiteurTable = document.getElementById("debiteurTable").getElementsByTagName('tbody')[0];
  debiteurTable.innerHTML = ''; // Effacer le contenu du tableau

  debiteursRef.orderByChild('date').once('value') // Trier par date (les plus récents en haut) et supprimer la limite
    .then(function (snapshot) {
      var debiteurs = [];
      snapshot.forEach(function (childSnapshot) {
        debiteurs.push(childSnapshot.val());
      });

      // Inverser l'ordre des débiteurs
      debiteurs.reverse();

      // Parcourir les débiteurs inversés
      debiteurs.forEach(function (debiteur, index) { // Ajouter index pour accéder à childSnapshot.key
        var row = debiteurTable.insertRow();
        var key = snapshot.child(index).key; // Accéder à la clé en utilisant l'index

        // Date 
        var dateCell = row.insertCell();
        dateCell.textContent = debiteur.date;

        // Désignation
        var designationCell = row.insertCell();
        designationCell.textContent = debiteur.designation;

        // Numéro de Téléphone
        var numeroTelephoneCell = row.insertCell();
        numeroTelephoneCell.textContent = debiteur.numeroTelephone;

        // Montant RAP
        var RAPCell = row.insertCell();
        RAPCell.textContent = debiteur.RAP;

        // Statut
        var statutCell = row.insertCell();
        statutCell.textContent = "Non payé"; // Statut initial

        // Actions
        var actionsCell = row.insertCell();
        var payerTrancheButton = document.createElement("button");
        payerTrancheButton.textContent = "Payer Tranche";
        payerTrancheButton.className = "payment-button"; // Ajout de la classe pour le style
        payerTrancheButton.onclick = function () {
          if (confirm("Êtes-vous sûr de vouloir payer une tranche pour ce débiteur ?")) {
            var montantTranche = parseFloat(prompt("Entrez le montant de la tranche à payer:", 0));
            if (isNaN(montantTranche) || montantTranche <= 0) {
              alert("Montant invalide.");
              return;
            }

            // Soustraire le montant de la tranche du RAP
            var nouveauRAP = parseFloat(debiteur.RAP) - montantTranche;

            // Mettre à jour le RAP dans Firebase
            debiteursRef.child(key).update({
              RAP: nouveauRAP.toFixed(2)
            });

            // Mettre à jour le montant RAP du produit dans Firebase
            mettreAJourRAP(debiteur.numeroTelephone, nouveauRAP.toFixed(2));

            // Mettre à jour le RAP dans la cellule du tableau
            RAPCell.textContent = nouveauRAP.toFixed(2);

            // Si le RAP est égal à 0, supprimer le débiteur
            if (nouveauRAP <= 0) {
              row.remove();
              debiteursRef.child(key).remove();
              mettreAJourTelephone(debiteur.numeroTelephone, 'black');
              statutCell.textContent = "Payé"; // Mettre à jour le statut
            }

            // Actualiser l'analyse après le paiement d'une tranche
            analyserProduits();
          }
        };

        var payerTotalButton = document.createElement("button");
        payerTotalButton.textContent = "Payer Total";
        payerTotalButton.className = "payment-button"; // Ajout de la classe pour le style
        payerTotalButton.onclick = function () {
          if (confirm("Êtes-vous sûr de vouloir payer la totalité pour ce débiteur ?")) {
            // Supprimer la ligne du tableau des débiteurs
            row.remove();

            // Supprimer le débiteur de Firebase
            debiteursRef.child(key).remove();

            // Mettre à jour le montant RAP du produit dans Firebase
            mettreAJourRAP(debiteur.numeroTelephone, 0);

            // Mettre à jour la couleur du numéro de téléphone dans le tableau des données
            mettreAJourTelephone(debiteur.numeroTelephone, 'black');

            // Mettre à jour le statut du débiteur
            statutCell.textContent = "Payé";

            // Actualiser l'analyse après le paiement total
            analyserProduits();
          }
        };

        actionsCell.appendChild(payerTrancheButton);
        actionsCell.appendChild(payerTotalButton);
      });
    })
    .catch(function (error) {
      console.error("Erreur lors de la récupération des détails des débiteurs:", error);
      alert("Une erreur est survenue.");
    });
}

// Fonction pour mettre à jour la couleur du numéro de téléphone dans le tableau des données
function mettreAJourTelephone(numeroTelephone, couleur) {
  var produitTable = document.getElementById("produitTable").getElementsByTagName('tbody')[0];
  var rows = produitTable.querySelectorAll('tr');

  rows.forEach(function (row) {
    var numeroTelephoneCell = row.querySelector('td:nth-child(21)'); // Sélectionne la cellule du numéro de téléphone
    if (numeroTelephoneCell.textContent === numeroTelephone) {
      numeroTelephoneCell.style.color = couleur;
      // Supprimer l'attribut data-rap-status pour réinitialiser la coloration
      numeroTelephoneCell.removeAttribute('data-rap-status');
    }
  });
}

// Fonction pour mettre à jour le montant RAP du produit dans Firebase
function mettreAJourRAP(numeroTelephone, nouveauRAP) {
  produitsRef.orderByChild('numeroTelephone').equalTo(numeroTelephone).once('value', function (produitSnapshot) {
    if (produitSnapshot.exists()) {
      produitSnapshot.forEach(function (childSnapshot) {
        produitsRef.child(childSnapshot.key).update({
          RAP: nouveauRAP
        });
      });
    }
  });
}

// Lorsque des données sont ajoutées à la collection 'produits'
produitsRef.on('child_added', function (snapshot) {
  var product = snapshot.val();

  // Vérifier si RAP > 0
  if (parseFloat(product.RAP) > 0) {
    // Ajouter le debiteur à la liste des debiteurs
    // ajouterDebiteur(product); // Appeler la fonction pour ajouter le debiteur
  }

  // Actualiser l'analyse après l'ajout d'un produit
  analyserProduits();
});

// Mettre à jour le tableau des debiteurs si un produit est modifié
produitsRef.on('child_changed', function (snapshot) {
  var product = snapshot.val();
  mettreAJourDebiteur(product);

  // Actualiser l'analyse après la modification d'un produit
  analyserProduits();
});

// Fonction pour mettre à jour les debiteurs en fonction des modifications de produits
function mettreAJourDebiteur(product) {
  // Vérifier si RAP > 0
  if (parseFloat(product.RAP) > 0) {
    // Vérifier si le debiteur existe déjà dans la liste
    debiteursRef.orderByChild('numeroTelephone').equalTo(product.numeroTelephone).once('value', function (
      debiteurSnapshot) {
      if (debiteurSnapshot.exists()) {
        // Mettre à jour le debiteur existant
        debiteurSnapshot.forEach(function (childSnapshot) {
          debiteursRef.child(childSnapshot.key).update({
            date: product.date,
            designation: product.designation,
            RAP: product.RAP
          });
        });
      } else {
        // Ajouter le debiteur à la liste des debiteurs
        debiteursRef.push({
          date: product.date,
          designation: product.designation,
          numeroTelephone: product.numeroTelephone,
          RAP: product.RAP
        });
      }

      // Mettre à jour la couleur du numéro de téléphone dans le tableau des données
      mettreAJourTelephone(product.numeroTelephone, 'red');
    });
  } else {
    // Vérifier si le debiteur existe déjà dans la liste
    debiteursRef.orderByChild('numeroTelephone').equalTo(product.numeroTelephone).once('value', function (
      debiteurSnapshot) {
      if (debiteurSnapshot.exists()) {
        // Supprimer le debiteur de la liste
        debiteurSnapshot.forEach(function (childSnapshot) {
          debiteursRef.child(childSnapshot.key).remove();
        });

        // Mettre à jour la couleur du numéro de téléphone dans le tableau des données
        mettreAJourTelephone(product.numeroTelephone, 'black');
      }
    });
  }
}

// Fonction pour afficher la section "Gestion de Stocks"
function afficherStocks() {
  masquerToutesSections();
  document.getElementById("stocksSection").style.display = "block";
  remplirTableauStocks(); // Remplir le tableau des stocks
}

// Fonction pour remplir le tableau des stocks (modifiée pour ajouter la ligne total et l'icône de modification)
function remplirTableauStocks() {
  var stockTable = document.getElementById("stockTable").getElementsByTagName('tbody')[0];
  stockTable.innerHTML = ''; // Effacer le contenu du tableau

  var totalQuantiteInitiale = 0;
  var totalQuantiteVendues = 0;
  var totalQuantiteRestante = 0;

  stocksRef.once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var stock = childSnapshot.val();
        var row = stockTable.insertRow();
        var key = childSnapshot.key; // Récupérer la clé du stock

        // Date
        var dateCell = row.insertCell();
        dateCell.textContent = stock.dateStock; // Afficher la date du stock

        // Désignation
        var designationCell = row.insertCell();
        designationCell.textContent = stock.designation;

        // Quantité Initiale
        var quantiteInitialeCell = row.insertCell();
        quantiteInitialeCell.textContent = stock.quantiteInitiale;

        // Quantité Vendues
        var quantiteVenduesCell = row.insertCell();
        quantiteVenduesCell.textContent = stock.quantiteVendues;

        // Quantité Restante
        var quantiteRestanteCell = row.insertCell();
        quantiteRestanteCell.textContent = stock.quantiteRestante;

        // Ajouter les icônes de suppression et de modification
        var actionsCell = row.insertCell();
        var iconContainer = document.createElement("div");
        iconContainer.classList.add("icon-container");

        // Icône de suppression
        var iconDelete = document.createElement("i");
        iconDelete.classList.add("fas", "fa-trash", "icon-delete");
        iconDelete.onclick = function () {
          if (confirm("Êtes-vous sûr de vouloir supprimer ce stock ?")) {
            stocksRef.child(key).remove()
              .then(function () {
                // Mettre à jour le tableau des stocks et le champ de sélection "Désignation"
                remplirTableauStocks();
                remplirChampDesignation();

                // Actualiser l'analyse après la suppression d'un stock
                analyserProduits();

                alert("Stock supprimé avec succès !");
              })
              .catch(function (error) {
                console.error("Erreur lors de la suppression du stock:", error);
                alert("Une erreur est survenue.");
              });
          }
        };
        iconContainer.appendChild(iconDelete);

        // Icône de modification
        var iconEdit = document.createElement("i");
        iconEdit.classList.add("fas", "fa-edit", "icon-edit");
        iconEdit.onclick = function () {
          ouvrirModalStock(key, stock);
        };
        iconContainer.appendChild(iconEdit);

        actionsCell.appendChild(iconContainer);

        // Calculer les totaux
        totalQuantiteInitiale += parseFloat(stock.quantiteInitiale) || 0;
        totalQuantiteVendues += parseFloat(stock.quantiteVendues) || 0;
        totalQuantiteRestante += parseFloat(stock.quantiteRestante) || 0;
      });

      // Ajouter la ligne total
      var totalRow = stockTable.insertRow();
      totalRow.classList.add('total-row'); // Ajouter une classe CSS pour le style

      var totalDateCell = totalRow.insertCell();
      totalDateCell.textContent = "Total";

      var totalDesignationCell = totalRow.insertCell();
      totalDesignationCell.textContent = "";

      var totalQuantiteInitialeCell = totalRow.insertCell();
      totalQuantiteInitialeCell.textContent = totalQuantiteInitiale.toFixed(2);

      var totalQuantiteVenduesCell = totalRow.insertCell();
      totalQuantiteVenduesCell.textContent = totalQuantiteVendues.toFixed(2);

      var totalQuantiteRestanteCell = totalRow.insertCell();
      totalQuantiteRestanteCell.textContent = totalQuantiteRestante.toFixed(2);

      var totalActionsCell = totalRow.insertCell();
      totalActionsCell.textContent = "";
    })
    .catch(function (error) {
      console.error("Erreur lors de la récupération des données des stocks:", error);
      alert("Une erreur est survenue.");
    });
}


// Fonction pour remplir le champ de sélection "Désignation" (modifiée pour éviter les doublons)
function remplirChampDesignation() {
  var designationSelect = document.getElementById("designation");
  designationSelect.innerHTML = ''; // Effacer les options existantes

  // Utiliser un Set pour stocker les désignations uniques
  var designationsUniques = new Set();

  // Récupérer les désignations des stocks depuis Firebase
  stocksRef.once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var stock = childSnapshot.val();
        designationsUniques.add(stock.designation);
      });

      // Ajouter les désignations uniques au champ de sélection
      designationsUniques.forEach(function (designation) {
        var option = document.createElement("option");
        option.value = designation;
        option.text = designation;
        designationSelect.add(option);
      });
    })
    .catch(function (error) {
      console.error("Erreur lors de la récupération des données des stocks:", error);
      alert("Une erreur est survenue.");
    });
}

// Fonction pour ajouter un stock (modifiée pour inclure la date)
function ajouterStock() {
  var dateStock = document.getElementById("dateStock").value; // Récupérer la date du stock
  var designation = document.getElementById("designationStock").value;
  var quantiteAajouter = parseFloat(document.getElementById("quantiteInitialeStock").value) || 0;

  // Vérifier si tous les champs sont remplis
  if (dateStock === "" || designation === "" || isNaN(quantiteAajouter)) {
    alert("Veuillez remplir tous les champs du formulaire de stock.");
    return;
  }

  // Ajouter le nouveau stock dans Firebase
  stocksRef.push({
    dateStock: dateStock, // Ajouter la date du stock
    designation: designation,
    quantiteInitiale: quantiteAajouter,
    quantiteRestante: quantiteAajouter,
    quantiteVendues: 0
  })
    .then(function () {
      // Réinitialiser le formulaire
      document.getElementById("stockForm").reset();
      // Mettre à jour le tableau des stocks
      remplirTableauStocks();
      // Mettre à jour le champ de sélection "Désignation" du formulaire des produits
      remplirChampDesignation();

      // Actualiser l'analyse après l'ajout d'un stock
      analyserProduits();

      alert("Stock ajouté avec succès !");
    })
    .catch(function (error) {
      console.error("Erreur lors de l'ajout du stock:", error);
      alert("Une erreur est survenue.");
    });
}

// Appeler la fonction pour remplir le champ de sélection au chargement de la page
window.onload = function () {
  remplirChampDesignation();
};

// Écouteur d'événement pour le formulaire de stock
document.getElementById("stockForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Empêche le rechargement de la page
  ajouterStock(); // Appel de la fonction pour ajouter le stock
});

// Fonction pour ouvrir la fenêtre flottante (modal) pour la modification des produits
function ouvrirModalProduit(key, product) {
  // Remplir les champs du formulaire de modification avec les données du produit
  document.getElementById("editProductKey").value = key;
  document.getElementById("editDate").value = product.date;
  document.getElementById("editQuantite").value = product.quantite;
  document.getElementById("editDesignation").value = product.designation;
  document.getElementById("editTypeArticle").value = product.typeArticle;
  document.getElementById("editCategorie").value = product.categorie;
  document.getElementById("editPrixVente").value = product.prixVente;
  document.getElementById("editRAP").value = product.RAP;
  document.getElementById("editPrixBrut").value = product.prixBrut;
  document.getElementById("editTaux").value = product.taux;
  document.getElementById("editNetBrut").value = product.netBrut;
  document.getElementById("editFreight").value = product.freight;
  document.getElementById("editDouaneTransport").value = product.douaneTransport;
  document.getElementById("editFraisTransfert").value = product.fraisTransfert;
  document.getElementById("editImpotDocument").value = product.impotDocument;
  document.getElementById("editReparation").value = product.reparation;
  document.getElementById("editTypeClient").value = product.typeClient;
  document.getElementById("editVille").value = product.ville;
  document.getElementById("editNumeroTelephone").value = product.numeroTelephone;
  document.getElementById("editCommande").value = product.commande;
  document.getElementById("editCoutReviens").value = product.coutReviens;
  document.getElementById("editMargeBenefice").value = product.margeBenefice;

  // Mettre à jour le champ de sélection "Désignation" dans le modal
  var editDesignationSelect = document.getElementById("editDesignation");
  editDesignationSelect.innerHTML = ''; // Effacer les options existantes

  // Utiliser un Set pour stocker les désignations uniques
  var editDesignationsUniques = new Set();

  // Récupérer les désignations des stocks depuis Firebase
  stocksRef.once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var stock = childSnapshot.val();
        editDesignationsUniques.add(stock.designation);
      });

      // Ajouter les désignations uniques au champ de sélection dans le modal
      editDesignationsUniques.forEach(function (designation) {
        var option = document.createElement("option");
        option.value = designation;
        option.text = designation;
        editDesignationSelect.add(option);
      });

      // Sélectionner la désignation du produit en cours de modification
      editDesignationSelect.value = product.designation;
    })
    .catch(function (error) {
      console.error("Erreur lors de la récupération des données des stocks:", error);
      alert("Une erreur est survenue.");
    });

  document.getElementById("editProductModal").style.display = "block";
}

// Fonction pour fermer la fenêtre flottante (modal) pour la modification des produits
function fermerModalProduit() {
  document.getElementById("editProductModal").style.display = "none";
  // Réinitialiser le formulaire de modification
  document.getElementById("editProductForm").reset();
}

// Fonction pour modifier un produit
function modifierProduit(key) {
  var updatedProductData = {
    date: document.getElementById("editDate").value,
    quantite: document.getElementById("editQuantite").value,
    designation: document.getElementById("editDesignation").value,
    typeArticle: document.getElementById("editTypeArticle").value,
    categorie: document.getElementById("editCategorie").value,
    prixVente: document.getElementById("editPrixVente").value,
    RAP: document.getElementById("editRAP").value,
    netBrut: document.getElementById("editNetBrut").value,
    prixBrut: document.getElementById("editPrixBrut").value,
    taux: parseFloat(document.getElementById("editTaux").value) || 0, // parseFloat pour gérer les décimales
    freight: document.getElementById("editFreight").value,
    douaneTransport: document.getElementById("editDouaneTransport").value,
    fraisTransfert: document.getElementById("editFraisTransfert").value,
    impotDocument: document.getElementById("editImpotDocument").value,
    reparation: document.getElementById("editReparation").value,
    typeClient: document.getElementById("editTypeClient").value,
    ville: document.getElementById("editVille").value,
    numeroTelephone: document.getElementById("editNumeroTelephone").value,
    commande: document.getElementById("editCommande").value,
    coutReviens: parseFloat(document.getElementById("editCoutReviens").value) || 0,
    margeBenefice: parseFloat(document.getElementById("editMargeBenefice").value) || 0,
  };

  // Récupérer les données du produit original avant la modification
  produitsRef.child(key).once('value', function (snapshot) {
    var originalProductData = snapshot.val();

    // Calculer la différence de quantité
    var quantiteDifference = parseFloat(updatedProductData.quantite) - parseFloat(originalProductData.quantite);

    // Mettre à jour le produit dans Firebase
    produitsRef.child(key).update(updatedProductData)
      .then(function () {
        // Fermer la fenêtre flottante
        fermerModalProduit();

        // Mettre à jour le tableau des produits
        remplirTableau();

        // Mettre à jour le tableau des debiteurs si nécessaire
        if (parseFloat(updatedProductData.RAP) > 0) {
          // Vérifier si le debiteur existe déjà
          debiteursRef.orderByChild('numeroTelephone').equalTo(updatedProductData.numeroTelephone).once(
            'value', function (snapshot) {
              if (snapshot.exists()) {
                // Mettre à jour le debiteur existant
                snapshot.forEach(function (childSnapshot) {
                  debiteursRef.child(childSnapshot.key).update({
                    date: updatedProductData.date,
                    designation: updatedProductData.designation,
                    RAP: updatedProductData.RAP
                  });
                });
              } else {
                // Ajouter un nouveau debiteur
                debiteursRef.push({
                  date: updatedProductData.date,
                  designation: updatedProductData.designation,
                  numeroTelephone: updatedProductData.numeroTelephone,
                  RAP: updatedProductData.RAP
                });
              }
            });
        } else {
          // Supprimer le debiteur si RAP est 0
          debiteursRef.orderByChild('numeroTelephone').equalTo(updatedProductData.numeroTelephone).once(
            'value', function (snapshot) {
              if (snapshot.exists()) {
                snapshot.forEach(function (childSnapshot) {
                  debiteursRef.child(childSnapshot.key).remove();
                });
              }
            });
        }

        // Mettre à jour le tableau des debiteurs
        remplirTableauDebiteurs();

        // Mettre à jour le tableau des stocks 
        mettreAJourStocks(updatedProductData.designation, quantiteDifference); // Utiliser la différence de quantité
        remplirTableauStocks();

        // Actualiser l'analyse après la modification d'un produit
        analyserProduits();

        alert("Produit modifié avec succès !");
      })
      .catch(function (error) {
        console.error("Erreur lors de la modification du produit:", error);
        alert("Une erreur est survenue.");
      });
  });
}

// Écouteur d'événement pour le formulaire de modification du produit
document.getElementById("editProductForm").addEventListener("submit", function (event) {
  event.preventDefault();
  var key = document.getElementById("editProductKey").value;
  modifierProduit(key);
});

// Fonction pour ouvrir la fenêtre flottante (modal) pour la modification des stocks
function ouvrirModalStock(key, stock) {
  // Remplir les champs du formulaire de modification avec les données du stock
  document.getElementById("editStockKey").value = key;
  document.getElementById("editDateStock").value = stock.dateStock;
  document.getElementById("editDesignationStock").value = stock.designation;
  document.getElementById("editQuantiteInitialeStock").value = stock.quantiteInitiale;

  document.getElementById("editStockModal").style.display = "block";
}

// Fonction pour fermer la fenêtre flottante (modal) pour la modification des stocks
function fermerModalStock() {
  document.getElementById("editStockModal").style.display = "none";
  // Réinitialiser le formulaire de modification
  document.getElementById("editStockForm").reset();
}

// Fonction pour modifier un stock
function modifierStock(key) {
  var updatedStockData = {
    dateStock: document.getElementById("editDateStock").value,
    designation: document.getElementById("editDesignationStock").value,
    quantiteInitiale: parseFloat(document.getElementById("editQuantiteInitialeStock").value) || 0,
    // La quantité restante et la quantité vendue seront recalculées après la mise à jour
  };

  // Mettre à jour le stock dans Firebase
  stocksRef.child(key).update(updatedStockData)
    .then(function () {
      // Fermer la fenêtre flottante
      fermerModalStock();

      // Recalculer la quantité restante et la quantité vendue pour tous les produits avec la même désignation
      recalculerQuantitesStock(updatedStockData.designation);

      // Mettre à jour le tableau des stocks
      remplirTableauStocks();

      // Mettre à jour le champ de sélection "Désignation" du formulaire des produits
      remplirChampDesignation();

      // Actualiser l'analyse après la modification d'un stock
      analyserProduits();

      alert("Stock modifié avec succès !");
    })
    .catch(function (error) {
      console.error("Erreur lors de la modification du stock:", error);
      alert("Une erreur est survenue.");
    });
}

// Fonction pour recalculer la quantité restante et la quantité vendue pour une désignation donnée
function recalculerQuantitesStock(designation) {
  // Récupérer le stock correspondant à la désignation
  stocksRef.orderByChild('designation').equalTo(designation).once('value', function (snapshot) {
    if (snapshot.exists()) {
      snapshot.forEach(function (childSnapshot) {
        var stock = childSnapshot.val();
        var quantiteVendues = 0;

        // Calculer la quantité vendue en fonction des produits vendus avec la même désignation
        produitsRef.orderByChild('designation').equalTo(designation).once('value', function (produitsSnapshot) {
          if (produitsSnapshot.exists()) {
            produitsSnapshot.forEach(function (produitChildSnapshot) {
              quantiteVendues += parseFloat(produitChildSnapshot.val().quantite) || 0;
            });
          }

          // Calculer la quantité restante
          var quantiteRestante = stock.quantiteInitiale - quantiteVendues;

          // Mettre à jour les quantités dans Firebase
          stocksRef.child(childSnapshot.key).update({
            quantiteRestante: quantiteRestante,
            quantiteVendues: quantiteVendues
          });
        });
      });
    }
  });
}

// Écouteur d'événement pour le formulaire de modification du stock
document.getElementById("editStockForm").addEventListener("submit", function (event) {
  event.preventDefault();
  var key = document.getElementById("editStockKey").value;
  modifierStock(key);
});

// Fonction pour trier le tableau (modifiée pour être générique)
function trierTableau(tableId, colonne) {
  var tableau, lignes, changeant, i, x, y, shouldSwitch, direction;
  tableau = document.getElementById(tableId);
  changeant = true;
  direction = "asc";
  while (changeant) {
    changeant = false;
    lignes = tableau.rows;
    for (i = 1; i < (lignes.length - 1); i++) {
      shouldSwitch = false;
      x = lignes[i].getElementsByTagName("TD")[colonneIndex(tableId, colonne)];
      y = lignes[i + 1].getElementsByTagName("TD")[colonneIndex(tableId, colonne)];
      if (direction === "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (direction === "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      lignes[i].parentNode.insertBefore(lignes[i + 1], lignes[i]);
      changeant = true;
      direction = direction === "asc" ? "desc" : "asc";
    }
  }
}

// Fonction pour obtenir l'index de la colonne en fonction du nom de la colonne (corrigée)
function colonneIndex(tableId, colonne) {
  var entete = document.getElementById(tableId).getElementsByTagName("TH");
  for (var i = 0; i < entete.length; i++) {
    if (entete[i].textContent.trim() === colonne) {
      return i;
    }
  }
  return -1; // Retourner -1 si la colonne n'est pas trouvée
}

// Fonction pour rechercher dans le tableau des produits (modifiée pour afficher tous les produits si le champ de recherche est vide)
function rechercherProduits() {
  var searchTerm = document.getElementById("searchInputProduits").value.toLowerCase();
  var table = document.getElementById("produitTable");
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) { // Commencer à partir de 1 pour ignorer l'en-tête
    var shouldShow = searchTerm === ""; // Afficher la ligne si le champ de recherche est vide
    if (!shouldShow) {
      var cells = rows[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var cellText = cells[j].textContent.toLowerCase();
        if (cellText.indexOf(searchTerm) > -1) {
          shouldShow = true;
          break;
        }
      }
    }
    rows[i].style.display = shouldShow ? "" : "none";
  }
}

// Fonction pour rechercher dans le tableau des stocks
function rechercherStocks() {
  var searchTerm = document.getElementById("searchInputStocks").value.toLowerCase();
  var table = document.getElementById("stockTable");
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) { // Commencer à partir de 1 pour ignorer l'en-tête
    var shouldShow = searchTerm === ""; // Afficher la ligne si le champ de recherche est vide
    if (!shouldShow) {
      var cells = rows[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var cellText = cells[j].textContent.toLowerCase();
        if (cellText.indexOf(searchTerm) > -1) {
          shouldShow = true;
          break;
        }
      }
    }
    rows[i].style.display = shouldShow ? "" : "none";
  }
}

// Fonction pour rechercher dans le tableau des debiteurs
function rechercherDebiteurs() {
  var searchTerm = document.getElementById("searchInputDebiteurs").value.toLowerCase();
  var table = document.getElementById("debiteurTable");
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) { // Commencer à partir de 1 pour ignorer l'en-tête
    var shouldShow = searchTerm === ""; // Afficher la ligne si le champ de recherche est vide
    if (!shouldShow) {
      var cells = rows[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var cellText = cells[j].textContent.toLowerCase();
        if (cellText.indexOf(searchTerm) > -1) {
          shouldShow = true;
          break;
        }
      }
    }
    rows[i].style.display = shouldShow ? "" : "none";
  }
}

// Fonction pour mettre à jour les stocks (modifiée pour gérer les quantités vendues)
function mettreAJourStocks(designation, quantite) {
  // Trouver le stock correspondant à la désignation
  stocksRef.orderByChild('designation').equalTo(designation).once('value', function (snapshot) {
    if (snapshot.exists()) {
      // Mettre à jour la quantité restante et la quantité vendue du stock
      snapshot.forEach(function (childSnapshot) {
        var stock = childSnapshot.val();
        var nouvelleQuantiteRestante = stock.quantiteRestante - parseFloat(quantite);
        var nouvelleQuantiteVendues = stock.quantiteVendues + parseFloat(quantite);

        // Vérifier si la nouvelle quantité restante est négative
        if (nouvelleQuantiteRestante < 0) {
          alert(
            "La quantité restante du stock '" + designation + "' ne peut pas être négative."
          );
          return;
        }

        // Mettre à jour les valeurs dans Firebase
        stocksRef.child(childSnapshot.key).update({
          quantiteRestante: nouvelleQuantiteRestante,
          quantiteVendues: nouvelleQuantiteVendues
        });
      });
    }
  });
}

// Fonction pour masquer toutes les sections
function masquerToutesSections() {
  document.getElementById("detailsSection").style.display = "none";
  document.getElementById("tendancesSection").style.display = "none";
  document.getElementById("analysesSection").style.display = "none";
  document.getElementById("debiteursSection").style.display = "none";
  document.getElementById("stocksSection").style.display = "none";
}

// Lorsque des données sont ajoutées, modifiées ou supprimées de la collection 'produits'
produitsRef.on('child_added', analyserProduits);
produitsRef.on('child_changed', analyserProduits);
produitsRef.on('child_removed', analyserProduits);