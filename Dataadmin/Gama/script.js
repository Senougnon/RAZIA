// Initialiser Firebase (remplacer avec vos informations)
const firebaseConfig = {
    apiKey: "UDUIGFUI hbvehbeiuyebhdcbhc DCD",
  authDomain: "razia-data.firebaseapp.com",
  databaseURL: "https://HFBDJHBHCBdjhbheiudizedz.com",
  projectId: "razia-data",
  storageBucket: "razia-data.appspot.com",
  messagingSenderId: "154685494898989",
  appId: "1:59987897897897897898",
  measurementId: "G-jvdjcIODJDJ"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Code JavaScript pour la gestion des utilisateurs
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status').value;

    // Vérifier si le nom d'utilisateur existe déjà
    const usersRef = database.ref('users/' + username);
    usersRef.once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            alert('Ce nom d\'utilisateur existe déjà. Veuillez en choisir un autre.');
        } else {
            // Enregistrer les données dans Firebase Realtime Database
            usersRef.set({
                email: email,
                password: password, // Attention: mot de passe en texte brut !
                status: status
            })
            .then(() => {
                alert('Utilisateur créé avec succès !');
                // Réinitialiser le formulaire (optionnel)
                document.getElementById('userForm').reset(); 
                // Ajouter l'utilisateur au tableau
                addUserToTable(username, email, status);
            })
            .catch(error => {
                console.error("Erreur lors de la création de l'utilisateur :", error);
                alert("Une erreur s'est produite. Veuillez réessayer.");
            });
        }
    });
});

// Fonction pour ajouter un utilisateur au tableau 
function addUserToTable(username, email, status) {
    const table = document.getElementById('userTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${username}</td>
        <td>${email}</td>
        <td>${status}</td>
        <td>
            <button onclick="editUser('${username}')">Modifier</button>
            <button onclick="deleteUser('${username}')">Supprimer</button>
        </td>
    `;
}

// Fonctions pour éditer et supprimer 
function editUser(username) {
    // Ouvrir la fenêtre flottante (modal)
    document.getElementById('editModal').style.display = "block";

    // Remplir les champs du formulaire avec les données de l'utilisateur
    document.getElementById('editUsername').value = username; 
    database.ref('users/' + username).once('value').then(function(snapshot) {
        const user = snapshot.val();
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPassword').value = user.password || ""; // Mot de passe peut être vide
        document.getElementById('editStatus').value = user.status;
    });
}

function deleteUser(username) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
        database.ref('users/' + username).remove()
            .then(() => {
                alert('Utilisateur supprimé avec succès !');
                // Supprimer la ligne du tableau
                const table = document.getElementById('userTable');
                const rows = table.getElementsByTagName('tr');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].cells[0].textContent === username) {
                        table.deleteRow(i);
                        break;
                    }
                }
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
                alert("Une erreur s'est produite. Veuillez réessayer.");
            });
    }
}

// Fermer la fenêtre flottante (modal)
function closeModal() {
    document.getElementById('editModal').style.display = "none";
}

// Gestion du formulaire d'édition
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;
    const status = document.getElementById('editStatus').value;

    database.ref('users/' + username).update({
        email: email,
        password: password, // Attention: mot de passe en texte brut !
        status: status
    })
    .then(() => {
        alert('Utilisateur mis à jour avec succès !');
        closeModal();
        // Mettre à jour la ligne du tableau
        const table = document.getElementById('userTable');
        const rows = table.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[0].textContent === username) {
                rows[i].cells[1].textContent = email;
                rows[i].cells[2].textContent = status;
                break;
            }
        }
    })
    .catch(error => {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
    });
});

// Charger les utilisateurs existants depuis Firebase et les afficher dans le tableau
database.ref('users').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        const user = childSnapshot.val();
        addUserToTable(childSnapshot.key, user.email, user.status);
    });
});

// Gestion de l'affichage du tableau
const tableContainer = document.getElementById('tableContainer');
const showTableButton = document.getElementById('showTableButton');

showTableButton.addEventListener('click', function() {
    if (tableContainer.style.display === 'none') {
        tableContainer.style.display = 'block';
        showTableButton.textContent = 'Masquer le tableau';
        // Dérouler jusqu'au tableau (animation optionnelle)
        tableContainer.scrollIntoView({ behavior: 'smooth' }); 
    } else {
        tableContainer.style.display = 'none';
        showTableButton.textContent = 'Afficher le tableau';
    }
});

// Écouteur d'événements pour la synchronisation en temps réel
database.ref('users').on('child_changed', function(snapshot) {
    const user = snapshot.val();
    const username = snapshot.key;

    // Mettre à jour la ligne du tableau correspondante
    const table = document.getElementById('userTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].cells[0].textContent === username) {
            rows[i].cells[1].textContent = user.email;
            rows[i].cells[2].textContent = user.status;
            break;
        }
    }
});

database.ref('users').on('child_removed', function(snapshot) {
    const username = snapshot.key;

    // Supprimer la ligne du tableau correspondante
    const table = document.getElementById('userTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].cells[0].textContent === username) {
            table.deleteRow(i);
            break;
        }
    }
});
