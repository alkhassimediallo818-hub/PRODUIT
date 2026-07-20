// ===============================
// IMPORTS
// ===============================

import {

    auth,

    connexionGoogle as lancerConnexionGoogle,

    deconnexionGoogle as lancerDeconnexionGoogle

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

    annulerModification as resetModification

} from "./JS/produits.js";



import {

    chargerVentes,

    vendreProduit,

    confirmerVente,

    fermerVente as fermerFenetreVente

} from "./JS/ventes.js";



import {

    chargerHistorique,

    viderHistorique as supprimerHistorique

} from "./JS/historique.js";



import {

    mettreAJourResume,

    calculerStockRestant,

    viderDashboard,

    preparerGraphique

} from "./JS/dashboard.js";



console.log("MAIN JS CHARGE");

console.log(
    "connexionGoogle export firebase :",
    typeof lancerConnexionGoogle
);




// ===============================
// ETAT APPLICATION
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];




// ===============================
// VERIFICATION MODULES
// ===============================


if(
    typeof lancerConnexionGoogle !== "function"
){

    console.error(
        "connexionGoogle introuvable dans firebase.js"
    );

}



if(
    typeof lancerDeconnexionGoogle !== "function"
){

    console.error(
        "deconnexionGoogle introuvable dans firebase.js"
    );

}




// ===============================
// CONNEXION GOOGLE
// ===============================


window.connexionGoogle = async function(){


    try{


        console.log(
            "Connexion Google..."
        );


        await lancerConnexionGoogle();


    }


    catch(error){


        console.error(
            "Erreur connexion Google :",
            error
        );


        alert(
            error.message
        );


    }


};




// ===============================
// DECONNEXION GOOGLE
// ===============================


window.deconnexionGoogle = async function(){


    try{


        await lancerDeconnexionGoogle();


    }


    catch(error){


        console.error(
            "Erreur déconnexion :",
            error
        );


    }


};




// ===============================
// AUTHENTIFICATION
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{


        try{


            if(user){


                utilisateurConnecte = true;


                console.log(
                    "Utilisateur connecté :",
                    user.email
                );



                produits =
                await chargerProduits()
                || [];



                ventesGlobales =
                await chargerVentes()
                || [];



                await chargerHistorique();



                mettreAJourResume(
                    produits,
                    ventesGlobales
                );



                calculerStockRestant(
                    produits
                );



                preparerGraphique(
                    ventesGlobales
                );


            }


            else{


                utilisateurConnecte = false;


                produits = [];


                ventesGlobales = [];



                if(
                    typeof viderDashboard === "function"
                ){

                    viderDashboard();

                }



                console.log(
                    "Aucune session active"
                );


            }


        }


        catch(error){


            console.error(
                "Erreur chargement session :",
                error
            );


        }


    }

);
// ===============================
// GESTION VENTE
// ===============================


window.vendreProduit = function(id){


    if(!utilisateurConnecte){


        alert(
            "Connectez-vous d'abord"
        );


        return;


    }



    try{


        vendreProduit(id);



    }


    catch(error){


        console.error(
            "Erreur ouverture vente :",
            error
        );


    }


};






window.confirmerVente = async function(){


    if(!utilisateurConnecte){


        alert(
            "Connectez-vous d'abord"
        );


        return;


    }



    try{


        const resultat =

        await confirmerVente();



        if(!resultat)

            return;




        produits =

        await chargerProduits()
        || [];



        ventesGlobales =

        await chargerVentes()
        || [];




        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );



        preparerGraphique(

            ventesGlobales

        );


    }


    catch(error){


        console.error(

            "Erreur confirmation vente :",

            error

        );


        alert(

            "Erreur pendant la vente"

        );


    }


};






window.fermerVente = function(){


    try{


        fermerFenetreVente();


    }


    catch(error){


        console.error(

            "Erreur fermeture vente :",

            error

        );


    }


};







// ===============================
// PRODUITS
// ===============================


window.ajouterProduit = async function(){


    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    try{


        const donnees = {



            nom:

            document
            .getElementById("nom")
            ?.value
            ?.trim(),



            prixGros:

            Number(

                document
                .getElementById("prixGros")
                ?.value

            ),



            nombreCartons:

            Number(

                document
                .getElementById("nombreCartons")
                ?.value

            ),



            produitsParCarton:

            Number(

                document
                .getElementById("produitsParCarton")
                ?.value

            ),



            prixRevente:

            Number(

                document
                .getElementById("prixRevente")
                ?.value

            )


        };




        const resultat =

        await ajouterProduit(

            donnees

        );



        if(!resultat)

            return;




        produits =

        await chargerProduits()
        || [];



        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );



        viderChamps();



        resetModification();



    }


    catch(error){


        console.error(

            "Erreur ajout produit :",

            error

        );


        alert(

            "Impossible d'enregistrer le produit"

        );


    }


};






// ===============================
// MODIFIER PRODUIT
// ===============================


window.modifierProduit = function(id){


    try{


        const resultat =

        modifierProduit(id);



        if(!resultat){


            console.warn(

                "Produit introuvable"

            );


        }


    }


    catch(error){


        console.error(

            "Erreur modification :",

            error

        );


    }


};






// ===============================
// SUPPRIMER PRODUIT
// ===============================


window.supprimerProduit = async function(id){


    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    try{


        const resultat =

        await supprimerProduit(id);



        if(!resultat)

            return;




        produits =

        await chargerProduits()
        || [];



        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );


    }


    catch(error){


        console.error(

            "Erreur suppression :",

            error

        );


    }


};
// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = async function(){


    if(!utilisateurConnecte){


        alert(
            "Connectez-vous d'abord"
        );


        return;


    }



    try{


        await supprimerHistorique();



        console.log(

            "Historique supprimé"

        );


    }


    catch(error){


        console.error(

            "Erreur suppression historique :",

            error

        );


    }


};






// ===============================
// ANNULER MODIFICATION
// ===============================


window.annulerModification = function(){


    try{


        resetModification();


        viderChamps();


    }


    catch(error){


        console.error(

            "Erreur annulation modification :",

            error

        );


    }


};







// ===============================
// ACTUALISATION DONNEES
// ===============================


async function actualiserDonnees(){


    if(!utilisateurConnecte)

        return;



    try{


        produits =

        await chargerProduits()
        || [];



        ventesGlobales =

        await chargerVentes()
        || [];




        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );



        preparerGraphique(

            ventesGlobales

        );


    }


    catch(error){


        console.error(

            "Erreur actualisation :",

            error

        );


    }


}






// ===============================
// PROTECTION ERREURS GLOBALES
// ===============================


window.addEventListener(

    "error",

    (event)=>{


        console.error(

            "Erreur application :",

            event.error

        );


    }

);




window.addEventListener(

    "unhandledrejection",

    (event)=>{


        console.error(

            "Erreur Promise :",

            event.reason

        );


    }

);







// ===============================
// SYNCHRONISATION AUTOMATIQUE
// ===============================


setInterval(

    ()=>{


        if(

            auth.currentUser

            &&

            utilisateurConnecte

        ){


            actualiserDonnees();


        }


    },

    300000

);






// ===============================
// VERIFICATION FINAL
// ===============================


console.log(
    "Application prête"
);
