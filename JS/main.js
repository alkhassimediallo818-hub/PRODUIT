// ===============================
// MAIN.JS
// CHEF D'ORCHESTRE APPLICATION
// ===============================


// ===============================
// IMPORTS
// ===============================


import {

    auth,

    connexionGoogle as lancerConnexion,

    deconnexionGoogle as lancerDeconnexion

} from "../firebase.js";



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

    calculerStockRestant

} from "./dashboard.js";





// ===============================
// VARIABLES GLOBALES
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];


let operationEnCours = false;





// ===============================
// CHARGEMENT CENTRAL
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


    }


    catch(error){


        console.error(

            "Erreur synchronisation:",

            error

        );


    }


}





// ===============================
// CONNEXION GOOGLE
// ===============================


window.connexionGoogle = async function(){


    try{


        await lancerConnexion();


    }


    catch(error){


        console.error(

            "Connexion Google échouée:",

            error

        );


        alert(

            "Impossible de se connecter"

        );


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

            "Déconnexion échouée:",

            error

        );


    }


};





// ===============================
// AUTH FIREBASE
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{


        try{


            if(user){


                utilisateurConnecte = true;



                await actualiserDonnees();



                console.log(

                    "Utilisateur connecté",

                    user.email

                );


            }


            else{


                utilisateurConnecte = false;


                produits = [];


                ventesGlobales = [];



                mettreAJourResume(

                    [],

                    []

                );



                calculerStockRestant(

                    []

                );



                console.log(

                    "Utilisateur déconnecté"

                );


            }


        }


        catch(error){


            console.error(

                "Erreur auth:",

                error

            );


        }


    }

);
// ===============================
// AJOUT PRODUIT
// ===============================


window.ajouterProduit = async function(){


    if(operationEnCours)

        return;



    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    try{


        operationEnCours = true;



        const donnees = {


            nom:

            document

            .getElementById("nom")

            ?.value,



            prixGros:

            document

            .getElementById("prixGros")

            ?.value,



            nombreCartons:

            document

            .getElementById("nombreCartons")

            ?.value,



            produitsParCarton:

            document

            .getElementById("produitsParCarton")

            ?.value,



            prixRevente:

            document

            .getElementById("prixRevente")

            ?.value


        };



        const resultat =

        await ajouterProduit(

            utilisateurConnecte,

            donnees

        );



        if(resultat){


            await actualiserDonnees();


            viderChamps();


            annulerModification();



            alert(

                "Produit enregistré"

            );


        }


    }


    catch(error){


        console.error(

            "Erreur ajout produit:",

            error

        );


        alert(

            "Erreur produit"

        );


    }


    finally{


        operationEnCours = false;


    }


};







// ===============================
// MODIFICATION PRODUIT
// ===============================


window.modifierProduit = function(id){


    try{


        const resultat =

        modifierProduit(id);



        if(!resultat){


            alert(

                "Produit introuvable"

            );


        }


    }


    catch(error){


        console.error(

            "Erreur modification:",

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
// SUPPRESSION PRODUIT
// ===============================


window.supprimerProduit = async function(id){


    if(operationEnCours)

        return;



    if(!utilisateurConnecte)

        return;



    try{


        const confirmation =

        confirm(

            "Supprimer ce produit ?"

        );



        if(!confirmation)

            return;



        operationEnCours = true;



        const resultat =

        await supprimerProduit(

            utilisateurConnecte,

            id

        );



        if(resultat){


            await actualiserDonnees();


        }


    }


    catch(error){


        console.error(

            "Erreur suppression:",

            error

        );


    }


    finally{


        operationEnCours = false;


    }


};







// ===============================
// VENTES
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


    if(operationEnCours)

        return;



    try{


        operationEnCours = true;



        const resultat =

        await confirmerVente(

            utilisateurConnecte

        );



        if(resultat){


            await actualiserDonnees();


        }


    }


    catch(error){


        console.error(

            "Erreur vente:",

            error

        );


    }


    finally{


        operationEnCours = false;


    }


};





window.fermerVente = function(){


    fermerVente();


};







// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = async function(){


    if(!utilisateurConnecte)

        return;



    try{


        const resultat =

        await viderHistorique(

            utilisateurConnecte

        );



        if(resultat){


            await chargerHistorique(

                utilisateurConnecte

            );


        }


    }


    catch(error){


        console.error(

            "Erreur historique:",

            error

        );


    }


};







// ===============================
// GESTION ERREURS GLOBALES
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
// FIN MAIN.JS
// ===============================
