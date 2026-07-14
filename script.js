import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


let produits = [];

let utilisateurConnecte = false;


// Ajouter un produit
async function ajouterProduit(){

if(!utilisateurConnecte){
    alert("Connectez-vous d'abord avec Google.");
    return;
}


const nom = document.getElementById("nom").value.trim();

const prixGros =
Number(document.getElementById("prixGros").value);

const quantite =
Number(document.getElementById("quantite").value);

const prixRevente =
Number(document.getElementById("prixRevente").value);


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


await addDoc(collection(db,"produits"),{

nom,
prixGros,
quantite,
prixUnitaire,
prixRevente,
benefice

});


viderChamps();

chargerProduits();

}



// Charger les produits

async function chargerProduits(){

if(!utilisateurConnecte) return;


produits = [];


const snapshot =
await getDocs(collection(db,"produits"));


snapshot.forEach((document)=>{

produits.push({

id: document.id,
...document.data()

});

});


afficherProduits();

}



// Affichage

function afficherProduits(){

const tableau =
document.getElementById("tableauProduits");


tableau.innerHTML="";


let beneficeTotal=0;


produits.forEach((produit)=>{


beneficeTotal += produit.benefice;


const ligne=document.createElement("tr");


ligne.innerHTML=`

<td>${produit.nom}</td>

<td>${produit.prixGros} FCFA</td>

<td>${produit.quantite}</td>

<td>${produit.prixUnitaire.toFixed(2)} FCFA</td>

<td>${produit.prixRevente} FCFA</td>

<td>
${produit.benefice} FCFA
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
beneficeTotal + " FCFA";

}



// Supprimer

async function supprimerProduit(id){

if(!utilisateurConnecte){

alert("Connectez-vous d'abord.");

return;

}


await deleteDoc(doc(db,"produits",id));

chargerProduits();

}



// Vider

function viderChamps(){

document.getElementById("nom").value="";
document.getElementById("prixGros").value="";
document.getElementById("quantite").value="";
document.getElementById("prixRevente").value="";

}



// Auth Firebase

onAuthStateChanged(auth,(user)=>{

if(user){

utilisateurConnecte=true;

chargerProduits();

}

else{

utilisateurConnecte=false;

}

});



window.ajouterProduit = ajouterProduit;
window.supprimerProduit = supprimerProduit;