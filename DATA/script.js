// Initialisation de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBMioKaf2knW9BtrdUkrteEcIaKBJvG8JE",
    authDomain: "razia-data.firebaseapp.com",
    databaseURL: "https://razia-data-default-rtdb.firebaseio.com",
    projectId: "razia-data",
    storageBucket: "razia-data.appspot.com",
    messagingSenderId: "797498750723",
    appId: "1:797498750723:web:385d55e45ab4a0221b1b36",
    measurementId: "G-F4MYMJVSRV"
  };
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  const storage = firebase.storage();
  
  let currentMonth = null;
  let selectedReservationKey = null; // Variable pour stocker la clé de la réservation sélectionnée
  
  // Fonction pour formater le prix en F CFA
  function formatPrice(price) {
    return `${price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} F CFA`;
  }
  
  // Fonction pour vérifier les informations de connexion
  function checkCredentials(username, password) {
    return database.ref('users/' + username).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        if (user.password === password) {
          window.loggedInUsername = username;
          window.loggedInUserStatus = user.status;
          return true;
        }
      }
      return false;
    });
  }
  
  // Gestionnaire d'événements pour le formulaire de connexion
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    checkCredentials(username, password).then((isValid) => {
      if (isValid) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainPage').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = `Utilisateur : ${window.loggedInUsername}`;
        document.getElementById('userStatusDisplay').textContent = `Statut : ${window.loggedInUserStatus}`;
        if (window.loggedInUserStatus === 'admin') {
          const editIcons = document.querySelectorAll('.edit-icon');
          const deleteIcons = document.querySelectorAll('.delete-icon');
          editIcons.forEach(icon => icon.style.display = 'inline-block');
          deleteIcons.forEach(icon => icon.style.display = 'inline-block');
        }
        loadDataFromDatabase();
      } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect.');
      }
    });
  });
  
  // Fonction pour afficher/masquer le champ "Montant avancé" et "Montant ajouté"
  function toggleAdvanceField(fieldId = 'advanceField') {
    const advanceField = document.getElementById(fieldId);
    const saleType = document.getElementById('saleType').value;
    advanceField.style.display = saleType === 'reservation' ? 'grid' : 'none';
    document.getElementById('retourField').style.display = saleType === 'retour' ? 'grid' : 'none';
    if (fieldId === 'editAdvanceField') {
      const editSaleType = document.getElementById('editSaleType').value;
      advanceField.style.display = editSaleType === 'reservation' ? 'grid' : 'none';
      document.getElementById('editRetourField').style.display = editSaleType === 'retour' ? 'grid' : 'none';
    }
  }
  
  // Soumission du formulaire principal
  document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (window.loggedInUserStatus === 'admin' || window.loggedInUserStatus === 'editeur') {
      const date = document.getElementById('date').value;
      const saleType = document.getElementById('saleType').value;
      const quantity = document.getElementById('quantity').value;
      const designation = document.getElementById('designation').value;
  
      // Obtenir la valeur numérique du prix sans formatage
      const price = parseFloat(document.getElementById('price').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
  
      const advance = saleType === 'reservation' ? parseFloat(document.getElementById('advanceAmount').value) : 0;
      const montantAjoute = saleType === 'retour' ? parseFloat(document.getElementById('montantAjoute').value) : 0;
      const imageFile = document.getElementById('image').files[0];
      const ancienneImageFile = saleType === 'retour' ? document.getElementById('ancienneImage').files[0] : null;
  
      const data = {
        date: date,
        saleType: saleType,
        quantity: quantity,
        designation: designation,
        price: price, // Stocker le prix numérique
        advance: advance,
        montantAjoute: montantAjoute
      };
  
      let newDataRef;
      if (saleType === 'reservation') {
        newDataRef = database.ref('reservations').push();
      } else if (saleType === 'retour') {
        newDataRef = database.ref('retours').push();
      } else {
        newDataRef = database.ref().push();
      }
  
      newDataRef.set(data)
        .then(() => {
          if (saleType === 'retour' && imageFile && ancienneImageFile) {
            const storageRef = storage.ref().child(`images/${newDataRef.key}_nouvelle.jpg`);
            const ancienneStorageRef = storage.ref().child(`images/${newDataRef.key}_ancienne.jpg`);
            return Promise.all([
              storageRef.put(imageFile),
              ancienneStorageRef.put(ancienneImageFile)
            ]).then(([snapshot, ancienneSnapshot]) => {
              return newDataRef.update({
                image: snapshot.ref.fullPath,
                ancienneImage: ancienneSnapshot.ref.fullPath
              });
            });
          } else if (imageFile) {
            const storageRef = storage.ref().child(`images/${newDataRef.key}.jpg`);
            return storageRef.put(imageFile).then((snapshot) => {
              return newDataRef.update({ image: snapshot.ref.fullPath });
            });
          }
        })
        .then(() => {
          const message = saleType === 'reservation'
            ? "La réservation a été enregistrée avec succès."
            : saleType === 'retour'
            ? "Le retour a été enregistré avec succès."
            : "Les données ont été enregistrées avec succès dans le tableau des ventes.";
  
          alert(message);
          clearTable();
          loadDataFromDatabase();
  
          const targetContainer = saleType === 'reservation'
            ? 'reservationsContainer'
            : saleType === 'retour'
            ? 'retoursContainer'
            : 'tableContainer';
          document.getElementById(targetContainer).scrollIntoView({ behavior: 'smooth' });
        })
        .catch((error) => {
          console.error(`Erreur lors de l'enregistrement des données :`, error);
        });
  
      document.getElementById('dataForm').reset();
      document.getElementById('formattedPrice').textContent = ' F CFA'; // Réinitialiser l'affichage du prix formaté
      document.getElementById('formattedAdvance').textContent = ' F CFA'; // Réinitialiser l'affichage du montant avancé formaté
      document.getElementById('formattedMontantAjoute').textContent = ' F CFA'; // Réinitialiser l'affichage du montant ajouté formaté
    } else {
      alert("Vous n'êtes pas autorisé à enregistrer des données.");
    }
  });
  
  // Fonction pour ajouter une nouvelle ligne au tableau principal des ventes
  function addRowToTable(data, key, tableId = 'dataTable') {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const date = new Date(year, month, day);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (monthYear !== currentMonth) {
        addMonthSeparator(table, monthYear);
      }
    } else {
      console.error(`Format de date incorrect: ${data.date}`);
      const errorRow = table.insertRow(0);
      const errorCell = errorRow.insertCell();
      errorCell.colSpan = 7;
      errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
      errorCell.classList.add('error-row');
      return;
    }
  
    const newRow = table.insertRow(); // Insérer la ligne à la fin du tableau
    newRow.setAttribute('data-key', key);
    newRow.insertCell().textContent = data.date;
    newRow.insertCell().textContent = data.saleType;
    newRow.insertCell().textContent = data.quantity;
    newRow.insertCell().textContent = data.designation;
  
    // Afficher le prix formaté dans la cellule du tableau
    newRow.insertCell().textContent = formatPrice(data.price);
  
    const imageCell = newRow.insertCell();
    if (data.image) {
      storage.ref(data.image).getMetadata().then(() => {
        return storage.ref(data.image).getDownloadURL();
      }).then((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Image";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        imageCell.appendChild(img);
        img.addEventListener('click', function () {
          openImageModal(url);
        });
      }).catch((error) => {
        console.error("Erreur lors de la récupération de l'image:", error);
        imageCell.textContent = "Image non disponible";
      });
    } else {
      imageCell.textContent = "Aucune image";
    }
  
    const actionsCell = newRow.insertCell();
    if (window.loggedInUserStatus === 'admin') {
      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-edit edit-icon';
      editIcon.setAttribute('data-key', key);
      editIcon.addEventListener('click', openEditForm);
      actionsCell.appendChild(editIcon);
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'fas fa-trash delete-icon';
      deleteIcon.setAttribute('data-key', key);
      deleteIcon.addEventListener('click', deleteData);
      actionsCell.appendChild(deleteIcon);
    }
  }
  
  
  // Fonction pour ajouter une nouvelle ligne au tableau des réservations
  function addRowToReservationTable(data, key) {
    const table = document.getElementById('reservationTable').getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const date = new Date(year, month, day);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (monthYear !== currentMonth) {
        addMonthSeparator(table, monthYear);
      }
    } else {
      console.error(`Format de date incorrect: ${data.date}`);
      const errorRow = table.insertRow(0);
      const errorCell = errorRow.insertCell();
      errorCell.colSpan = 7; // Modifiez le colspan pour correspondre au nombre de colonnes
      errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
      errorCell.classList.add('error-row');
      return;
    }
  
    const newRow = table.insertRow();
    newRow.setAttribute('data-key', key);
    newRow.addEventListener('click', function() {
      // Supprimer la classe 'selected' de toutes les lignes
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => row.classList.remove('selected'));
    
      // Ajouter la classe 'selected' à la ligne cliquée
      this.classList.add('selected');
    
      // Mettre à jour la variable globale avec la clé de la réservation sélectionnée
      selectedReservationKey = key;
    });
    newRow.insertCell().textContent = data.date;
    newRow.insertCell().textContent = data.designation;
    newRow.insertCell().textContent = data.quantity;
    newRow.insertCell().textContent = formatPrice(data.advance);
    //newRow.insertCell().textContent = formatPrice(data.montantPaye || 0);  // Supprimer la colonne 'Montant payé'
    newRow.insertCell().textContent = formatPrice(data.price); 
  
    const imageCell = newRow.insertCell();
    if (data.image) {
      storage.ref(data.image).getMetadata().then(() => {
        return storage.ref(data.image).getDownloadURL();
      }).then((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Image";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        imageCell.appendChild(img);
        img.addEventListener('click', function () {
          openImageModal(url);
        });
      }).catch((error) => {
        console.error("Erreur lors de la récupération de l'image:", error);
        imageCell.textContent = "Image non disponible";
      });
    } else {
      imageCell.textContent = "Aucune image";
    }
  
    const actionsCell = newRow.insertCell();
    if (window.loggedInUserStatus === 'admin') {
      const trancheButton = document.createElement('button');
      trancheButton.textContent = 'Payer une tranche';
      trancheButton.addEventListener('click', function () {
        openTrancheModal(key, data);
      });
      actionsCell.appendChild(trancheButton);
  
      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-edit edit-icon';
      editIcon.setAttribute('data-key', key);
      editIcon.addEventListener('click', openEditForm);
      actionsCell.appendChild(editIcon);
  
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'fas fa-trash delete-icon';
      deleteIcon.setAttribute('data-key', key);
      deleteIcon.addEventListener('click', deleteData);
      actionsCell.appendChild(deleteIcon);
    }
  }
  
  // Fonction pour ajouter une nouvelle ligne au tableau des retours
  function addRowToRetourTable(data, key) {
    const table = document.getElementById('retourTable').getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const date = new Date(year, month, day);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (monthYear !== currentMonth) {
        addMonthSeparator(table, monthYear);
      }
    } else {
      console.error(`Format de date incorrect: ${data.date}`);
      const errorRow = table.insertRow(0);
      const errorCell = errorRow.insertCell();
      errorCell.colSpan = 8;
      errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
      errorCell.classList.add('error-row');
      return;
    }
  
    const newRow = table.insertRow();
    newRow.setAttribute('data-key', key);
    newRow.insertCell().textContent = data.date;
    newRow.insertCell().textContent = data.designation;
    newRow.insertCell().textContent = data.quantity;
    newRow.insertCell().textContent = formatPrice(data.montantAjoute);
    newRow.insertCell().textContent = formatPrice(data.price);
  
    const ancienneImageCell = newRow.insertCell();
    if (data.ancienneImage) {
      storage.ref(data.ancienneImage).getMetadata().then(() => {
        return storage.ref(data.ancienneImage).getDownloadURL();
      }).then((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Ancienne Image";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        ancienneImageCell.appendChild(img);
        img.addEventListener('click', function () {
          openImageModal(url);
        });
      }).catch((error) => {
        console.error("Erreur lors de la récupération de l'ancienne image:", error);
        ancienneImageCell.textContent = "Image non disponible";
      });
    } else {
      ancienneImageCell.textContent = "Aucune image";
    }
  
    const nouvelleImageCell = newRow.insertCell();
    if (data.image) {
      storage.ref(data.image).getMetadata().then(() => {
        return storage.ref(data.image).getDownloadURL();
      }).then((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Nouvelle Image";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        nouvelleImageCell.appendChild(img);
        img.addEventListener('click', function () {
          openImageModal(url);
        });
      }).catch((error) => {
        console.error("Erreur lors de la récupération de la nouvelle image:", error);
        nouvelleImageCell.textContent = "Image non disponible";
      });
    } else {
      nouvelleImageCell.textContent = "Aucune image";
    }
  
    const actionsCell = newRow.insertCell();
    if (window.loggedInUserStatus === 'admin') {
      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-edit edit-icon';
      editIcon.setAttribute('data-key', key);
      editIcon.addEventListener('click', openEditForm);
      actionsCell.appendChild(editIcon);
  
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'fas fa-trash delete-icon';
      deleteIcon.setAttribute('data-key', key);
      deleteIcon.addEventListener('click', deleteData);
      actionsCell.appendChild(deleteIcon);
    }
  }
  
  // Fonction pour marquer une réservation comme payée
  function markReservationAsPaid(key, data) {
    data.saleType = "vente";
    database.ref().push().set(data)
      .then(() => database.ref('reservations/' + key).remove())
      .then(() => {
        deleteRowFromTable(key, 'reservationTable');
        addRowToTable(data, key, 'dataTable');
        alert("La réservation a été marquée comme payée et ajoutée aux ventes.");
      })
      .catch((error) => {
        console.error("Erreur lors du marquage de la réservation comme payée :", error);
      });
  }
  
  // Fonction pour supprimer une ligne du tableau
  function deleteRowFromTable(key, tableId) {
    const rowToDelete = document.querySelector(`#${tableId} tr[data-key="${key}"]`);
    if (rowToDelete) {
      rowToDelete.remove();
    }
  }
  
  // Fonction pour ajouter une ligne de séparation des mois
  function addMonthSeparator(table, monthYear) {
    if (currentMonth !== monthYear) {
      const separatorRow = table.insertRow();
      const separatorCell = separatorRow.insertCell();
      separatorCell.colSpan = table.rows[0].cells.length; //prends en compte le nombre de colone
      separatorCell.textContent = monthYear;
      separatorCell.classList.add('month-separator');
      currentMonth = monthYear;
    }
  }
  
  // Fonction pour mettre à jour une ligne existante du tableau
  function updateRowInTable(data, key, tableId = 'dataTable') {
    const rowToUpdate = document.querySelector(`#${tableId} tr[data-key="${key}"]`);
    if (rowToUpdate) {
      rowToUpdate.cells[0].textContent = data.date;
      if (tableId === 'dataTable' || tableId === 'retourTable') {
        rowToUpdate.cells[1].textContent = data.saleType;
      }
      rowToUpdate.cells[2].textContent = data.quantity;
      rowToUpdate.cells[3].textContent = data.designation;
      
      // Trouver l'index de la cellule du prix en fonction du tableau
      let priceColumnIndex = 4;
      if (tableId === 'reservationTable') {
        priceColumnIndex = 4; // Modifiez l'index pour la colonne du prix de vente
      }
      rowToUpdate.cells[priceColumnIndex].textContent = formatPrice(data.price);
  
      //if (tableId === 'reservationTable') {
      //  rowToUpdate.cells[4].textContent = formatPrice(data.montantPaye || 0);
      //}
  
      // Mettre à jour les images
      const imageCellIndex = tableId === 'reservationTable' ? 5 : 5;
      if (data.image) {
        const imageCell = rowToUpdate.cells[imageCellIndex];
        imageCell.innerHTML = '';
        storage.ref(data.image).getMetadata().then(() => {
          return storage.ref(data.image).getDownloadURL();
        }).then((url) => {
          const img = document.createElement('img');
          img.src = url;
          img.alt = "Image";
          img.style.maxWidth = "100px";
          img.style.maxHeight = "100px";
          imageCell.appendChild(img);
          img.addEventListener('click', function () {
            openImageModal(url);
          });
        }).catch((error) => {
          console.error("Erreur lors de la récupération de l'image:", error);
          imageCell.textContent = "Image non disponible";
        });
      }
  
      if (tableId === 'retourTable' && data.ancienneImage) {
        const ancienneImageCell = rowToUpdate.cells[5];
        ancienneImageCell.innerHTML = '';
        storage.ref(data.ancienneImage).getMetadata().then(() => {
          return storage.ref(data.ancienneImage).getDownloadURL();
        }).then((url) => {
          const img = document.createElement('img');
          img.src = url;
          img.alt = "Ancienne Image";
          img.style.maxWidth = "100px";
          img.style.maxHeight = "100px";
          ancienneImageCell.appendChild(img);
          img.addEventListener('click', function () {
            openImageModal(url);
          });
        }).catch((error) => {
          console.error("Erreur lors de la récupération de l'ancienne image:", error);
          ancienneImageCell.textContent = "Image non disponible";
        });
      }
  
      // Actions pour les réservations
      if (tableId === 'reservationTable' && rowToUpdate.cells.length === 7) { // Modifiez la longueur pour correspondre au nombre de colonnes
        const actionsCell = rowToUpdate.cells[6]; // Modifiez l'index pour la cellule Actions
        const trancheButton = actionsCell.querySelector('button');
        if (!trancheButton) {
          const newTrancheButton = document.createElement('button');
          newTrancheButton.textContent = 'Payer une tranche';
          newTrancheButton.addEventListener('click', function () {
            openTrancheModal(key, data);
          });
          actionsCell.appendChild(newTrancheButton);
        }
      }
    }
  }
  
  // Fonction pour ouvrir le formulaire de modification
  function openEditForm(event) {
    if (window.loggedInUserStatus === 'admin') {
      const dataKey = event.target.getAttribute('data-key');
      const modal = document.getElementById('editModal');
      modal.style.display = 'block';
  
      let dataRef = database.ref(dataKey);
      // Déterminer si la donnée est une réservation
      database.ref('reservations/' + dataKey).once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            dataRef = database.ref('reservations/' + dataKey);
          }
          return dataRef.once('value');
        })
        .then(snapshot => {
          const data = snapshot.val();
          document.getElementById('editDataKey').value = dataKey;
          document.getElementById('editDate').value = data.date;
          document.getElementById('editQuantity').value = data.quantity;
          document.getElementById('editPrice').value = data.price;
          document.getElementById('editFormattedPrice').textContent = formatPrice(data.price);
          document.getElementById('editSaleType').value = data.saleType;
          document.getElementById('editDesignation').value = data.designation;
          if (data.saleType === 'reservation') {
            document.getElementById('editAdvanceAmount').value = data.advance;
            toggleAdvanceField('editAdvanceField');
          } else if (data.saleType === 'retour') {
            document.getElementById('editRetourField').style.display = 'block';
            document.getElementById('editMontantAjoute').value = data.montantAjoute;
          } else {
            document.getElementById('editAdvanceField').style.display = 'none';
            document.getElementById('editRetourField').style.display = 'none';
          }
        });
  
      document.getElementById('editForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const dataKey = document.getElementById('editDataKey').value;
        const newDate = document.getElementById('editDate').value;
        const newQuantity = document.getElementById('editQuantity').value;
  
        // Obtenir la valeur numérique du prix sans formatage
        const newPrice = parseFloat(document.getElementById('editPrice').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
  
        const newSaleType = document.getElementById('editSaleType').value;
        const newDesignation = document.getElementById('editDesignation').value;
        const newAdvance = newSaleType === 'reservation' ? parseFloat(document.getElementById('editAdvanceAmount').value) : 0;
        const newMontantAjoute = newSaleType === 'retour' ? parseFloat(document.getElementById('editMontantAjoute').value) : 0;
        const newImageFile = document.getElementById('editImage').files[0];
        const newAncienneImageFile = newSaleType === 'retour' ? document.getElementById('editAncienneImage').files[0] : null;
  
        const newData = {
          date: newDate,
          saleType: newSaleType,
          quantity: newQuantity,
          designation: newDesignation,
          price: newPrice, // Stocker le prix numérique
          advance: newAdvance,
          montantAjoute: newMontantAjoute
        };
  
        let refToUpdate = database.ref(dataKey);
        if (newSaleType === 'reservation' && data.saleType !== 'reservation') {
          // Déplacer vers le tableau des réservations
          refToUpdate = database.ref('reservations').push();
          database.ref(dataKey).remove();
        } else if (newSaleType === 'retour' && data.saleType !== 'retour') {
          // Déplacer vers le tableau des retours
          refToUpdate = database.ref('retours').push();
          database.ref(dataKey).remove();
        } else if (newSaleType !== 'reservation' && data.saleType === 'reservation') {
          // Déplacer vers le tableau des ventes
          refToUpdate = database.ref().push();
          database.ref('reservations/' + dataKey).remove();
        } else if (newSaleType !== 'retour' && data.saleType === 'retour') {
          // Déplacer vers le tableau des ventes
          refToUpdate = database.ref().push();
          database.ref('retours/' + dataKey).remove();
        }
  
        refToUpdate.update(newData)
          .then(() => {
            if (newSaleType === 'retour' && newImageFile && newAncienneImageFile) {
              const storageRef = storage.ref().child(`images/${refToUpdate.key}_nouvelle.jpg`);
              const ancienneStorageRef = storage.ref().child(`images/${refToUpdate.key}_ancienne.jpg`);
              return Promise.all([
                storageRef.put(newImageFile),
                ancienneStorageRef.put(newAncienneImageFile)
              ]).then(([snapshot, ancienneSnapshot]) => {
                return refToUpdate.update({
                  image: snapshot.ref.fullPath,
                  ancienneImage: ancienneSnapshot.ref.fullPath
                });
              });
            } else if (newImageFile) {
              const storageRef = storage.ref().child(`images/${refToUpdate.key}.jpg`);
              return storageRef.put(newImageFile).then((snapshot) => {
                return refToUpdate.update({ image: snapshot.ref.fullPath });
              });
            }
          })
          .then(() => {
            closeModal('editModal');
            alert("Les données ont été mises à jour avec succès.");
            clearTable();
            loadDataFromDatabase();
          })
          .catch((error) => {
            console.error('Erreur lors de la mise à jour des données :', error);
          });
      });
    } else {
      alert("Vous n'êtes pas autorisé à modifier les données.");
    }
  }
  
  // Fonction pour supprimer la donnée (avec confirmation)
  function deleteData(event) {
    if (window.loggedInUserStatus === 'admin') {
      const dataKey = event.target.getAttribute('data-key');
      if (confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
        let refToDelete = database.ref(dataKey);
        database.ref(dataKey).once('value')
          .then(snapshot => {
            const data = snapshot.val();
            if (data.saleType === 'reservation') {
              refToDelete = database.ref('reservations/' + dataKey);
            } else if (data.saleType === 'retour') {
              refToDelete = database.ref('retours/' + dataKey);
            }
            return refToDelete.remove();
          })
          .then(() => {
            const storageRef = storage.ref(`images/${dataKey}.jpg`);
            return storageRef.delete().catch(error => {
              // Ignorer l'erreur si l'image n'existe pas
              if (error.code !== 'storage/object-not-found') {
                throw error;
              }
            });
          })
          .then(() => {
            alert("L'enregistrement a été supprimé avec succès.");
            clearTable();
            loadDataFromDatabase();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression des données :', error);
          });
      }
    } else {
      alert("Vous n'êtes pas autorisé à supprimer des données.");
    }
  }
  
  
  // Fonction pour afficher/masquer le tableau des ventes
  function toggleTable() {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
    document.getElementById('reservationsContainer').style.display = 'none';
    document.getElementById('retoursContainer').style.display = 'none';
  }
  
  // Fonction pour afficher/masquer le tableau des réservations
  function toggleReservationsTable() {
    const reservationsContainer = document.getElementById('reservationsContainer');
    reservationsContainer.style.display = reservationsContainer.style.display === 'none' ? 'block' : 'none';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('retoursContainer').style.display = 'none';
  }
  
  // Fonction pour afficher/masquer le tableau des retours
  function toggleRetoursTable() {
    const retoursContainer = document.getElementById('retoursContainer');
    retoursContainer.style.display = retoursContainer.style.display === 'none' ? 'block' : 'none';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('reservationsContainer').style.display = 'none';
  }
  
  // Gestionnaires d'événements pour les boutons d'affichage des tableaux
  document.getElementById('toggleTableButton').addEventListener('click', function () {
    toggleTable();
    clearTable();
    loadDataFromDatabase();
    document.getElementById('tableContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  
  document.getElementById('toggleReservationsButton').addEventListener('click', function () {
    toggleReservationsTable();
    clearTable();
    loadDataFromDatabase();
    document.getElementById('reservationsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  
  document.getElementById('toggleRetoursButton').addEventListener('click', function () {
    toggleRetoursTable();
    clearTable();
    loadDataFromDatabase();
    document.getElementById('retoursContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  
  // Fonction pour fermer la fenêtre modale
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
  if (modalId === 'advanceModal') {
    document.getElementById('advanceForm').reset();
    document.getElementById('formattedModalAdvance').textContent = ' F CFA'; // Réinitialiser l'affichage
  } else if (modalId === 'editModal') {
    document.getElementById('editForm').reset();
    document.getElementById('editFormattedPrice').textContent = ' F CFA'; // Réinitialiser l'affichage
    document.getElementById('formattedEditAdvance').textContent = ' F CFA'; // Réinitialiser l'affichage
    document.getElementById('formattedEditMontantAjoute').textContent = ' F CFA'; // Réinitialiser l'affichage
  } else if (modalId === 'trancheModal') {
    document.getElementById('trancheForm').reset();
    document.getElementById('formattedTrancheAmount').textContent = ' F CFA'; // Réinitialiser l'affichage
  }
}

// Fonction pour vider les tableaux
function clearTable() {
  const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';
  const reservationTableBody = document.getElementById('reservationTable').getElementsByTagName('tbody')[0];
  reservationTableBody.innerHTML = '';
  const retourTableBody = document.getElementById('retourTable').getElementsByTagName('tbody')[0];
  retourTableBody.innerHTML = '';
  currentMonth = null;
}

// Fonction pour ouvrir une fenêtre modale pour afficher l'image en grand
function openImageModal(imageUrl) {
  const modal = document.createElement('div');
  modal.classList.add('image-modal');
  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = "Image agrandie";

  // Fermer la modale en cliquant en dehors de l'image
  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });

  const closeButton = document.createElement('span');
  closeButton.classList.add('close-image-modal');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', function () {
    document.body.removeChild(modal);
  });

  modal.appendChild(image);
  modal.appendChild(closeButton);
  document.body.appendChild(modal);
}


// Fonction pour ouvrir la fenêtre modale de saisie du montant de la tranche
function openTrancheModal(key, data) {
  const modal = document.getElementById('trancheModal');
  modal.style.display = 'block';

  // Afficher les informations de la réservation dans la fenêtre modale
  document.getElementById('trancheModalDesignation').textContent = data.designation;
  document.getElementById('trancheModalQuantity').textContent = data.quantity;
  document.getElementById('trancheModalPrice').textContent = formatPrice(data.price);
  document.getElementById('trancheModalAvance').textContent = formatPrice(data.advance);

  // Mettre à jour le montant de la tranche
  document.getElementById('trancheAmount').addEventListener('input', function() {
    const trancheAmount = parseFloat(this.value);
    if (!isNaN(trancheAmount)) {
      document.getElementById('formattedTrancheAmount').textContent = formatPrice(trancheAmount);
    } else {
      document.getElementById('formattedTrancheAmount').textContent = ' F CFA';
    }
  });

  // Gestionnaire d'événements pour le formulaire de saisie du montant de la tranche
  document.getElementById('trancheForm').addEventListener('submit', function(e) {
    e.preventDefault();
    payerTranche(key, data);
  });
}

function payerTranche(key, data) {
    const trancheAmount = parseFloat(document.getElementById('trancheAmount').value);
  
    if (isNaN(trancheAmount)) {
      alert("Veuillez saisir un montant valide pour la tranche.");
      return;
    }
  
    // Mettre à jour le montant avancé dans la base de données
    const newAdvance = data.advance + trancheAmount;
    database.ref('reservations/' + key).update({ advance: newAdvance })
      .then(() => {
        closeModal('trancheModal');
        clearTable();
        loadDataFromDatabase();
        alert("Le paiement de la tranche a été enregistré. Nouveau montant avancé : " + formatPrice(newAdvance));
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du paiement de la tranche :", error);
      });
  }

// Fonction pour payer la totalité de la réservation
function payerTotal() {
  if (!selectedReservationKey) {
    alert("Veuillez sélectionner une réservation dans le tableau.");
    return;
  }

  database.ref('reservations/' + selectedReservationKey).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      data.saleType = 'vente';
      return database.ref().push().set(data);
    })
    .then(() => database.ref('reservations/' + selectedReservationKey).remove())
    .then(() => {
      closeModal('trancheModal');
      clearTable();
      loadDataFromDatabase();
      alert("La réservation a été entièrement payée et déplacée vers le tableau des ventes.");
      selectedReservationKey = null; // Réinitialiser la sélection
    })
    .catch((error) => {
      console.error("Erreur lors du paiement total de la réservation :", error);
    });
}

// Fonction pour gérer le classement par mois
function addMonthSeparator(table, monthYear) {
  if (currentMonth !== monthYear) {
    const separatorRow = table.insertRow();
    const separatorCell = separatorRow.insertCell();
    separatorCell.colSpan = table.rows[0].cells.length;
    separatorCell.textContent = monthYear;
    separatorCell.classList.add('month-separator');
    currentMonth = monthYear;
  }
}

// ... (Autres fonctions existantes) ...

// Ecouteur d'évènements pour le champ "Prix de vente" du formulaire principal
document.getElementById('price').addEventListener('input', function () {
  const priceInput = this;
  const priceValue = parseFloat(priceInput.value);

  if (!isNaN(priceValue)) {
    document.getElementById('formattedPrice').textContent = formatPrice(priceValue);
  } else {
    document.getElementById('formattedPrice').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Montant avancé" du formulaire principal
document.getElementById('advanceAmount').addEventListener('input', function () {
  const advanceInput = this;
  const advanceValue = parseFloat(advanceInput.value);

  if (!isNaN(advanceValue)) {
    document.getElementById('formattedAdvance').textContent = formatPrice(advanceValue);
  } else {
    document.getElementById('formattedAdvance').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Montant ajouté" du formulaire principal
document.getElementById('montantAjoute').addEventListener('input', function () {
  const montantAjouteInput = this;
  const montantAjouteValue = parseFloat(montantAjouteInput.value);

  if (!isNaN(montantAjouteValue)) {
    document.getElementById('formattedMontantAjoute').textContent = formatPrice(montantAjouteValue);
  } else {
    document.getElementById('formattedMontantAjoute').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Prix de vente" dans la fenêtre de modification
document.getElementById('editPrice').addEventListener('input', function () {
  const priceInput = this;
  const priceValue = parseFloat(priceInput.value);

  if (!isNaN(priceValue)) {
    document.getElementById('editFormattedPrice').textContent = formatPrice(priceValue);
  } else {
    document.getElementById('editFormattedPrice').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Montant avancé" dans la fenêtre de modification
document.getElementById('editAdvanceAmount').addEventListener('input', function () {
  const advanceInput = this;
  const advanceValue = parseFloat(advanceInput.value);

  if (!isNaN(advanceValue)) {
    document.getElementById('formattedEditAdvance').textContent = formatPrice(advanceValue);
  } else {
    document.getElementById('formattedEditAdvance').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Montant ajouté" dans la fenêtre de modification
document.getElementById('editMontantAjoute').addEventListener('input', function () {
  const montantAjouteInput = this;
  const montantAjouteValue = parseFloat(montantAjouteInput.value);

  if (!isNaN(montantAjouteValue)) {
    document.getElementById('formattedEditMontantAjoute').textContent = formatPrice(montantAjouteValue);
  } else {
    document.getElementById('formattedEditMontantAjoute').textContent = ' F CFA';
  }
});

// Ecouteur d'évènements pour le champ "Montant avancé" dans la fenêtre modale d'avance
document.getElementById('advanceAmount').addEventListener('input', function () {
  const advanceInput = this;
  const advanceValue = parseFloat(advanceInput.value);

  if (!isNaN(advanceValue)) {
    document.getElementById('formattedModalAdvance').textContent = formatPrice(advanceValue);
  } else {
    document.getElementById('formattedModalAdvance').textContent = ' F CFA';
  }
});

// Charger les données depuis Firebase
function loadDataFromDatabase() {
  currentMonth = null; // Réinitialiser le mois courant à chaque chargement

  // Charger les données des ventes
  database.ref().orderByChild('date').on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.saleType !== 'reservation' && data.saleType !== 'retour') {
      addRowToTable(data, snapshot.key, 'dataTable');
    }
  });

  // Charger les réservations
  database.ref('reservations').orderByChild('date').on("child_added", (snapshot) => {
    const data = snapshot.val();
    addRowToReservationTable(data, snapshot.key);
  });

  // Charger les retours
  database.ref('retours').orderByChild('date').on("child_added", (snapshot) => {
    const data = snapshot.val();
    addRowToRetourTable(data, snapshot.key);
  });

  // Gérer les modifications de données
  database.ref().on("child_changed", (snapshot) => {
    const data = snapshot.val();
    if (data.saleType !== 'reservation' && data.saleType !== 'retour') {
      updateRowInTable(data, snapshot.key, 'dataTable');
    }
  });

  database.ref('reservations').on("child_changed", (snapshot) => {
    const data = snapshot.val();
    updateRowInTable(data, snapshot.key, 'reservationTable');
  });

  database.ref('retours').on("child_changed", (snapshot) => {
    const data = snapshot.val();
    updateRowInTable(data, snapshot.key, 'retourTable');
  });

  // Gérer les suppressions de données
  database.ref().on("child_removed", (snapshot) => {
    deleteRowFromTable(snapshot.key, 'dataTable');
  });

  database.ref('reservations').on("child_removed", (snapshot) => {
    deleteRowFromTable(snapshot.key, 'reservationTable');
  });

  database.ref('retours').on("child_removed", (snapshot) => {
    deleteRowFromTable(snapshot.key, 'retourTable');
  });
}