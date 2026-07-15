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

let produitVenteActuel = null;

let traitementVente = false;





// Vérification connexion

function utilisateurValide(){

return utilisateurConnecte 
&& auth.currentUser;

}






// Historique sécurisé

async function enregistrerHistorique(type, produit){


if(!utilisateurValide())

return;



try{


await addDoc(

collection(db,"historique"),

{

userId: auth.currentUser.uid,

type: type || "action",

produit: produit || "Inconnu",

date: serverTimestamp()

}

);


}

catch(error){

console.error(
"Erreur historique : ",
error
);

}


}







// Enregistrer vente sécurisé

async function enregistrerVente(
produit,
quantiteVendue,
benefice
){


if(!utilisateurValide())

return;



try{


await addDoc(

collection(db,"ventes"),

{

userId: auth.currentUser.uid,

produit: produit.nom || "Produit",

quantiteVendue: Number(quantiteVendue),

prixVente: Number(produit.prixRevente || 0),

benefice: Number(benefice || 0),

montantTotal:
Number(produit.prixRevente || 0)
*
Number(quantiteVendue),


date: serverTimestamp()

}

);


}

catch(error){

console.error(
"Erreur vente : ",
error
);

}


}







// Charger ventes

async function chargerVentes(){


if(!utilisateurValide())

return;



try{


const ventesQuery = query(

collection(db,"ventes"),

where(
"userId",
"==",
auth.currentUser.uid
)

);



const snapshot =
await getDocs(ventesQuery);



let ventes = [];



snapshot.forEach((document)=>{


ventes.push({

id: document.id,

...document.data()

});


});



afficherVentes(ventes);

calculerStatistiquesVentes(ventes);


}

catch(error){


console.error(
"Erreur chargement ventes : ",
error
);


}


}






// Statistiques ventes sécurisées

function calculerStatistiquesVentes(ventes){


let chiffreAffaires = 0;

let beneficeVentes = 0;

let ventesJour = 0;

let ventesMois = 0;



const aujourdHui = new Date();



ventes.forEach((vente)=>{


chiffreAffaires +=
Number(vente.montantTotal || 0);



beneficeVentes +=
Number(vente.benefice || 0);



if(vente.date){


const dateVente =
vente.date.toDate();



if(

dateVente.getDate()
===
aujourdHui.getDate()

&&

dateVente.getMonth()
===
aujourdHui.getMonth()

&&

dateVente.getFullYear()
===
aujourdHui.getFullYear()

){


ventesJour +=
Number(vente.montantTotal || 0);


}



if(

dateVente.getMonth()
===
aujourdHui.getMonth()

&&

dateVente.getFullYear()
===
aujourdHui.getFullYear()

){


ventesMois +=
Number(vente.montantTotal || 0);


}


}


});



const ca =
document.getElementById("chiffreAffaires");


if(ca)

ca.textContent =
chiffreAffaires + " FCFA";



const benefice =
document.getElementById("beneficeVentes");


if(benefice)

benefice.textContent =
beneficeVentes + " FCFA";



const jour =
document.getElementById("ventesJour");


if(jour)

jour.textContent =
ventesJour + " FCFA";



const mois =
document.getElementById("ventesMois");


if(mois)

mois.textContent =
ventesMois + " FCFA";


calculerStockRestant();


}
// Calcul stock restant

function calculerStockRestant(){


let stock = 0;



produits.forEach((produit)=>{


stock += Number(
produit.stockTotal || 0
);


});



const element =
document.getElementById("stockRestant");



if(element){

element.textContent = stock;

}


}







// Affichage ventes sécurisé

function afficherVentes(ventes){


const tableau =
document.getElementById("tableauVentes");



if(!tableau)

return;



tableau.innerHTML = "";



ventes.sort((a,b)=>{


if(!a.date || !b.date)

return 0;


return b.date.toMillis() - a.date.toMillis();


});



ventes.forEach((vente)=>{


let date = "Date inconnue";



if(vente.date){


date =
vente.date.toDate()
.toLocaleString();


}



const ligne =
document.createElement("tr");



ligne.innerHTML = `

<td>${vente.produit || "Produit"}</td>

<td>${vente.quantiteVendue || 0}</td>

<td>${vente.montantTotal || 0} FCFA</td>

<td>${vente.benefice || 0} FCFA</td>

<td>${date}</td>

`;



tableau.appendChild(ligne);


});


}








// Charger historique sécurisé

async function chargerHistorique(){


if(!utilisateurValide())

return;



try{


const historiqueQuery = query(

collection(db,"historique"),

where(
"userId",
"==",
auth.currentUser.uid
)

);



const snapshot =
await getDocs(historiqueQuery);



let historique = [];



snapshot.forEach((document)=>{


historique.push({

id: document.id,

...document.data()

});


});



historique.sort((a,b)=>{


if(!a.date || !b.date)

return 0;


return b.date.toMillis()
-
a.date.toMillis();


});



afficherHistorique(historique);


}

catch(error){


console.error(
"Erreur historique : ",
error
);


}


}







// Affichage historique sécurisé

function afficherHistorique(historique){


const tableau =
document.getElementById("tableauHistorique");



if(!tableau)

return;



tableau.innerHTML = "";



historique.forEach((action)=>{


let date =
"Date inconnue";



if(action.date){


date =
action.date.toDate()
.toLocaleString();


}



const ligne =
document.createElement("tr");



ligne.innerHTML = `

<td>${action.type || "Action"}</td>

<td>${action.produit || "Produit"}</td>

<td>${date}</td>

`;



tableau.appendChild(ligne);


});


}








// Ajouter ou modifier produit sécurisé

async function ajouterProduit(){


if(!utilisateurValide()){


alert(
"Connectez-vous d'abord avec Google."
);


return;


}



try{


const nom =
document.getElementById("nom")
.value
.trim();



const prixGros =
Number(
document.getElementById("prixGros")
.value
);



const nombreCartons =
Number(
document.getElementById("nombreCartons")
.value
);



const produitsParCarton =
Number(
document.getElementById("produitsParCarton")
.value
);



const prixRevente =
Number(
document.getElementById("prixRevente")
.value
);





if(

!nom ||

prixGros <= 0 ||

nombreCartons <= 0 ||

produitsParCarton <= 0 ||

prixRevente <= 0

){


alert(
"Veuillez remplir correctement tous les champs."
);


return;


}





const prixTotalStock =
prixGros *
nombreCartons;



const stockTotal =
nombreCartons *
produitsParCarton;



const prixUnitaire =
prixGros /
produitsParCarton;



const benefice =
(
prixRevente *
stockTotal
)
-
prixTotalStock;





const donneesProduit = {


nom,

prixGros,

nombreCartons,

produitsParCarton,

prixTotalStock,

stockTotal,

prixUnitaire,

prixRevente,

benefice


};
// Suite ajout / modification produit


if(produitModification){


await updateDoc(

doc(
db,
"produits",
produitModification
),

donneesProduit

);



await enregistrerHistorique(
"modification",
nom
);



produitModification = null;



alert(
"Produit modifié avec succès."
);



}

else{


await addDoc(

collection(db,"produits"),

{

...donneesProduit,

userId:
auth.currentUser.uid,

dateAjout:
serverTimestamp()

}

);



await enregistrerHistorique(
"ajout",
nom
);



alert(
"Produit ajouté avec succès."
);



}



viderChamps();



chargerProduits();

chargerHistorique();

chargerVentes();



}

catch(error){


console.error(
"Erreur produit : ",
error
);


alert(
"Une erreur est survenue."
);


}


}







// Charger produits

async function chargerProduits(){


if(!utilisateurValide())

return;



try{


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

catch(error){


console.error(
"Erreur chargement produits : ",
error
);


}


}








// Afficher produits

function afficherProduits(){


const tableau =
document.getElementById("tableauProduits");



if(!tableau)

return;



tableau.innerHTML = "";



let beneficeTotal = 0;



produits.forEach((produit)=>{


beneficeTotal +=
Number(produit.benefice || 0);



const ligne =
document.createElement("tr");



ligne.innerHTML = `

<td>${produit.nom || "Produit"}</td>

<td>${produit.prixGros || 0} FCFA / carton</td>

<td>${produit.nombreCartons || 0}</td>

<td>${produit.produitsParCarton || 0}</td>

<td>${produit.stockTotal || 0}</td>

<td>${Number(produit.prixUnitaire || 0).toFixed(2)} FCFA</td>

<td>${produit.prixRevente || 0} FCFA</td>

<td>${produit.benefice || 0} FCFA</td>

<td>


<button onclick="vendreProduit('${produit.id}')">
Vendre
</button>



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



const nb =
document.getElementById("nbProduits");



if(nb)

nb.textContent =
produits.length;



const benefice =
document.getElementById("beneficeTotal");



if(benefice)

benefice.textContent =
beneficeTotal + " FCFA";



calculerStockRestant();


}







// Ouvrir fenêtre vente


function vendreProduit(id){


const produit =
produits.find(
p => p.id === id
);



if(!produit)

return;



produitVenteActuel = produit;



const nom =
document.getElementById("nomProduitVente");



if(nom)

nom.textContent =
"Produit : "
+
produit.nom;



const quantite =
document.getElementById("quantiteVente");



if(quantite)

quantite.value = "";



const modal =
document.getElementById("modalVente");



if(modal)

modal.style.display =
"block";


}







// Confirmer vente


async function confirmerVente(){


if(traitementVente)

return;



if(!produitVenteActuel)

return;



const quantite =
Number(
document.getElementById("quantiteVente").value
);



if(

!quantite ||

quantite <= 0

){


alert(
"Quantité invalide."
);


return;


}



if(
quantite >
produitVenteActuel.stockTotal
){


alert(
"Stock insuffisant."
);


return;


}



try{


traitementVente = true;



const nouveauStock =

produitVenteActuel.stockTotal
-
quantite;



const beneficeVente =

(
produitVenteActuel.prixRevente
-
produitVenteActuel.prixUnitaire
)

*
quantite;
// Suite confirmation vente


await enregistrerVente(

produitVenteActuel,

quantite,

beneficeVente

);



await updateDoc(

doc(
db,
"produits",
produitVenteActuel.id
),

{

stockTotal:
nouveauStock

}

);



await enregistrerHistorique(

"vente",

produitVenteActuel.nom
+
" ("
+
quantite
+
" unités)"

);



alert(

"Vente enregistrée.\nBénéfice : "
+
beneficeVente
+
" FCFA"

);



fermerVente();



chargerProduits();

chargerHistorique();

chargerVentes();



}

catch(error){


console.error(
"Erreur vente : ",
error
);



alert(
"Impossible d'enregistrer la vente."
);


}

finally{


traitementVente = false;


}


}







// Fermer fenêtre vente


function fermerVente(){


const modal =
document.getElementById("modalVente");



if(modal)

modal.style.display =
"none";



produitVenteActuel = null;


}







// Modifier produit


function modifierProduit(id){


const produit =
produits.find(
p => p.id === id
);



if(!produit)

return;



document.getElementById("nom").value =
produit.nom || "";



document.getElementById("prixGros").value =
produit.prixGros || "";



document.getElementById("nombreCartons").value =
produit.nombreCartons || "";



document.getElementById("produitsParCarton").value =
produit.produitsParCarton || "";



document.getElementById("prixRevente").value =
produit.prixRevente || "";



produitModification = id;


}








// Supprimer produit sécurisé


async function supprimerProduit(id){


if(!utilisateurValide())

return;



const produit =
produits.find(
p => p.id === id
);



if(!produit)

return;



const confirmation =
confirm(
"Supprimer ce produit ?"
);



if(!confirmation)

return;



try{


await enregistrerHistorique(

"suppression",

produit.nom

);



await deleteDoc(

doc(
db,
"produits",
id

)

);



chargerProduits();

chargerHistorique();

chargerVentes();


}

catch(error){


console.error(
"Erreur suppression : ",
error
);


}


}







// Vider champs


function viderChamps(){


const champs = [

"nom",

"prixGros",

"nombreCartons",

"produitsParCarton",

"prixRevente"

];



champs.forEach((id)=>{


const element =
document.getElementById(id);



if(element)

element.value = "";


});


}







// Vider historique


async function viderHistorique(){


if(!utilisateurValide())

return;



const confirmation =
confirm(
"Voulez-vous supprimer tout l'historique ?"
);



if(!confirmation)

return;



try{


const historiqueQuery = query(

collection(db,"historique"),

where(
"userId",
"==",
auth.currentUser.uid
)

);



const snapshot =
await getDocs(historiqueQuery);



for(
const documentHistorique of snapshot.docs
){


await deleteDoc(

doc(
db,
"historique",
documentHistorique.id
)

);


}



chargerHistorique();


}

catch(error){


console.error(
"Erreur suppression historique : ",
error
);


}


}







// Authentification


onAuthStateChanged(
auth,
(user)=>{


if(user){


utilisateurConnecte = true;


chargerProduits();

chargerHistorique();

chargerVentes();


}

else{


utilisateurConnecte = false;


produits = [];


afficherProduits();


}


});







// Fonctions globales


window.ajouterProduit =
ajouterProduit;


window.supprimerProduit =
supprimerProduit;


window.modifierProduit =
modifierProduit;


window.viderHistorique =
viderHistorique;


window.vendreProduit =
vendreProduit;


window.confirmerVente =
confirmerVente;


window.fermerVente =
fermerVente;