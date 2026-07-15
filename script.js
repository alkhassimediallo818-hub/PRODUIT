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




// Historique des actions

async function enregistrerHistorique(type, produit){

await addDoc(

collection(db,"historique"),

{

userId: auth.currentUser.uid,

type,

produit,

date: serverTimestamp()

}

);

}






// Charger historique utilisateur

async function chargerHistorique(){


if(!utilisateurConnecte || !auth.currentUser)

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



const snapshot = await getDocs(historiqueQuery);



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


return b.date.toMillis() - a.date.toMillis();


});



afficherHistorique(historique);



}

catch(error){

console.log(
"Erreur historique : ",
error
);

}


}







// Afficher historique

function afficherHistorique(historique){


const tableau =
document.getElementById("tableauHistorique");


if(!tableau)

return;



tableau.innerHTML = "";



historique.forEach((action)=>{


let date = "Date inconnue";



if(action.date){

date =
action.date.toDate()
.toLocaleString();

}



const ligne =
document.createElement("tr");



ligne.innerHTML = `

<td>${action.type}</td>

<td>${action.produit}</td>

<td>${date}</td>

`;



tableau.appendChild(ligne);


});


}








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



const nombreCartons =
Number(document.getElementById("nombreCartons").value);



const produitsParCarton =
Number(document.getElementById("produitsParCarton").value);



const prixRevente =
Number(document.getElementById("prixRevente").value);




if(
nom === "" ||
prixGros <= 0 ||
nombreCartons <= 0 ||
produitsParCarton <= 0 ||
prixRevente <= 0
){

alert("Veuillez remplir correctement tous les champs.");

return;

}




const prixTotalStock =
prixGros * nombreCartons;



const stockTotal =
nombreCartons * produitsParCarton;



const prixUnitaire =
prixGros / produitsParCarton;



const benefice =
(prixRevente * stockTotal) - prixTotalStock;





if(produitModification){


await updateDoc(

doc(db,"produits",produitModification),

{

nom,

prixGros,

nombreCartons,

produitsParCarton,

prixTotalStock,

stockTotal,

prixUnitaire,

prixRevente,

benefice

}

);



await enregistrerHistorique(
"modification",
nom
);



produitModification = null;


alert("Produit modifié avec succès.");


}



else{


await addDoc(

collection(db,"produits"),

{

nom,

prixGros,

nombreCartons,

produitsParCarton,

prixTotalStock,

stockTotal,

prixUnitaire,

prixRevente,

benefice,


userId: auth.currentUser.uid,


dateAjout: serverTimestamp()

}

);



await enregistrerHistorique(
"ajout",
nom
);



alert("Produit ajouté avec succès.");

}


viderChamps();


chargerProduits();

chargerHistorique();


}
// Charger produits utilisateur

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



const snapshot = await getDocs(produitsUtilisateur);



snapshot.forEach((document)=>{


produits.push({

id: document.id,

...document.data()

});


});



afficherProduits();


}







// Affichage produits

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

<td>${produit.prixGros} FCFA / carton</td>

<td>${produit.nombreCartons} cartons</td>

<td>${produit.produitsParCarton}</td>

<td>${produit.stockTotal}</td>

<td>${produit.prixUnitaire.toFixed(2)} FCFA</td>

<td>${produit.prixRevente} FCFA</td>

<td>${produit.benefice} FCFA</td>


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



document.getElementById("nbProduits").textContent =
produits.length;


document.getElementById("beneficeTotal").textContent =
beneficeTotal + " FCFA";


}








// Vente produit

async function vendreProduit(id){


const produit = produits.find(
p => p.id === id
);



if(!produit)

return;



const quantiteVendue = Number(
prompt("Nombre de produits vendus :")
);



if(
!quantiteVendue ||
quantiteVendue <= 0
){

alert("Quantité invalide.");

return;

}



if(quantiteVendue > produit.stockTotal){

alert("Stock insuffisant.");

return;

}



const nouveauStock =
produit.stockTotal - quantiteVendue;



const beneficeVente =
(produit.prixRevente - produit.prixUnitaire)
* quantiteVendue;



await updateDoc(

doc(db,"produits",id),

{

stockTotal: nouveauStock

}

);



await enregistrerHistorique(

"vente",

produit.nom + " (" + quantiteVendue + " unités)"

);



alert(
"Vente enregistrée. Bénéfice : "
+ beneficeVente
+ " FCFA"
);



chargerProduits();

chargerHistorique();


}







// Préparer modification

function modifierProduit(id){


const produit = produits.find(
p => p.id === id
);



if(!produit)

return;



document.getElementById("nom").value =
produit.nom;


document.getElementById("prixGros").value =
produit.prixGros;


document.getElementById("nombreCartons").value =
produit.nombreCartons;


document.getElementById("produitsParCarton").value =
produit.produitsParCarton;


document.getElementById("prixRevente").value =
produit.prixRevente;



produitModification = id;


}







// Supprimer produit

async function supprimerProduit(id){


const produit = produits.find(
p => p.id === id
);



if(produit){

await enregistrerHistorique(
"suppression",
produit.nom
);

}



await deleteDoc(

doc(db,"produits",id)

);



chargerProduits();

chargerHistorique();


}







function viderChamps(){

document.getElementById("nom").value="";

document.getElementById("prixGros").value="";

document.getElementById("nombreCartons").value="";

document.getElementById("produitsParCarton").value="";

document.getElementById("prixRevente").value="";


}







// Vider historique

async function viderHistorique(){


if(!utilisateurConnecte || !auth.currentUser)

return;



const confirmation = confirm(
"Voulez-vous vraiment supprimer tout l'historique ?"
);



if(!confirmation)

return;



const historiqueQuery = query(

collection(db,"historique"),

where(
"userId",
"==",
auth.currentUser.uid
)

);



const snapshot = await getDocs(historiqueQuery);



for(const documentHistorique of snapshot.docs){


await deleteDoc(

doc(
db,
"historique",
documentHistorique.id
)

);


}



chargerHistorique();


alert("Historique supprimé avec succès.");

}






// Authentification

onAuthStateChanged(auth,(user)=>{


if(user){

utilisateurConnecte = true;

chargerProduits();

chargerHistorique();


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

window.viderHistorique = viderHistorique;

window.vendreProduit = vendreProduit;