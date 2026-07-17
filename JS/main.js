// ===============================
// IMPORTS
// ===============================


import {
    auth
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    chargerProduits,
    ajouterProduit,
    supprimerProduit,
    modifierProduit,
    viderChamps,
    getProduits,
    estEnModification
} from "./produits.js";

import {
    chargerVentes,
    vendreProduit,
    confirmerVente,
    fermerVente
} from "./ventes.js";



import {
    chargerHistorique,
    viderHistorique
} from "./historique.js";


import {
    mettreAJourResume,
    calculerStockRestant
} from "./dashboard.js";
// ===============================
// VARIABLES GLOBALES
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];
// ===============================
// ETAT UTILISATEUR
// ===============================

function utilisateurEtat(){

    return utilisateurConnecte;

}
// ===============================
// AUTHENTIFICATION
// ===============================

onAuthStateChanged(

    auth,

    async(user)=>{


        if(user){


            utilisateurConnecte = true;


            produits = await chargerProduits(
                utilisateurConnecte
            );


            ventesGlobales = await chargerVentes(
                utilisateurConnecte
            );


            await chargerHistorique(
                utilisateurConnecte
            );



            mettreAJourResume(
                produits,
                ventesGlobales
            );


            calculerStockRestant(
                produits
            );


            console.log(
                "Utilisateur connecté"
            );


        }

        else{


            utilisateurConnecte = false;


            produits = [];

            ventesGlobales = [];



            console.log(
                "Utilisateur déconnecté"
            );


        }


    }

);
// ===============================
// CONNEXION HTML
// ===============================


window.vendreProduit = (id)=>{

    vendreProduit(
        id,
        produits
    );

};



window.confirmerVente = ()=>{


    confirmerVente(

        utilisateurConnecte,

        async()=>{

            produits =
            await chargerProduits(
                utilisateurConnecte
            );


            mettreAJourResume(
                produits,
                ventesGlobales
            );

        },


        async()=>{

            ventesGlobales =
            await chargerVentes(
                utilisateurConnecte
            );


        }

    );


};



window.fermerVente =
fermerVente;



window.viderHistorique = ()=>{


    viderHistorique(
        utilisateurConnecte
    );


};
window.modifierProduit = modifierProduit;


window.ajouterProduit = async ()=>{


    const nom =
    document.getElementById("nom")?.value;


    const prixGros =
    Number(
        document.getElementById("prixGros")?.value
    );


    const cartons =
    Number(
        document.getElementById("nombreCartons")?.value
    );


    const parCarton =
    Number(
        document.getElementById("produitsParCarton")?.value
    );


    const prixRevente =
    Number(
        document.getElementById("prixRevente")?.value
    );



    const stockTotal =
    cartons * parCarton;



    const prixTotalStock =
    prixGros * cartons;



    const prixUnitaire =
    prixGros / parCarton;



    const benefice =
    (prixRevente * stockTotal)
    -
    prixTotalStock;



    const produit = {


        nom,

        prixGros,

        nombreCartons: cartons,

        produitsParCarton: parCarton,

        prixTotalStock,

        stockTotal,

        prixUnitaire,

        prixRevente,

        benefice


    };



    if(estEnModification()){

    console.log(
        "Mode modification"
    );

}
else{

    console.log(
        "Mode ajout"
    );

}


const resultat =

await ajouterProduit(

    utilisateurConnecte,

    produit

);


    if(resultat){


        produits =
        await chargerProduits(
            utilisateurConnecte
        );


        mettreAJourResume(
            produits,
            ventesGlobales
        );


        viderChamps();


    }


};


window.supprimerProduit = (id)=>{

    supprimerProduit(
        utilisateurConnecte,
        id
    );

};
