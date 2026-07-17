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
    estEnModification,
    annulerModification

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



            produits =

            await chargerProduits(

                utilisateurConnecte

            );



            ventesGlobales =

            await chargerVentes(

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
// ===============================
// CONFIRMATION VENTE
// ===============================


window.confirmerVente = async ()=>{


    const resultat =

    await confirmerVente(

        utilisateurConnecte

    );



    if(resultat){


        produits =

        await chargerProduits(

            utilisateurConnecte

        );



        ventesGlobales =

        await chargerVentes(

            utilisateurConnecte

        );



        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );


    }


};





// ===============================
// FERMER VENTE
// ===============================


window.fermerVente =

fermerVente;





// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = ()=>{


    viderHistorique(

        utilisateurConnecte

    );


};





// ===============================
// MODIFICATION PRODUIT
// ===============================


window.modifierProduit =

modifierProduit;





// ===============================
// AJOUT / MODIFICATION PRODUIT
// ===============================


window.ajouterProduit = async ()=>{


    const nom =

    document.getElementById("nom")?.value

    ||

    "";



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





    if(

        !nom ||

        prixGros <= 0 ||

        cartons <= 0 ||

        parCarton <= 0 ||

        prixRevente <= 0

    ){


        alert(

            "Veuillez remplir tous les champs correctement"

        );


        return;


    }





    const stockTotal =

    cartons * parCarton;




    const prixTotalStock =

    prixGros * cartons;




    const prixUnitaire =

    prixGros / stockTotal;




    const benefice =

    (prixRevente * stockTotal)

    -

    prixTotalStock;





    const produit = {


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



        calculerStockRestant(

            produits

        );



        viderChamps();



        annulerModification();


    }


};
// ===============================
// SUPPRESSION PRODUIT
// ===============================


window.supprimerProduit = async (id)=>{


    const resultat =

    await supprimerProduit(

        utilisateurConnecte,

        id

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



        calculerStockRestant(

            produits

        );


    }


};




// ===============================
// ANNULATION MODIFICATION
// ===============================


window.annulerModification = ()=>{


    annulerModification();



    viderChamps();


};




// ===============================
// PROTECTION ERREURS GLOBALES
// ===============================


window.addEventListener(

    "error",

    (event)=>{


        console.error(

            "Erreur application:",

            event.error

        );


    }

);
