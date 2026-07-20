// ===============================
// MAIN APPLICATION
// VERSION RENFORCEE
// ===============================


// ===============================
// IMPORT FIREBASE
// ===============================


import {

    auth,

    connexionGoogle as lancerConnexionGoogle,

    deconnexionGoogle as lancerDeconnexionGoogle

} from "./firebase.js";



import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// ===============================
// IMPORT MODULES
// ===============================


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





console.log(
    "MAIN JS CHARGE"
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


function verifierFonction(

    nom,

    fonction

){


    if(typeof fonction !== "function"){


        console.error(

            "Module manquant :",

            nom

        );


        return false;

    }


    return true;


}





verifierFonction(

    "connexionGoogle",

    lancerConnexionGoogle

);


verifierFonction(

    "deconnexionGoogle",

    lancerDeconnexionGoogle

);





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
// AUTHENTIFICATION FIREBASE
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{


        try{


            if(user){



                utilisateurConnecte = true;




                console.log(

                    "Connecté :",

                    user.email

                );



                produits =

                await chargerProduits(

                    utilisateurConnecte

                )

                || [];




                ventesGlobales =

                await chargerVentes(

                    utilisateurConnecte

                )

                || [];




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



                preparerGraphique(

                    ventesGlobales

                );



            }

            else{


                utilisateurConnecte = false;


                produits = [];


                ventesGlobales = [];



                viderDashboard();



                console.log(

                    "Aucun utilisateur connecté"

                );


            }


        }


        catch(error){


            console.error(

                "Erreur session Firebase :",

                error

            );


        }


    }


);
// ===============================
// GESTION DES VENTES
// ===============================


window.vendreProduit = function(id){


    if(!utilisateurConnecte){


        alert(
            "Connectez-vous d'abord"
        );


        return;


    }



    try{


        vendreProduit(

            id,

            produits

        );



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

        await confirmerVente(

            utilisateurConnecte

        );



        if(!resultat)

            return;




        produits =

        await chargerProduits(

            utilisateurConnecte

        )

        || [];




        ventesGlobales =

        await chargerVentes(

            utilisateurConnecte

        )

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
// GESTION PRODUITS
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

            ?.value,



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

            utilisateurConnecte,

            donnees

        );





        if(!resultat)

            return;





        produits =

        await chargerProduits(

            utilisateurConnecte

        )

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

        await supprimerProduit(

            utilisateurConnecte,

            id

        );



        if(!resultat)

            return;




        produits =

        await chargerProduits(

            utilisateurConnecte

        )

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
// GESTION HISTORIQUE
// ===============================


window.viderHistorique = async function(){


    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    try{


        await supprimerHistorique(

            utilisateurConnecte

        );



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
// ACTUALISATION AUTOMATIQUE
// ===============================


async function actualiserDonnees(){


    if(!utilisateurConnecte)

        return;



    try{


        produits =

        await chargerProduits(

            utilisateurConnecte

        )

        || [];




        ventesGlobales =

        await chargerVentes(

            utilisateurConnecte

        )

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
// SYNCHRONISATION 5 MINUTES
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
// VERIFICATION FINALE
// ===============================


console.log(

    "Application prête"

);
