import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



let produits = [];

let utilisateurConnecte = false;

let produitModification = null;




// Ajouter ou modifier un produit

async function ajouterProduit(){


if(!utilisateurConnecte || !auth.currentUser){

alert("Connectez-vous d'abord avec Google.");

return;

}



const nom =
document.getElementById("nom").value.trim();



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



const prixUnitaire =
prixGros / quantite;



const benefice =
(prixRevente * quantite) - prixGros;





// Modification

if(produitModification){


await updateDoc(

doc(db,"produits",produitModification),

{

nom,

prixGros,

quantite,

prixUnitaire,

prixRevente,

benefice

}

);



produitModification = null;


alert("Produit modifié avec succès.");



}





// Ajout

else{


await addDoc(

collection(db,"produits"),

{

nom,

prixGros,

quantite,

prixUnitaire,

prixRevente,

benefice,


userId: auth.currentUser.uid,


dateAjout: serverTimestamp()


}

);



alert("Produit ajouté avec succès.");



}



viderChamps();

chargerProduits();



}







// Charger uniquement les produits de l'utilisateur connecté


async function chargerProduits(){


if(!utilisateurConnecte || !auth.currentUser)

return;



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









// Affichage + statistiques


function afficherProduits(){



const tableau =

document.getElementById("tableauProduits");



tableau.innerHTML = "";




let beneficeTotal = 0;

let beneficeJour = 0;

let beneficeMois = 0;



const maintenant = new Date();





produits.forEach((produit)=>{


beneficeTotal += produit.benefice;



if(produit.dateAjout){



const dateProduit =

produit.dateAjout.toDate();





if(

dateProduit.getDate() === maintenant.getDate()

&&

dateProduit.getMonth() === maintenant.getMonth()

&&

dateProduit.getFullYear() === maintenant.getFullYear()

){


beneficeJour += produit.benefice;


}




if(

dateProduit.getMonth() === maintenant.getMonth()

&&

dateProduit.getFullYear() === maintenant.getFullYear()

){


beneficeMois += produit.benefice;


}



}




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


<button onclick="modifierProduit('${produit.id}')">

Modifier

</button>



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



document.getElementById("beneficeJour").textContent =

beneficeJour + " FCFA";



document.getElementById("beneficeMois").textContent =

beneficeMois + " FCFA";



}









// Préparer modification


function modifierProduit(id){



const produit =

produits.find(

p => p.id === id

);



if(!produit)

return;




document.getElementById("nom").value =

produit.nom;



document.getElementById("prixGros").value =

produit.prixGros;



document.getElementById("quantite").value =

produit.quantite;



document.getElementById("prixRevente").value =

produit.prixRevente;




produitModification = id;



}









// Supprimer


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









// Authentification


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

window.modifierProduit = modifierProduit;