import { db } from "./firebase.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


let produits = [];


// Ajouter un produit dans Firestore
async function ajouterProduit(){

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


// Enregistrer dans Firestore
await addDoc(collection(db, "produits"), {
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



// Charger les produits depuis Firestore
async function chargerProduits(){

produits = [];

const snapshot = await getDocs(collection(db,"produits"));


snapshot.forEach((document)=>{
    produits.push({
        id: document.id,
        ...document.data()
    });
});


afficherProduits();

}



// Afficher les produits
function afficherProduits(){

const tableau =
document.getElementById("tableauProduits");

tableau.innerHTML = "";

let beneficeTotal = 0;


produits.forEach((produit,index)=>{


beneficeTotal += produit.benefice;


const ligne = document.createElement("tr");


ligne.innerHTML = `
<td>${produit.nom}</td>
<td>${produit.prixGros.toLocaleString()} FCFA</td>
<td>${produit.quantite}</td>
<td>${produit.prixUnitaire.toFixed(2)} FCFA</td>
<td>${produit.prixRevente.toLocaleString()} FCFA</td>

<td class="${produit.benefice >= 0 ? 'benefice' : 'perte'}">
${produit.benefice.toLocaleString()} FCFA
</td>

<td>
<button class="supprimer"
onclick="supprimerProduit('${produit.id}')">
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



// Supprimer un produit Firestore
async function supprimerProduit(id){

if(confirm("Supprimer ce produit ?")){

await deleteDoc(doc(db,"produits",id));

chargerProduits();

}

}



function viderChamps(){

document.getElementById("nom").value = "";
document.getElementById("prixGros").value = "";
document.getElementById("quantite").value = "";
document.getElementById("prixRevente").value = "";

}


// Rendre les fonctions accessibles aux boutons HTML
window.ajouterProduit = ajouterProduit;
window.supprimerProduit = supprimerProduit;


// Démarrage
chargerProduits();