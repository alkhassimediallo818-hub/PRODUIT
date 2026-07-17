// ===============================
// IMPORTS
// ===============================


import {

    auth,

    connexionGoogle as lancerConnexion,

    deconnexionGoogle as lancerDeconnexion

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

    calculerStockRestant,

    viderDashboard,

    preparerGraphique

} from "./dashboard.js";





// ===============================
// ETAT APPLICATION
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];




// ===============================
// CONNEXION GOOGLE
// ===============================


window.connexionGoogle = async function(){

    alert("Test bouton");

    try{

        await lancerConnexion();

    }

    catch(error){

        console.error(
            "Erreur connexion Google:",
            error
        );

        alert(error.message);

    }

};





// ===============================
// DECONNEXION GOOGLE
// ===============================


window.deconnexionGoogle = async function(){


    try{


        await lancerDeconnexion();


    }


    catch(error){


        console.error(

            "Erreur déconnexion:",

            error

        );


    }


};





// ===============================
// SURVEILLANCE AUTH FIREBASE
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{


        try{


            if(user){


                utilisateurConnecte = true;



                produits =

                await chargerProduits(

                    utilisateurConnecte

                ) || [];



                ventesGlobales =

                await chargerVentes(

                    utilisateurConnecte

                ) || [];



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



                console.log(

                    "Session active:",

                    user.email

                );


            }

            else{


                utilisateurConnecte = false;


                produits = [];


                ventesGlobales = [];


                viderDashboard();



                console.log(

                    "Aucune session"

                );


            }


        }


        catch(error){


            console.error(

                "Erreur initialisation:",

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



    vendreProduit(

        id,

        produits

    );


};





window.confirmerVente = async function(){


    try{


        if(!utilisateurConnecte){


            alert(

                "Utilisateur non connecté"

            );


            return;


        }



        const resultat =

        await confirmerVente(

            utilisateurConnecte

        );



        if(!resultat)

            return;




        produits =

        await chargerProduits(

            utilisateurConnecte

        ) || [];



        ventesGlobales =

        await chargerVentes(

            utilisateurConnecte

        ) || [];





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

            "Erreur confirmation vente:",

            error

        );


        alert(

            "Erreur pendant la vente"

        );


    }


};





window.fermerVente = function(){


    fermerVente();


};





// ===============================
// AJOUT / MODIFICATION PRODUIT
// ===============================


window.ajouterProduit = async function(){


    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }




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

        ) || [];





        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );



        viderChamps();



        annulerModification();



        alert(

            "Produit enregistré"

        );


    }


    catch(error){


        console.error(

            "Erreur produit:",

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


    const resultat =

    modifierProduit(id);



    if(!resultat){


        alert(

            "Produit introuvable"

        );


    }


};





// ===============================
// SUPPRIMER PRODUIT
// ===============================


window.supprimerProduit = async function(id){


    try{


        if(!utilisateurConnecte)

            return;




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

        ) || [];




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

            "Erreur suppression:",

            error

        );


    }


};
// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = async function(){


    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }



        await viderHistorique(

            utilisateurConnecte

        );


    }


    catch(error){


        console.error(

            "Erreur historique:",

            error

        );


    }


};





// ===============================
// ANNULER MODIFICATION
// ===============================


window.annulerModification = function(){


    annulerModification();


    viderChamps();


};





// ===============================
// RAFRAICHISSEMENT AUTOMATIQUE
// ===============================


async function actualiserDonnees(){


    if(!utilisateurConnecte)

        return;



    try{


        produits =

        await chargerProduits(

            utilisateurConnecte

        ) || [];



        ventesGlobales =

        await chargerVentes(

            utilisateurConnecte

        ) || [];



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

            "Erreur actualisation:",

            error

        );


    }


}





// ===============================
// PROTECTION ERREURS
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





window.addEventListener(

    "unhandledrejection",

    (event)=>{


        console.error(

            "Erreur Promise:",

            event.reason

        );


    }

);





// ===============================
// VERIFICATION SESSION
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
