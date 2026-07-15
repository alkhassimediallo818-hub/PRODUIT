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


// ===============================
// VARIABLES GLOBALES
// ===============================

let produits = [];

let ventesGlobales = [];

let utilisateurConnecte = false;

let produitModification = null;

let produitVenteActuel = null;

let traitementVente = false;

let chargementProduits = false;

let chargementVentes = false;

let chargementHistorique = false;



// ===============================
// SECURITE
// ===============================


function utilisateurValide(){

    return (
        utilisateurConnecte === true &&
        auth.currentUser !== null
    );

}



function nettoyerTexte(texte){

    if(typeof texte !== "string")
        return "";

    return texte
    .trim()
    .replace(/[<>]/g,"");

}



function nombreValide(valeur){

    const nombre = Number(valeur);

    return Number.isFinite(nombre)
    ? nombre
    : 0;

}





// ===============================
// HISTORIQUE
// ===============================


async function enregistrerHistorique(type, produit){


    if(!utilisateurValide())
        return;



    try{


        await addDoc(

            collection(
                db,
                "historique"
            ),

            {

                userId:
                auth.currentUser.uid,


                type:
                nettoyerTexte(type)
                ||
                "action",


                produit:
                nettoyerTexte(produit)
                ||
                "Inconnu",


                date:
                serverTimestamp()

            }

        );


    }


    catch(error){


        console.error(
            "Erreur historique:",
            error
        );


    }


}





// ===============================
// CHARGER PRODUITS
// ===============================


async function chargerProduits(){


    if(!utilisateurValide())
        return;



    if(chargementProduits)
        return;



    try{


        chargementProduits = true;


        produits = [];



        const q = query(

            collection(
                db,
                "produits"
            ),

            where(

                "userId",
                "==",
                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(q);



        snapshot.forEach((docSnap)=>{


            const data =
            docSnap.data();



            produits.push({

                id:
                docSnap.id,


                ...data,


                stockTotal:
                nombreValide(
                    data.stockTotal
                ),


                benefice:
                nombreValide(
                    data.benefice
                ),


                prixRevente:
                nombreValide(
                    data.prixRevente
                ),


                prixUnitaire:
                nombreValide(
                    data.prixUnitaire
                )

            });



        });



        afficherProduits();

        calculerStockRestant();

        mettreAJourResume();



    }


    catch(error){


        console.error(
            "Erreur chargement produits:",
            error
        );


    }


    finally{


        chargementProduits=false;


    }


}





// ===============================
// AJOUT / MODIFICATION PRODUIT
// ===============================


async function ajouterProduit(){


    if(!utilisateurValide()){


        alert(
            "Connectez-vous d'abord."
        );


        return;

    }



    try{


        const nom =

        nettoyerTexte(

            document.getElementById("nom")?.value

        );



        const prixGros =

        nombreValide(

            document.getElementById("prixGros")?.value

        );



        const cartons =

        nombreValide(

            document.getElementById("nombreCartons")?.value

        );



        const parCarton =

        nombreValide(

            document.getElementById("produitsParCarton")?.value

        );



        const prixRevente =

        nombreValide(

            document.getElementById("prixRevente")?.value

        );



        if(

            !nom ||

            prixGros <= 0 ||

            cartons <= 0 ||

            parCarton <= 0 ||

            prixRevente <= 0

        ){


            alert(
                "Informations invalides."
            );


            return;


        }



        const stockTotal =

        cartons *

        parCarton;



        const prixTotalStock =

        prixGros *

        cartons;



        const prixUnitaire =

        prixGros /

        parCarton;



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


            nombreCartons:
            cartons,


            produitsParCarton:
            parCarton,


            prixTotalStock,


            stockTotal,


            prixUnitaire,


            prixRevente,


            benefice


        };



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


            produitModification=null;



        }

        else{


            await addDoc(

                collection(
                    db,
                    "produits"
                ),

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


        }



        viderChamps();


        await chargerProduits();



    }


    catch(error){


        console.error(
            "Erreur produit:",
            error
        );


        alert(
            "Erreur pendant l'opération."
        );


    }


}
// ===============================
// AFFICHAGE PRODUITS
// ===============================

function afficherProduits(){


    const tableau =

    document.getElementById(
        "tableauProduits"
    );


    if(!tableau)
        return;



    tableau.innerHTML = "";



    let beneficeTotal = 0;



    produits.forEach((produit)=>{


        beneficeTotal +=

        nombreValide(
            produit.benefice
        );



        const ligne =

        document.createElement("tr");



        ligne.innerHTML = `


        <td>${produit.nom || "Produit"}</td>

        <td>${produit.prixGros || 0} FCFA</td>

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



    const nbProduits =

    document.getElementById(
        "nbProduits"
    );


    if(nbProduits)

        nbProduits.textContent =
        produits.length;



    const benefice =

    document.getElementById(
        "beneficeTotal"
    );


    if(benefice)

        benefice.textContent =

        beneficeTotal
        +
        " FCFA";


}





// ===============================
// RESUME COMPLET
// ===============================


function mettreAJourResume(){


    let stock = 0;

    let stockFaible = 0;



    produits.forEach((produit)=>{


        const valeur =

        nombreValide(
            produit.stockTotal
        );



        stock += valeur;



        if(valeur <= 10)

            stockFaible++;



    });



    const valeurs = {


        resumeProduits:
        produits.length,


        resumeStock:
        stock,


        stockFaible:
        stockFaible,


        stockRestant:
        stock


    };



    Object.keys(valeurs)

    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

            element.textContent =
            valeurs[id];


    });



    calculerResumeVentes();



}





// ===============================
// RESUME VENTES
// ===============================


function calculerResumeVentes(){


    let chiffreAffaires = 0;

    let benefice = 0;

    let unites = 0;



    ventesGlobales.forEach((vente)=>{


        chiffreAffaires +=

        nombreValide(
            vente.montantTotal
        );



        benefice +=

        nombreValide(
            vente.benefice
        );



        unites +=

        nombreValide(
            vente.quantiteVendue
        );



    });





    const valeurs = {


        resumeVentes:
        unites,


        resumeCA:
        chiffreAffaires
        +
        " FCFA",


        resumeBenefice:
        benefice
        +
        " FCFA",


        chiffreAffaires:
        chiffreAffaires
        +
        " FCFA",


        beneficeVentes:
        benefice
        +
        " FCFA",


        unitesVendues:
        unites,


        nbTransactions:
        ventesGlobales.length



    };





    Object.keys(valeurs)

    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

            element.textContent =
            valeurs[id];


    });



    afficherProduitVedette();



}





// ===============================
// PRODUIT VEDETTE
// ===============================


function afficherProduitVedette(){


    const compteur = {};



    ventesGlobales.forEach((vente)=>{


        const nom =

        vente.produit ||
        "Produit";



        compteur[nom] =

        (

            compteur[nom] || 0

        )

        +

        nombreValide(
            vente.quantiteVendue
        );


    });




    let meilleur =
    "Aucun";


    let maximum = 0;



    Object.keys(compteur)

    .forEach((nom)=>{


        if(compteur[nom] > maximum){


            maximum =
            compteur[nom];


            meilleur =
            nom;


        }


    });





    const element =

    document.getElementById(
        "produitVedette"
    );



    if(element)

        element.textContent =
        meilleur;



}





// ===============================
// STOCK RESTANT
// ===============================


function calculerStockRestant(){


    let total = 0;



    produits.forEach((produit)=>{


        total +=

        nombreValide(
            produit.stockTotal
        );


    });



    const element =

    document.getElementById(
        "stockRestant"
    );



    if(element)

        element.textContent =
        total;



}
// ===============================
// ENREGISTRER VENTE
// ===============================

async function enregistrerVente(
    produit,
    quantite,
    benefice
){

    if(!utilisateurValide())
        return false;


    try{


        await addDoc(

            collection(db,"ventes"),

            {


                userId:
                auth.currentUser.uid,


                produit:
                nettoyerTexte(produit.nom)
                ||
                "Produit",


                quantiteVendue:
                nombreValide(quantite),


                prixVente:
                nombreValide(
                    produit.prixRevente
                ),


                montantTotal:

                nombreValide(
                    produit.prixRevente
                )

                *

                nombreValide(
                    quantite
                ),


                benefice:
                nombreValide(benefice),


                statut:
                "validée",


                date:
                serverTimestamp()


            }

        );


        return true;


    }

    catch(error){


        console.error(
            "Erreur vente :",
            error
        );


        return false;


    }


}





// ===============================
// CHARGER VENTES
// ===============================


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

        await getDocs(
            ventesQuery
        );



        ventesGlobales = [];



        snapshot.forEach((document)=>{


            ventesGlobales.push({

                id:
                document.id,


                ...document.data()

            });


        });



        afficherVentes(
            ventesGlobales
        );



        calculerStatistiquesVentes(
            ventesGlobales
        );


        calculerResumeVentes();



    }


    catch(error){


        console.error(
            "Erreur chargement ventes :",
            error
        );


    }


}





// ===============================
// STATISTIQUES VENTES
// ===============================


function calculerStatistiquesVentes(ventes){


    let chiffreAffaires = 0;

    let benefice = 0;

    let ventesJour = 0;

    let ventesMois = 0;



    const maintenant =

    new Date();



    ventes.forEach((vente)=>{


        const montant =

        nombreValide(
            vente.montantTotal
        );



        chiffreAffaires += montant;



        benefice +=

        nombreValide(
            vente.benefice
        );



        if(vente.date){


            const date =

            vente.date.toDate();



            if(

                date.getDate()
                ===
                maintenant.getDate()

                &&

                date.getMonth()
                ===
                maintenant.getMonth()

                &&

                date.getFullYear()
                ===
                maintenant.getFullYear()

            ){


                ventesJour += montant;


            }





            if(

                date.getMonth()
                ===
                maintenant.getMonth()

                &&

                date.getFullYear()
                ===
                maintenant.getFullYear()

            ){


                ventesMois += montant;


            }


        }



    });





    const elements = {


        chiffreAffaires:

        chiffreAffaires
        +
        " FCFA",


        beneficeVentes:

        benefice
        +
        " FCFA",


        ventesJour:

        ventesJour
        +
        " FCFA",


        ventesMois:

        ventesMois
        +
        " FCFA"



    };





    Object.keys(elements)

    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

            element.textContent =
            elements[id];


    });



}





// ===============================
// AFFICHER VENTES
// ===============================


function afficherVentes(ventes){


    const tableau =

    document.getElementById(
        "tableauVentes"
    );



    if(!tableau)
        return;



    tableau.innerHTML = "";



    ventes.forEach((vente)=>{


        let date =

        "Date inconnue";



        if(vente.date){


            date =

            vente.date
            .toDate()
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

        <td>${vente.statut || "validée"}</td>


        `;



        tableau.appendChild(ligne);



    });



}
// ===============================
// VENDRE PRODUIT
// ===============================

function vendreProduit(id){


    const produit =

    produits.find(

        p => p.id === id

    );



    if(!produit)
        return;



    produitVenteActuel =
    produit;



    const nom =

    document.getElementById(
        "nomProduitVente"
    );



    if(nom)

        nom.textContent =

        "Produit : "
        +
        produit.nom;



    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =
        "block";


}





// ===============================
// CONFIRMER VENTE
// ===============================

async function confirmerVente(){


    if(traitementVente)
        return;



    if(!produitVenteActuel)
        return;



    const champ =

    document.getElementById(
        "quantiteVente"
    );



    const quantite =

    nombreValide(
        champ?.value
    );



    if(quantite <= 0){

        alert(
            "Quantité invalide."
        );

        return;

    }





    const stock =

    nombreValide(
        produitVenteActuel.stockTotal
    );



    if(quantite > stock){


        alert(
            "Stock insuffisant."
        );

        return;


    }




    try{


        traitementVente = true;



        const nouveauStock =

        stock - quantite;



        const benefice =


        (

            nombreValide(
                produitVenteActuel.prixRevente
            )

            -

            nombreValide(
                produitVenteActuel.prixUnitaire
            )

        )

        *

        quantite;




        const venteOk =

        await enregistrerVente(

            produitVenteActuel,

            quantite,

            benefice

        );




        if(!venteOk)

            throw new Error(
                "Vente refusée"
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
            " x "
            +
            quantite

        );




        fermerVente();



        await chargerProduits();

        await chargerVentes();

        await chargerHistorique();



    }



    catch(error){


        console.error(
            "Erreur vente:",
            error
        );


        alert(
            "Impossible d'enregistrer la vente."
        );


    }



    finally{


        traitementVente=false;


    }



}





// ===============================
// FERMER FENETRE VENTE
// ===============================

function fermerVente(){


    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =
        "none";



    produitVenteActuel=null;



}





// ===============================
// MODIFIER PRODUIT
// ===============================

function modifierProduit(id){


    const produit =

    produits.find(

        p=>p.id===id

    );



    if(!produit)
        return;



    const champs = {


        nom:
        produit.nom || "",


        prixGros:
        produit.prixGros || "",


        nombreCartons:
        produit.nombreCartons || "",


        produitsParCarton:
        produit.produitsParCarton || "",


        prixRevente:
        produit.prixRevente || ""

    };



    Object.keys(champs)

    .forEach((champ)=>{


        const element =

        document.getElementById(
            champ
        );



        if(element)

            element.value =
            champs[champ];


    });



    produitModification=id;



}





// ===============================
// SUPPRESSION PRODUIT
// ===============================

async function supprimerProduit(id){


    if(!utilisateurValide())
        return;



    const produit =

    produits.find(

        p=>p.id===id

    );



    if(!produit)
        return;




    if(!confirm(
        "Supprimer ce produit ?"
    ))

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



        await chargerProduits();



        await chargerHistorique();



    }


    catch(error){


        console.error(
            "Erreur suppression:",
            error
        );


    }


}





// ===============================
// VIDER CHAMPS
// ===============================

function viderChamps(){


    [

        "nom",

        "prixGros",

        "nombreCartons",

        "produitsParCarton",

        "prixRevente"

    ]

    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

            element.value="";


    });



}





// ===============================
// AUTHENTIFICATION
// ===============================

onAuthStateChanged(

auth,

async(user)=>{


    if(user){


        utilisateurConnecte=true;



        await chargerProduits();

        await chargerHistorique();

        await chargerVentes();



    }

    else{


        utilisateurConnecte=false;


        produits=[];

        ventesGlobales=[];


        afficherProduits();

        mettreAJourResume();



    }


});







// ===============================
// EXPORT HTML
// ===============================

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