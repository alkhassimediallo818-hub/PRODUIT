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
    getProduits
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
