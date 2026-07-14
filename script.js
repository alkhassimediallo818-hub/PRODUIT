import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


let produits = [];

let utilisateurConnecte = false;


// Ajouter un produit

async function ajouterProduit(){

if(!utilisateurConnecte || !auth.currentUser){

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
benefice,

userId: auth.currentUser.uid,

dateAjout: serverTimestamp()

});



viderChamps();

chargerProduits();

}



// Charger uniquement les produits de l'utilisateur connecté

async function chargerProduits(){


if(!utilisateurConnecte || !auth.currentUser) return;



produits = [];



const produitsUtilisateur = query(

collection(db,"produits"),

where(
"userId",
"==",
auth.currentUser.uid
)

);



const snapshot =
await getDocs(produitsUtilisateur);



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


tableau.innerHTML = "";



let beneficeTotal = 0;



produits.forEach((produit)=>{


beneficeTotal += produit.benefice;



const ligne = document.createElement("tr");



ligne.innerHTML = `


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





// Supprimer uniquement ses propres produits


async function supprimerProduit(id){


if(!utilisateurConnecte || !auth.currentUser){

alert("Connectez-vous d'abord.");

return;

}



await deleteDoc(

doc(db,"produits",id)

);



chargerProduits();


}





function viderChamps(){


document.getElementById("nom").value="";

document.getElementById("prixGros").value="";

document.getElementById("quantite").value="";

document.getElementById("prixRevente").value="";


}





// Surveillance connexion


onAuthStateChanged(auth,(user)=>{


if(user){


utilisateurConnecte = true;


chargerProduits();



}

else{


utilisateurConnecte = false;


produits = [];


afficherProduits();



}


});





window.ajouterProduit = ajouterProduit;

window.supprimerProduit = supprimerProduit;