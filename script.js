const produits = [];

function ajouterProduit(){

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

const prixUnitaire =
prixGros / quantite;

const benefice =
(prixRevente * quantite) - prixGros;

produits.push({
nom,
prixGros,
quantite,
prixUnitaire,
prixRevente,
benefice
});

viderChamps();
afficherProduits();

}

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
onclick="supprimerProduit(${index})">
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

function supprimerProduit(index){

if(confirm("Supprimer ce produit ?")){

produits.splice(index,1);

afficherProduits();

}

}

function viderChamps(){

document.getElementById("nom").value = "";
document.getElementById("prixGros").value = "";
document.getElementById("quantite").value = "";
document.getElementById("prixRevente").value = "";

}