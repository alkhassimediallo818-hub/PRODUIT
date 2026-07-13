import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


let produits = [];



// Ajouter produit

async function ajouterProduit(){


const nom = document.getElementById("nom").value.trim();

const prixGros = Number(
document.getElementById("prixGros").value
);

const quantite = Number(
document.getElementById("quantite").value
);

const prixRevente = Number(
document.getElementById("prixRevente").value
);



if(
nom === "" ||
prixGros <= 0 ||
quantite <= 0 ||
prixRevente <= 0
){

alert("Veuillez remplir correctement tous les champs.");
return;

}



const prixUnitaire = prixGros / quantite;


const benefice =
(prixRevente * quantite) - prixGros;



try {


await addDoc(
collection(db,"produits"),
{
nom,
prixGros,
quantite,
prixUnitaire,
prixRevente,
benefice
}
);


alert("Produit ajouté avec succès !");


viderChamps();


await chargerProduits();



}

catch(error){


console.error("Erreur ajout :", error);

alert(
"Erreur Firestore : " + error.message
);


}


}





// Charger produits

async function chargerProduits(){


try {


produits = [];


const snapshot =
await getDocs(collection(db,"produits"));



snapshot.forEach((element)=>{


produits.push({

id: element.id,
...element.data()

});


});


afficherProduits();



}

catch(error){


console.error("Erreur chargement :", error);

alert(
"Erreur chargement : " + error.message
);


}


}






// Affichage

function afficherProduits(){


const tableau =
document.getElementById("tableauProduits");


tableau.innerHTML = "";


let beneficeTotal = 0;



produits.forEach((produit)=>{


beneficeTotal += produit.benefice;



const ligne =
document.createElement("tr");



ligne.innerHTML = `

<td>${produit.nom}</td>

<td>${produit.prixGros.toLocaleString()} FCFA</td>

<td>${produit.quantite}</td>

<td>${produit.prixUnitaire.toFixed(2)} FCFA</td>

<td>${produit.prixRevente.toLocaleString()} FCFA</td>


<td class="${produit.benefice >= 0 ? "benefice":"perte"}">

${produit.benefice.toLocaleString()} FCFA

</td>


<td>

<button onclick="supprimerProduit('${produit.id}')">

Supprimer

</button>

</td>

`;


tableau.appendChild(ligne);


});



document.getElementById("nbProduits").textContent =
produits.length;



document.getElementById("beneficeTotal").textContent =
beneficeTotal.toLocaleString() + " FCFA";


}





// Supprimer produit

async function supprimerProduit(id){


try {


if(confirm("Supprimer ce produit ?")){


await deleteDoc(
doc(db,"produits",id)
);


await chargerProduits();


}


}

catch(error){


console.error("Erreur suppression :", error);

alert(
"Erreur suppression : " + error.message
);


}


}





function viderChamps(){


document.getElementById("nom").value = "";

document.getElementById("prixGros").value = "";

document.getElementById("quantite").value = "";

document.getElementById("prixRevente").value = "";


}





// Boutons HTML

window.ajouterProduit = ajouterProduit;

window.supprimerProduit = supprimerProduit;



// Démarrage

chargerProduits();