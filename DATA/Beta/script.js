// Initialisation de Firebase
const firebaseConfig = {
    apiKey: "edhBDEDBHUIBBH BDUHZSUBHUJ",
    authDomain: "razia-data.firebaseapp.com",
    databaseURL: "https://hiruhiiu sibuiruhbziebu.com",
    projectId: "razia-data",
    storageBucket: "razia-data.appspot.com",
    messagingSenderId: "5648484565468468",
    appId: "1:7975648452648565848858652",
    measurementId: "G-FCBJKDHKBCHE"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

let currentMonth = null;
let selectedReservationKey = null;

// Fonction pour formater le prix en F CFA
function formatPrice(price) {
    return `${price.toLocaleString('fr-FR', {minimumFractionDigits: 0})} F CFA`;
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
    e.preventDefault(); // Empêcher l'actualisation de la page

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    checkCredentials(username, password).then((isValid) => {
        if (isValid) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainPage').style.display = 'block';
            document.getElementById('usernameDisplay').textContent = `Utilisateur : ${window.loggedInUsername}`;
            document.getElementById('userStatusDisplay').textContent = `Statut : ${window.loggedInUserStatus}`;

            // Gestion des autorisations en fonction du statut de l'utilisateur
            if (window.loggedInUserStatus === 'admin') {
                // Afficher les icônes d'édition et de suppression pour l'administrateur
                const editIcons = document.querySelectorAll('.edit-icon');
                const deleteIcons = document.querySelectorAll('.delete-icon');
                editIcons.forEach(icon => icon.style.display = 'inline-block');
                deleteIcons.forEach(icon => icon.style.display = 'inline-block');
            } else if (window.loggedInUserStatus === 'standard') {
                // Désactiver tous les champs de saisie pour l'utilisateur standard
                const inputFields = document.querySelectorAll('#dataForm input, #dataForm select, #dataForm button');
                inputFields.forEach(field => field.disabled = true);
            }

            loadDataFromDatabase();
        } else {
            alert('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    });
});

// Fonction pour afficher/masquer le mot de passe
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
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
        const telephone = saleType === 'reservation' ? document.getElementById('telephone').value : '';
        const montantAjoute = saleType === 'retour' ? parseFloat(document.getElementById('montantAjoute').value) : 0;
        const imageFile = document.getElementById('image').files[0];
        const ancienneImageFile = saleType === 'retour' ? document.getElementById('ancienneImage').files[0] : null;

        const data = {
            date: date,
            saleType: saleType,
            quantity: quantity,
            designation: designation,
            price: price,
            advance: advance,
            telephone: telephone,
            montantAjoute: montantAjoute
        };

        // Vérifier si une image a été sélectionnée
        if (!imageFile) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        let newDataRef;
        if (saleType === 'reservation') {
            newDataRef = database.ref('reservations').push();
        } else if (saleType === 'retour') {
            newDataRef = database.ref('retours').push();
        } else {
            newDataRef = database.ref().push();
        }

        // Afficher la barre de chargement
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        submitButton.disabled = true;


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
                        return newDataRef.update({image: snapshot.ref.fullPath});
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

                // Afficher le tableau correspondant et faire défiler jusqu'à la nouvelle entrée
                const targetContainer = saleType === 'reservation'
                    ? 'reservationsContainer'
                    : saleType === 'retour'
                        ? 'retoursContainer'
                        : 'tableContainer';
                document.getElementById(targetContainer).style.display = 'block';
                const otherContainers = ['tableContainer', 'reservationsContainer', 'retoursContainer'].filter(c => c !== targetContainer);
                otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
                document.getElementById(targetContainer).scrollIntoView({behavior: 'smooth'});

                // Réinitialiser le formulaire et afficher seulement les champs liés à la vente
                resetForm('dataForm');
                document.getElementById('saleType').value = 'vente'; // Définir le type de vente par défaut à "vente"
                toggleAdvanceField(); // Masquer les champs "Montant avancé" et "Montant ajouté"
                document.getElementById('date').focus();

                // Masquer la barre de chargement et réactiver le bouton
                submitButton.innerHTML = 'Enregistrer';
                submitButton.disabled = false;

            })
            .catch((error) => {
                console.error(`Erreur lors de l'enregistrement des données :`, error);

                // Masquer la barre de chargement et réactiver le bouton en cas d'erreur
                submitButton.innerHTML = 'Enregistrer';
                submitButton.disabled = false;

            });
    } else {
        alert("Vous n'êtes pas autorisé à enregistrer des données.");
    }
});

// Fonction pour ajouter une nouvelle ligne au tableau principal des ventes
function addRowToTable(data, key, tableId = 'dataTable', reverseOrder = false) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        const monthYear = `${date.toLocaleString('default', {month: 'long'})} ${date.getFullYear()}`;

        // Gestion de l'ordre inverse pour la séparation des mois
        if (reverseOrder) {
            if (currentMonth !== monthYear) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        } else {
            if (monthYear !== currentMonth) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        }
    } else {
        console.error(`Format de date incorrect: ${data.date}`);
        const errorRow = table.insertRow(reverseOrder ? 0 : null);
        const errorCell = errorRow.insertCell();
        errorCell.colSpan = 7;
        errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
        errorCell.classList.add('error-row');
        return;
    }

    const newRow = table.insertRow(reverseOrder ? 0 : null);
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
        editIcon.addEventListener('click', openEditForm); // Appeler openEditForm au clic
        actionsCell.appendChild(editIcon);

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash delete-icon';
        deleteIcon.setAttribute('data-key', key);
        deleteIcon.addEventListener('click', deleteData);
        actionsCell.appendChild(deleteIcon);
    }
}

// Fonction pour ajouter une nouvelle ligne au tableau des réservations
function addRowToReservationTable(data, key, reverseOrder = false) {
    const table = document.getElementById('reservationTable').getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        const monthYear = `${date.toLocaleString('default', {month: 'long'})} ${date.getFullYear()}`;

        // Gestion de l'ordre inverse pour la séparation des mois
        if (reverseOrder) {
            if (currentMonth !== monthYear) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        } else {
            if (monthYear !== currentMonth) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        }
    } else {
        console.error(`Format de date incorrect: ${data.date}`);
        const errorRow = table.insertRow(reverseOrder ? 0 : null);
        const errorCell = errorRow.insertCell();
        errorCell.colSpan = 9;
        errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
        errorCell.classList.add('error-row');
        return;
    }

    const newRow = table.insertRow(reverseOrder ? 0 : null);
    newRow.setAttribute('data-key', key);
    newRow.addEventListener('click', function () {
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
    const resteAPayer = data.price - data.advance;
    newRow.insertCell().textContent = formatPrice(resteAPayer);
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

    newRow.insertCell().textContent = data.telephone;

    const actionsCell = newRow.insertCell();
    if (window.loggedInUserStatus === 'admin') {
        const trancheButton = document.createElement('button');
        trancheButton.textContent = 'Payer';
        trancheButton.addEventListener('click', function () {
            openTrancheModal(key, data);
        });
        actionsCell.appendChild(trancheButton);

        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit edit-icon';
        editIcon.setAttribute('data-key', key);
        editIcon.addEventListener('click', openEditReservationForm); // Ouvrir la fenêtre de modification des réservations
        actionsCell.appendChild(editIcon);

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash delete-icon';
        deleteIcon.setAttribute('data-key', key);
        deleteIcon.addEventListener('click', deleteData);
        actionsCell.appendChild(deleteIcon);
    }
}


// Fonction pour ajouter une nouvelle ligne au tableau des retours
function addRowToRetourTable(data, key, reverseOrder = false) {
    const table = document.getElementById('retourTable').getElementsByTagName('tbody')[0];
    const dateParts = data.date.split('-');
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        const monthYear = `${date.toLocaleString('default', {month: 'long'})} ${date.getFullYear()}`;

        // Gestion de l'ordre inverse pour la séparation des mois
        if (reverseOrder) {
            if (currentMonth !== monthYear) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        } else {
            if (monthYear !== currentMonth) {
                addMonthSeparator(table, monthYear, reverseOrder);
                currentMonth = monthYear;
            }
        }
    } else {
        console.error(`Format de date incorrect: ${data.date}`);
        const errorRow = table.insertRow(reverseOrder ? 0 : null);
        const errorCell = errorRow.insertCell();
        errorCell.colSpan = 8;
        errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
        errorCell.classList.add('error-row');
        return;
    }

    const newRow = table.insertRow(reverseOrder ? 0 : null);
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
        editIcon.addEventListener('click', openEditRetourForm); // Ouvrir la fenêtre de modification des retours
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

// Fonction pour ajouter une ligne de séparation des mois (modifiée pour gérer l'ordre inverse)
function addMonthSeparator(table, monthYear, reverseOrder = false) {
    if (currentMonth !== monthYear) {
        const separatorRow = table.insertRow(reverseOrder ? 0 : null); // Insérer au début si reverseOrder est true
        const separatorCell = separatorRow.insertCell();
        separatorCell.colSpan = table.rows[0].cells.length;
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
            priceColumnIndex = 5;
            const resteAPayer = data.price - data.advance;
            rowToUpdate.cells[4].textContent = formatPrice(resteAPayer);
        }
        rowToUpdate.cells[priceColumnIndex].textContent = formatPrice(data.price);

        // Mettre à jour les images
        let imageCellIndex = 5;
        if (tableId === 'reservationTable') {
            imageCellIndex = 6;
            rowToUpdate.cells[7].textContent = data.telephone;
        }
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
        if (tableId === 'reservationTable' && rowToUpdate.cells.length === 9) {
            const actionsCell = rowToUpdate.cells[8];
            const trancheButton = actionsCell.querySelector('button');
            if (!trancheButton) {
                const newTrancheButton = document.createElement('button');
                newTrancheButton.textContent = 'Payer';
                newTrancheButton.addEventListener('click', function () {
                    openTrancheModal(key, data);
                });
                actionsCell.appendChild(newTrancheButton);
            }
        }
    }
}

// Fonction pour ouvrir le formulaire de modification des ventes (modifiée)
function openEditForm(event) {
    if (window.loggedInUserStatus === 'admin') {
        const row = event.target.closest('tr'); // Obtenir la ligne parente de l'icône cliquée
        const dataKey = row.getAttribute('data-key');
        const modal = document.getElementById('editModal');
        modal.style.display = 'block';
        let dataRef = database.ref(dataKey);
        let tableId = 'dataTable';

        // Récupérer les données de la ligne
        const date = row.cells[0].textContent;
        const saleType = row.cells[1].textContent;
        const quantity = row.cells[2].textContent;
        const designation = row.cells[3].textContent;
        let price = row.cells[4].textContent;

        // Nettoyer et formater le prix
        price = price.replace(' F CFA', '').replace(/\s/g, '');
        price = parseFloat(price);

        // Remplir les champs de la fenêtre modale
        document.getElementById('editDataKey').value = dataKey;
        document.getElementById('editDate').value = date;
        document.getElementById('editSaleType').value = saleType;
        document.getElementById('editQuantity').value = quantity;
        document.getElementById('editDesignation').value = designation;
        document.getElementById('editPrice').value = price;
        document.getElementById('editFormattedPrice').textContent = formatPrice(price);

        // Déterminer si la donnée est une réservation ou un retour
        database.ref('reservations/' + dataKey).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    dataRef = database.ref('reservations/' + dataKey);
                    tableId = 'reservationTable';
                } else {
                    return database.ref('retours/' + dataKey).once('value')
                        .then(snapshot => {
                            if (snapshot.exists()) {
                                dataRef = database.ref('retours/' + dataKey);
                                tableId = 'retourTable';
                            }
                        });
                }
                return dataRef.once('value');
            })
            .then(snapshot => {
                const data = snapshot.val();
                // Gérer les champs "Montant avancé" et "Montant ajouté"
                if (saleType === 'reservation') {
                    document.getElementById('editAdvanceAmount').value = data.advance;
                    document.getElementById('formattedEditAdvance').textContent = formatPrice(data.advance);
                    document.getElementById('editTelephone').value = data.telephone;
                    toggleAdvanceField('editAdvanceField');
                } else if (saleType === 'retour') {
                    document.getElementById('editMontantAjoute').value = data.montantAjoute;
                    document.getElementById('formattedEditMontantAjoute').textContent = formatPrice(data.montantAjoute);
                    toggleAdvanceField('editAdvanceField'); // Afficher le champ "Montant ajouté" pour les retours
                } else {
                    document.getElementById('editAdvanceField').style.display = 'none';
                    document.getElementById('editRetourField').style.display = 'none';
                }
            });

        // Gestionnaire d'événements pour la soumission du formulaire "editForm"
        document.getElementById('editForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const newData = {
                date: document.getElementById('editDate').value,
                saleType: document.getElementById('editSaleType').value,
                quantity: document.getElementById('editQuantity').value,
                designation: document.getElementById('editDesignation').value,
                price: parseFloat(document.getElementById('editPrice').value),
                advance: document.getElementById('editSaleType').value === 'reservation' ?
                    parseFloat(document.getElementById('editAdvanceAmount').value) : 0,
                telephone: document.getElementById('editSaleType').value === 'reservation' ?
                    document.getElementById('editTelephone').value : '',
                montantAjoute: document.getElementById('editSaleType').value === 'retour' ?
                    parseFloat(document.getElementById('editMontantAjoute').value) : 0
            };

            // Mettre à jour la base de données
            let refToUpdate = database.ref(dataKey);
            if (newData.saleType === 'reservation' && saleType !== 'reservation') {
                refToUpdate = database.ref('reservations').push();
                database.ref(dataKey).remove();
            } else if (newData.saleType === 'retour' && saleType !== 'retour') {
                refToUpdate = database.ref('retours').push();
                database.ref(dataKey).remove();
            } else if (newData.saleType !== 'reservation' && saleType === 'reservation') {
                refToUpdate = database.ref().push();
                database.ref('reservations/' + dataKey).remove();
            } else if (newData.saleType !== 'retour' && saleType === 'retour') {
                refToUpdate = database.ref().push();
                database.ref('retours/' + dataKey).remove();
            }

            refToUpdate.update(newData)
                .then(() => {
                    // Gérer la mise à jour de l'image si nécessaire
                    const newImageFile = document.getElementById('editImage').files[0];
                    const newAncienneImageFile = document.getElementById('editSaleType').value === 'retour' ?
                        document.getElementById('editAncienneImage').files[0] : null;

                    const promises = [];
                    if (newImageFile) {
                        const storageRef = storage.ref().child(`images/${refToUpdate.key}.jpg`);
                        promises.push(storageRef.put(newImageFile).then((snapshot) => {
                            return refToUpdate.update({image: snapshot.ref.fullPath});
                        }));
                    }
                    if (newAncienneImageFile) {
                        const ancienneStorageRef = storage.ref().child(`images/${refToUpdate.key}_ancienne.jpg`);
                        promises.push(ancienneStorageRef.put(newAncienneImageFile).then((snapshot) => {
                            return refToUpdate.update({ancienneImage: ancienneSnapshot.ref.fullPath});
                        }));
                    }
                    return Promise.all(promises);
                })
                .then(() => {
                    closeModal('editModal');
                    alert("Les données ont été mises à jour avec succès.");
                    clearTable();
                    loadDataFromDatabase();

                    // Afficher le tableau correspondant après la modification
                    const targetContainer = newData.saleType === 'reservation'
                        ? 'reservationsContainer'
                        : newData.saleType === 'retour'
                            ? 'retoursContainer'
                            : 'tableContainer';
                    document.getElementById(targetContainer).style.display = 'block';
                    const otherContainers = ['tableContainer', 'reservationsContainer', 'retoursContainer'].filter(c => c !== targetContainer);
                    otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
                    document.getElementById(targetContainer).scrollIntoView({behavior: 'smooth'});
                })
                .catch((error) => {
                    console.error('Erreur lors de la mise à jour des données :', error);
                });
        });
    } else {
        alert("Vous n'êtes pas autorisé à modifier les données.");
    }
}


// Fonction pour ouvrir le formulaire de modification des réservations
function openEditReservationForm(event) {
  if (window.loggedInUserStatus === 'admin') {
    const row = event.target.closest('tr'); // Obtenir la ligne parente de l'icône cliquée
    const dataKey = row.getAttribute('data-key');
    const modal = document.getElementById('editReservationModal');
    modal.style.display = 'block';

    // Récupérer les données de la ligne
    const date = row.cells[0].textContent;
    const designation = row.cells[1].textContent;
    const quantity = row.cells[2].textContent;
    let advance = row.cells[3].textContent;
    let price = row.cells[5].textContent;
    const telephone = row.cells[7].textContent;

    // Supprimer " F CFA" du prix et du montant ajouté
    price = price.replace(' F CFA', '').replace(/\s/g, '');
    advance = advance.replace(' F CFA', '').replace(/\s/g, '');
    // Convertir en nombre
    price = parseFloat(price);
    advance = parseFloat(advance);

    // Remplir les champs de la fenêtre modale
    document.getElementById('editReservationDataKey').value = dataKey;
    document.getElementById('editReservationDate').value = date;
    document.getElementById('editReservationQuantity').value = quantity;
    document.getElementById('editReservationPrice').value = price;
    document.getElementById('editReservationFormattedPrice').textContent = formatPrice(price);
    document.getElementById('editReservationDesignation').value = designation;
    document.getElementById('editReservationAdvanceAmount').value = advance;
    document.getElementById('editReservationFormattedAdvance').textContent = formatPrice(advance);
    document.getElementById('editReservationTelephone').value = telephone;

    document.getElementById('editReservationForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const dataKey = document.getElementById('editReservationDataKey').value;
      const newDate = document.getElementById('editReservationDate').value;
      const newQuantity = document.getElementById('editReservationQuantity').value;
      const newPrice = parseFloat(document.getElementById('editReservationPrice').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
      const newDesignation = document.getElementById('editReservationDesignation').value;
      const newAdvance = parseFloat(document.getElementById('editReservationAdvanceAmount').value);
      const newTelephone = document.getElementById('editReservationTelephone').value;
      const newImageFile = document.getElementById('editReservationImage').files[0];

      const newData = {
        date: newDate,
        saleType: 'reservation', // Le type de vente reste "reservation"
        quantity: newQuantity,
        designation: newDesignation,
        price: newPrice,
        advance: newAdvance,
        telephone: newTelephone
      };

      database.ref('reservations/' + dataKey).update(newData)
        .then(() => {
          if (newImageFile) {
            const storageRef = storage.ref().child(`images/${dataKey}.jpg`);
            return storageRef.put(newImageFile).then((snapshot) => {
              return database.ref('reservations/' + dataKey).update({image: snapshot.ref.fullPath});
            });
          }
        })
        .then(() => {
          closeModal('editReservationModal');
          alert("Les données de la réservation ont été mises à jour avec succès.");
          clearTable();
          loadDataFromDatabase();

          // Afficher le tableau des réservations après la modification
          document.getElementById('reservationsContainer').style.display = 'block';
          const otherContainers = ['tableContainer', 'retoursContainer'];
          otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
          document.getElementById('reservationsContainer').scrollIntoView({behavior: 'smooth'});
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour des données de la réservation :', error);
        });
    });
  } else {
    alert("Vous n'êtes pas autorisé à modifier les données.");
  }
}
// Fonction pour ouvrir le formulaire de modification des retours
function openEditRetourForm(event) {
  if (window.loggedInUserStatus === 'admin') {
    const row = event.target.closest('tr'); // Obtenir la ligne parente de l'icône cliquée
    const dataKey = row.getAttribute('data-key');
    const modal = document.getElementById('editRetourModal');
    modal.style.display = 'block';

    // Récupérer les données de la ligne
    const date = row.cells[0].textContent;
    const designation = row.cells[1].textContent;
    const quantity = row.cells[2].textContent;
    let montantAjoute = row.cells[3].textContent;
    let price = row.cells[4].textContent;

    // Supprimer " F CFA" du prix et du montant ajouté
    price = price.replace(' F CFA', '').replace(/\s/g, '');
    montantAjoute = montantAjoute.replace(' F CFA', '').replace(/\s/g, '');
    // Convertir en nombre
    price = parseFloat(price);
    montantAjoute = parseFloat(montantAjoute);

    // Remplir les champs de la fenêtre modale
    document.getElementById('editRetourDataKey').value = dataKey;
    document.getElementById('editRetourDate').value = date;
    document.getElementById('editRetourQuantity').value = quantity;
    document.getElementById('editRetourPrice').value = price;
    document.getElementById('editRetourFormattedPrice').textContent = formatPrice(price);
    document.getElementById('editRetourDesignation').value = designation;
    document.getElementById('editRetourMontantAjoute').value = montantAjoute;
    document.getElementById('editRetourFormattedMontantAjoute').textContent = formatPrice(montantAjoute);

    document.getElementById('editRetourForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const dataKey = document.getElementById('editRetourDataKey').value;
      const newDate = document.getElementById('editRetourDate').value;
      const newQuantity = document.getElementById('editRetourQuantity').value;
      const newPrice = parseFloat(document.getElementById('editRetourPrice').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
      const newDesignation = document.getElementById('editRetourDesignation').value;
      const newMontantAjoute = parseFloat(document.getElementById('editRetourMontantAjoute').value);
      const newImageFile = document.getElementById('editRetourImage').files[0];
      const newAncienneImageFile = document.getElementById('editRetourAncienneImage').files[0];

      const newData = {
        date: newDate,
        saleType: 'retour', // Le type de vente reste "retour"
        quantity: newQuantity,
        designation: newDesignation,
        price: newPrice,
        montantAjoute: newMontantAjoute
      };

      database.ref('retours/' + dataKey).update(newData)
        .then(() => {
          if (newImageFile && newAncienneImageFile) {
            const storageRef = storage.ref().child(`images/${dataKey}_nouvelle.jpg`);
            const ancienneStorageRef = storage.ref().child(`images/${dataKey}_ancienne.jpg`);
            return Promise.all([
              storageRef.put(newImageFile),
              ancienneStorageRef.put(newAncienneImageFile)
            ]).then(([snapshot, ancienneSnapshot]) => {
              return database.ref('retours/' + dataKey).update({
                image: snapshot.ref.fullPath,
                ancienneImage: ancienneSnapshot.ref.fullPath
              });
            });
          } else if (newImageFile) {
            const storageRef = storage.ref().child(`images/${dataKey}_nouvelle.jpg`);
            return storageRef.put(newImageFile).then((snapshot) => {
              return database.ref('retours/' + dataKey).update({image: snapshot.ref.fullPath});
            });
          } else if (newAncienneImageFile) {
            const ancienneStorageRef = storage.ref().child(`images/${dataKey}_ancienne.jpg`);
            return ancienneStorageRef.put(newAncienneImageFile).then((snapshot) => {
              return database.ref('retours/' + dataKey).update({ancienneImage: ancienneSnapshot.ref.fullPath});
            });
          }
        })
        .then(() => {
          closeModal('editRetourModal');
          alert("Les données du retour ont été mises à jour avec succès.");
          clearTable();
          loadDataFromDatabase();

          // Afficher le tableau des retours après la modification
          document.getElementById('retoursContainer').style.display = 'block';
          const otherContainers = ['tableContainer', 'reservationsContainer'];
          otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
          document.getElementById('retoursContainer').scrollIntoView({behavior: 'smooth'});
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour des données du retour :', error);
        });
    });
  } else {
    alert("Vous n'êtes pas autorisé à modifier les données.");
  }
}

// Fonction pour supprimer la donnée (corrigée)
function deleteData(event) {
  if (window.loggedInUserStatus === 'admin') {
    const dataKey = event.target.getAttribute('data-key');
    const tableRow = event.target.closest('tr'); // Obtenir la ligne parente de l'icône cliquée
    const tableId = tableRow.parentNode.parentNode.id; // Obtenir l'ID du tableau

    if (confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
      let refToDelete = database.ref(dataKey); // Supposons d'abord que c'est une vente

      // Vérifier si la donnée est une réservation ou un retour
      if (tableId === 'reservationTable') {
        refToDelete = database.ref('reservations/' + dataKey);
      } else if (tableId === 'retourTable') {
        refToDelete = database.ref('retours/' + dataKey);
      }

      refToDelete.remove()
        .then(() => {
          // Supprimer l'image associée (si elle existe)
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
          // Supprimer la ligne du tableau correspondant
          tableRow.remove();
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
  document.getElementById('tableContainer').scrollIntoView({behavior: 'smooth', block: 'start'});
});

document.getElementById('toggleReservationsButton').addEventListener('click', function () {
  toggleReservationsTable();
  clearTable();
  loadDataFromDatabase();
  document.getElementById('reservationsContainer').scrollIntoView({behavior: 'smooth', block: 'start'});
});

document.getElementById('toggleRetoursButton').addEventListener('click', function () {
  toggleRetoursTable();
  clearTable();
  loadDataFromDatabase();
  document.getElementById('retoursContainer').scrollIntoView({behavior: 'smooth', block: 'start'});
});

// Fonction pour fermer la fenêtre modale
function closeModal(modalId) {
const modal = document.getElementById(modalId);
modal.style.display = 'none';
if (modalId === 'advanceModal') {
  document.getElementById('advanceForm').reset();
  document.getElementById('formattedModalAdvance').textContent = ' F CFA';
} else if (modalId === 'editModal') {
  document.getElementById('editForm').reset();
  document.getElementById('editFormattedPrice').textContent = ' F CFA';
  document.getElementById('formattedEditAdvance').textContent = ' F CFA';
  document.getElementById('formattedEditMontantAjoute').textContent = ' F CFA';
} else if (modalId === 'trancheModal') {
  document.getElementById('trancheForm').reset();
  document.getElementById('formattedTrancheAmount').textContent = ' F CFA';
} else if (modalId === 'editReservationModal') {
  document.getElementById('editReservationForm').reset();
  document.getElementById('editReservationFormattedPrice').textContent = ' F CFA';
  document.getElementById('editReservationFormattedAdvance').textContent = ' F CFA';
} else if (modalId === 'editRetourModal') {
  document.getElementById('editRetourForm').reset();
  document.getElementById('editRetourFormattedPrice').textContent = ' F CFA';
  document.getElementById('editRetourFormattedMontantAjoute').textContent = ' F CFA';
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
document.getElementById('trancheAmount').addEventListener('input', function () {
  const trancheAmount = parseFloat(this.value);
  if (!isNaN(trancheAmount)) {
    document.getElementById('formattedTrancheAmount').textContent = formatPrice(trancheAmount);
  } else {
    document.getElementById('formattedTrancheAmount').textContent = ' F CFA';
  }
});

// Gestionnaire d'événements pour le formulaire de saisie du montant de la tranche
document.getElementById('trancheForm').addEventListener('submit', function (e) {
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
database.ref('reservations/' + key).update({advance: newAdvance})
  .then(() => {
    closeModal('trancheModal');
    clearTable();
    loadDataFromDatabase();
    alert("Le paiement de la tranche a été enregistré. Nouveau montant avancé : " + formatPrice(newAdvance));

    // Afficher le tableau des réservations après le paiement de la tranche
    document.getElementById('reservationsContainer').style.display = 'block';
    const otherContainers = ['tableContainer', 'retoursContainer'];
    otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
    document.getElementById('reservationsContainer').scrollIntoView({behavior: 'smooth'});
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

    // Afficher le tableau des ventes après le paiement total
    document.getElementById('tableContainer').style.display = 'block';
    const otherContainers = ['reservationsContainer', 'retoursContainer'];
    otherContainers.forEach(c => document.getElementById(c).style.display = 'none');
    document.getElementById('tableContainer').scrollIntoView({behavior: 'smooth'});
  })
  .catch((error) => {
    console.error("Erreur lors du paiement total de la réservation :", error);
  });
}

// Fonction pour gérer le classement par mois
function addMonthSeparator(table, monthYear, reverseOrder = false) {
if (currentMonth !== monthYear) {
  const separatorRow = table.insertRow(reverseOrder ? 0 : null);
  const separatorCell = separatorRow.insertCell();
  separatorCell.colSpan = table.rows[0].cells.length;
  separatorCell.textContent = monthYear;
  separatorCell.classList.add('month-separator');
  currentMonth = monthYear;
}
}

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

// Ecouteur d'évènements pour le champ "Prix de vente" dans la fenêtre de modification des réservations
document.getElementById('editReservationPrice').addEventListener('input', function () {
const priceInput = this;
const priceValue = parseFloat(priceInput.value);

if (!isNaN(priceValue)) {
  document.getElementById('editReservationFormattedPrice').textContent = formatPrice(priceValue);
} else {
  document.getElementById('editReservationFormattedPrice').textContent = ' F CFA';
}
});

// Ecouteur d'évènements pour le champ "Montant avancé" dans la fenêtre de modification des réservations
document.getElementById('editReservationAdvanceAmount').addEventListener('input', function () {
const advanceInput = this;
const advanceValue = parseFloat(advanceInput.value);

if (!isNaN(advanceValue)) {
  document.getElementById('editReservationFormattedAdvance').textContent = formatPrice(advanceValue);
} else {
  document.getElementById('editReservationFormattedAdvance').textContent = ' F CFA';
}
});

// Ecouteur d'évènements pour le champ "Prix de vente" dans la fenêtre de modification des retours
document.getElementById('editRetourPrice').addEventListener('input', function () {
const priceInput = this;
const priceValue = parseFloat(priceInput.value);

if (!isNaN(priceValue)) {
  document.getElementById('editRetourFormattedPrice').textContent = formatPrice(priceValue);
} else {
  document.getElementById('editRetourFormattedPrice').textContent = ' F CFA';
}
});

// Ecouteur d'évènements pour le champ "Montant ajouté" dans la fenêtre de modification des retours
document.getElementById('editRetourMontantAjoute').addEventListener('input', function () {
const montantAjouteInput = this;
const montantAjouteValue = parseFloat(montantAjouteInput.value);

if (!isNaN(montantAjouteValue)) {
  document.getElementById('editRetourFormattedMontantAjoute').textContent = formatPrice(montantAjouteValue);
} else {
  document.getElementById('editRetourFormattedMontantAjoute').textContent = ' F CFA';
}
});

// Charger les données depuis Firebase (modifiée pour inverser l'ordre)
function loadDataFromDatabase() {
currentMonth = null; // Initialiser currentMonth à null avant de charger les données

// Charger les données des ventes (ordre inverse)
database.ref().orderByChild('date').on("child_added", (snapshot) => {
  const data = snapshot.val();
  if (data.saleType !== 'reservation' && data.saleType !== 'retour') {
    addRowToTable(data, snapshot.key, 'dataTable', true); // true pour inverser l'ordre
  }
});

// Charger les réservations (ordre inverse)
database.ref('reservations').orderByChild('date').on("child_added", (snapshot) => {
  const data = snapshot.val();
  addRowToReservationTable(data, snapshot.key, true); // true pour inverser l'ordre
});

// Charger les retours (ordre inverse)
database.ref('retours').orderByChild('date').on("child_added", (snapshot) => {
  const data = snapshot.val();
  addRowToRetourTable(data, snapshot.key, true); // true pour inverser l'ordre
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

// Fonction pour actualiser le formulaire après l'enregistrement
function resetForm(formId) {
document.getElementById(formId).reset();
// Réinitialiser les éléments spécifiques du formulaire si nécessaire
if (formId === 'dataForm') {
  document.getElementById('formattedPrice').textContent = ' F CFA';
  document.getElementById('formattedAdvance').textContent = ' F CFA';
  document.getElementById('formattedMontantAjoute').textContent = ' F CFA';
  // Réinitialiser l'affichage des champs de saisie liés au type de vente
  document.getElementById('saleType').value = 'vente'; // Définir le type de vente par défaut à "vente"
  toggleAdvanceField(); // Masquer les champs "Montant avancé" et "Montant ajouté"
}
}
