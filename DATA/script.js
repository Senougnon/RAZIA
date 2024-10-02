// Initialisation de Firebase (remplacez par vos propres configurations)
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

let currentMonth = null; // Variable pour suivre le mois en cours

// Fonction pour formater le prix en F CFA
function formatPrice(price) {
    return `${price.toLocaleString('fr-FR')} F CFA`;
}

// Écouteur d'événements pour le champ "Prix de vente" du formulaire principal
document.getElementById('price').addEventListener('input', function () {
    const priceInput = this;
    const originalValue = priceInput.value;
    const priceValue = parseFloat(originalValue.replace(/\sF CFA$/, '').replace(/\s/g, ''));

    if (!isNaN(priceValue)) {
        const formattedPriceSpan = document.getElementById('formattedPrice');
        formattedPriceSpan.textContent = formatPrice(priceValue);
    } else {
        document.getElementById('formattedPrice').textContent = '';
    }
});

// Écouteur d'événements pour le champ "Prix de vente" dans la fenêtre modale
document.getElementById('editPrice').addEventListener('input', function () {
    const priceInput = this;
    const originalValue = priceInput.value;
    const priceValue = parseFloat(originalValue.replace(/\sF CFA$/, '').replace(/\s/g, ''));

    if (!isNaN(priceValue)) {
        const formattedPriceSpan = document.getElementById('editFormattedPrice');
        formattedPriceSpan.textContent = formatPrice(priceValue);
    } else {
        document.getElementById('editFormattedPrice').textContent = '';
    }
});

// Fonction pour vérifier les informations de connexion (modifiée)
function checkCredentials(username, password) {
    return database.ref('users/' + username).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            if (user.password === password) {
                // Stockez le nom d'utilisateur et le statut dans des variables globales
                window.loggedInUsername = username;
                window.loggedInUserStatus = user.status;
                return true; // Connexion réussie
            }
        }
        return false; // Connexion échouée
    });
}

// Gestionnaire d'événements pour le formulaire de connexion (modifié)
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    checkCredentials(username, password).then((isValid) => {
        if (isValid) {
            // Afficher la page principale et masquer la page de connexion
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainPage').style.display = 'block';

            // Afficher le nom d'utilisateur et le statut dans la barre d'en-tête
            document.getElementById('usernameDisplay').textContent = `Utilisateur : ${window.loggedInUsername}`;
            document.getElementById('userStatusDisplay').textContent = `Statut : ${window.loggedInUserStatus}`;

            // Gérer les autorisations en fonction du statut de l'utilisateur
            if (window.loggedInUserStatus === 'admin') {
                // Accès total - afficher les icônes d'édition et de suppression
                const editIcons = document.querySelectorAll('.edit-icon');
                const deleteIcons = document.querySelectorAll('.delete-icon');
                editIcons.forEach(icon => icon.style.display = 'inline-block');
                deleteIcons.forEach(icon => icon.style.display = 'inline-block');
            } else if (window.loggedInUserStatus === 'editeur') {
                // Accès éditeur - masquer les icônes d'édition et de suppression
                // Les icônes sont déjà masquées par défaut dans le CSS, donc aucune action n'est nécessaire ici.
            }

            loadDataFromDatabase();
        } else {
            alert('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    });
});

// Soumission du formulaire principal
document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Vérifier si l'utilisateur a l'autorisation d'enregistrer
    if (window.loggedInUserStatus === 'admin' || window.loggedInUserStatus === 'editeur') {
        // Récupération des données du formulaire
        const date = document.getElementById('date').value;
        const saleType = document.getElementById('saleType').value;
        const quantity = document.getElementById('quantity').value;
        const designation = document.getElementById('designation').value;
        const price = parseFloat(document.getElementById('price').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
        const imageFile = document.getElementById('image').files[0];

        // Enregistrement des données dans Realtime Database
        const newDataRef = database.ref().push();
        newDataRef.set({
            date: date,
            saleType: saleType,
            quantity: quantity,
            designation: designation,
            price: price
        })
            .then(() => {
                // Si une image est sélectionnée, la télécharger dans Storage
                if (imageFile) {
                    const storageRef = storage.ref().child(`images/${newDataRef.key}.jpg`);
                    return storageRef.put(imageFile).then((snapshot) => {
                        // Mettre à jour le chemin de l'image dans la base de données
                        return database.ref(newDataRef.key).update({ image: snapshot.ref.fullPath });
                    });
                }
            })
            .catch((error) => {
                console.error('Erreur lors de l\'enregistrement des données :', error);
            });

        // Réinitialiser le formulaire
        document.getElementById('dataForm').reset();
    } else {
        alert("Vous n'êtes pas autorisé à enregistrer des données.");
    }
});

// Fonction pour ajouter une nouvelle ligne au tableau
function addRowToTable(data, key) {
    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

    // Analyse manuelle de la date
    const dateParts = data.date.split('-'); // Supposons que la date est au format "AAAA-MM-JJ"
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Les mois sont indexés à partir de 0 en JavaScript
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

        // Ajouter une ligne de séparation des mois si nécessaire
        if (monthYear !== currentMonth) {
            addMonthSeparator(table, monthYear);
        }
    } else {
        console.error(`Format de date incorrect: ${data.date}`);
        // Afficher un message d'erreur dans la ligne du tableau
        const errorRow = table.insertRow(0);
        const errorCell = errorRow.insertCell();
        errorCell.colSpan = 7; // Étendre sur toutes les colonnes
        errorCell.textContent = `Erreur: format de date incorrect (${data.date})`;
        errorCell.classList.add('error-row');
        return; // Arrêter l'ajout de la ligne
    }

    const newRow = table.insertRow(0); // Insérer la ligne au début du tableau
    newRow.setAttribute('data-key', key);

    // Ajout des cellules pour les données textuelles
    newRow.insertCell().textContent = data.date;
    newRow.insertCell().textContent = data.saleType;
    newRow.insertCell().textContent = data.quantity;
    newRow.insertCell().textContent = data.designation;
    newRow.insertCell().textContent = formatPrice(data.price);

    // Cellule pour l'image
    const imageCell = newRow.insertCell();
    if (data.image) {
        // Vérifier si l'image existe dans Storage
        storage.ref(data.image).getMetadata().then((metadata) => {
            // L'image existe, récupérer l'URL et l'afficher
            return storage.ref(data.image).getDownloadURL();
        }).then((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = "Image";
            img.style.maxWidth = "100px";
            img.style.maxHeight = "100px";
            imageCell.appendChild(img);
        }).catch((error) => {
            console.error("Erreur lors de la récupération de l'image:", error);
            // Afficher un message d'erreur si l'image n'existe pas ou si une erreur se produit
            imageCell.textContent = "Image non disponible";
        });
    } else {
        // Aucun chemin d'image fourni dans les données
        imageCell.textContent = "Aucune image";
    }

    // Cellule pour les actions
    const actionsCell = newRow.insertCell();

    // Vérifier le statut de l'utilisateur pour afficher les actions
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

// Fonction pour ajouter une ligne de séparation des mois
function addMonthSeparator(table, monthYear) {
    const separatorRow = table.insertRow(0); // Insérer au début
    const separatorCell = separatorRow.insertCell();
    separatorCell.colSpan = 7; // Étendre sur toutes les colonnes
    separatorCell.textContent = monthYear;
    separatorCell.classList.add('month-separator');
    currentMonth = monthYear;
}

// Fonction pour mettre à jour une ligne existante du tableau
function updateRowInTable(data, key) {
    const rowToUpdate = document.querySelector(`tr[data-key="${key}"]`);
    if (rowToUpdate) {
        // Mettre à jour les cellules pour les données textuelles
        rowToUpdate.cells[0].textContent = data.date;
        rowToUpdate.cells[1].textContent = data.saleType;
        rowToUpdate.cells[2].textContent = data.quantity;
        rowToUpdate.cells[3].textContent = data.designation;
        rowToUpdate.cells[4].textContent = formatPrice(data.price);

        // Mettre à jour l'image si elle a été modifiée
        if (data.image) {
            const imageCell = rowToUpdate.cells[5];
            imageCell.innerHTML = ''; // Effacer l'ancienne image

            // Vérifier si l'image existe dans Storage
            storage.ref(data.image).getMetadata().then((metadata) => {
                // L'image existe, récupérer l'URL et l'afficher
                return storage.ref(data.image).getDownloadURL();
            }).then((url) => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Image";
                img.style.maxWidth = "100px";
                img.style.maxHeight = "100px";
                imageCell.appendChild(img);
            }).catch((error) => {
                console.error("Erreur lors de la récupération de l'image:", error);
                // Afficher un message d'erreur si l'image n'existe pas ou si une erreur se produit
                imageCell.textContent = "Image non disponible";
            });
        }
    }
}

// Fonction pour supprimer une ligne du tableau
function deleteRowFromTable(key) {
    const rowToDelete = document.querySelector(`tr[data-key="${key}"]`);
    if (rowToDelete) {
        rowToDelete.remove();
    }
}

// Fonction pour ouvrir le formulaire de modification
function openEditForm(event) {
    // Vérifier si l'utilisateur a l'autorisation de modifier
    if (window.loggedInUserStatus === 'admin') {
        const dataKey = event.target.getAttribute('data-key');
        const modal = document.getElementById('editModal');
        modal.style.display = 'block'; // Afficher la fenêtre modale

        // Récupérer les données de la base de données
        database.ref(dataKey).once('value').then((snapshot) => {
            const data = snapshot.val();
            document.getElementById('editDataKey').value = dataKey;
            document.getElementById('editDate').value = data.date;
            document.getElementById('editQuantity').value = data.quantity;
            document.getElementById('editPrice').value = data.price;
            document.getElementById('editFormattedPrice').textContent = formatPrice(data.price);
            document.getElementById('editSaleType').value = data.saleType;
            document.getElementById('editDesignation').value = data.designation;
        });

        // Écouteur d'événements pour le champ "Prix de vente" dans le formulaire de modification
        document.getElementById('editPrice').addEventListener('input', function () {
            const priceInput = this;
            const originalValue = priceInput.value;
            const priceValue = parseFloat(originalValue.replace(/\sF CFA$/, '').replace(/\s/g, ''));

            if (!isNaN(priceValue)) {
                const formattedPriceSpan = document.getElementById('editFormattedPrice');
                formattedPriceSpan.textContent = formatPrice(priceValue);
            } else {
                document.getElementById('editFormattedPrice').textContent = '';
            }
        });

        // Gestionnaire d'événements pour le formulaire de modification
        document.getElementById('editForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const dataKey = document.getElementById('editDataKey').value;
            const newDate = document.getElementById('editDate').value;
            const newQuantity = document.getElementById('editQuantity').value;
            const newPrice = parseFloat(document.getElementById('editPrice').value.replace(/\sF CFA$/, '').replace(/\s/g, ''));
            const newSaleType = document.getElementById('editSaleType').value;
            const newDesignation = document.getElementById('editDesignation').value;
            const newImageFile = document.getElementById('editImage').files[0];

            // Mettre à jour les données dans Realtime Database
            database.ref(dataKey).update({
                date: newDate,
                saleType: newSaleType,
                quantity: newQuantity,
                designation: newDesignation,
                price: newPrice
            }).then(() => {
                // Si une nouvelle image est sélectionnée, la télécharger et mettre à jour le chemin dans la base de données
                if (newImageFile) {
                    const storageRef = storage.ref().child(`images/${dataKey}.jpg`);
                    return storageRef.put(newImageFile).then((snapshot) => {
                        return database.ref(dataKey).update({ image: snapshot.ref.fullPath });
                    });
                }
            }).then(() => {
                // Fermer la fenêtre modale après la mise à jour
                closeModal();
                // Afficher un message de confirmation
                alert("Les données ont été mises à jour avec succès.");
            }).catch((error) => {
                console.error('Erreur lors de la mise à jour des données :', error);
            });
        });
    } else {
        alert("Vous n'êtes pas autorisé à modifier les données.");
    }
}

// Fonction pour supprimer la donnée (avec confirmation)
function deleteData(event) {
    // Vérifier si l'utilisateur a l'autorisation de supprimer
    if (window.loggedInUserStatus === 'admin') {
        const dataKey = event.target.getAttribute('data-key');

        // Demander confirmation à l'utilisateur
        if (confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
            // Supprimer la donnée de la base de données
            database.ref(dataKey).remove().then(() => {
                // Supprimer l'image de Storage
                const storageRef = storage.ref(`images/${dataKey}.jpg`);
                return storageRef.delete();
            }).catch((error) => {
                console.error('Erreur lors de la suppression des données :', error);
            });
        }
    } else {
        alert("Vous n'êtes pas autorisé à supprimer des données.");
    }
}

// Fonction pour afficher/masquer le tableau (modifiée)
function toggleTable() {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer.style.display === 'none' || tableContainer.style.display === '') {
        tableContainer.style.display = 'block';
    } else {
        tableContainer.style.display = 'none';
    }
}

// Gestionnaire d'événement pour le bouton "Afficher le tableau"
document.getElementById('toggleTableButton').addEventListener('click', function() {
    toggleTable(); // Afficher/masquer le tableau
    clearTable(); // Vider le tableau avant de charger les données
    loadDataFromDatabase(); // Charger les données depuis Firebase
});

// Gestionnaire d'événements pour fermer la fenêtre modale
const closeModalButton = document.querySelector('.close-modal');
closeModalButton.addEventListener('click', closeModal);

// Fonction pour fermer la fenêtre modale
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Fonction pour vider le tableau
function clearTable() {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Supprime toutes les lignes du tableau

    // Réinitialiser la variable du mois en cours
    currentMonth = null;
}

// Fonction pour charger les données du tableau (modifiée)
function loadDataFromDatabase() {
    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

    database.ref().orderByKey().limitToLast(100).once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            addRowToTable(data, childSnapshot.key);
        });
    });
}

// Écouteurs d'événements pour la synchronisation dynamique (modifié pour l'ordre inverse)
// database.ref().orderByKey().limitToLast(100).on("child_added", (snapshot) => {
//     const data = snapshot.val();
//     addRowToTable(data, snapshot.key);
// });

// database.ref().on("child_changed", (snapshot) => {
//     const data = snapshot.val();
//     updateRowInTable(data, snapshot.key);
// });

// database.ref().on("child_removed", (snapshot) => {
//     deleteRowFromTable(snapshot.key);
// });