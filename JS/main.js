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
    calculerStockRestant

} from "./dashboard.js";




// ===============================
// VARIABLES GLOBALES
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];


let chargement = false;





// ===============================
// RAFRAICHISSEMENT CENTRAL
// ===============================


async function actualiserApplication(){


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

            "Erreur actualisation:",

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

            "Erreur connexion Google:",

            error

        );



        alert(

            "Connexion impossible"

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



                await actualiserApplication();



                console.log(

                    "Utilisateur connecté:",

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
// VENTE
// ===============================


window.vendreProduit = function(id){


    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    const resultat =

    vendreProduit(

        id,

        produits

    );



    if(resultat === false){


        alert(

            "Produit introuvable"

        );


    }


};





window.confirmerVente = async function(){


    if(chargement)

        return;



    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }



        chargement = true;



        const resultat =

        await confirmerVente(

            utilisateurConnecte

        );



        if(resultat){


            await actualiserApplication();


        }


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


    finally{


        chargement = false;


    }


};





window.fermerVente = function(){


    fermerVente();


};




// ===============================
// AJOUT / MODIFICATION PRODUIT
// ===============================


window.ajouterProduit = async function(){


    if(chargement)

        return;



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



        chargement = true;



        const resultat =

        await ajouterProduit(

            utilisateurConnecte,

            donnees

        );



        if(resultat){


            await actualiserApplication();



            viderChamps();



            annulerModification();



            alert(

                "Produit enregistré"

            );


        }

        else{


            alert(

                "Impossible d'enregistrer"

            );


        }


    }


    catch(error){


        console.error(

            "Erreur produit:",

            error

        );


        alert(

            "Erreur produit"

        );


    }


    finally{


        chargement = false;


    }


};





// ===============================
// MODIFIER PRODUIT
// ===============================


window.modifierProduit = function(id){


    try{


        const resultat =

        modifierProduit(id);



        if(resultat === false){


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
// SUPPRIMER PRODUIT
// ===============================


window.supprimerProduit = async function(id){


    if(chargement)

        return;



    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }



        const confirmation =

        confirm(

            "Supprimer ce produit ?"

        );



        if(!confirmation)

            return;



        chargement = true;



        const resultat =

        await supprimerProduit(

            utilisateurConnecte,

            id

        );



        if(resultat){


            await actualiserApplication();


        }


        else{


            alert(

                "Suppression refusée"

            );


        }


    }


    catch(error){


        console.error(

            "Erreur suppression:",

            error

        );


        alert(

            "Suppression impossible"

        );


    }


    finally{


        chargement = false;


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
// RAFRAICHISSEMENT MANUEL
// ===============================


window.actualiser = async function(){


    if(!utilisateurConnecte){


        alert(

            "Connectez-vous d'abord"

        );


        return;


    }



    await actualiserApplication();


};





// ===============================
// PROTECTION ERREURS GLOBALES
// ===============================


window.addEventListener(

    "error",

    function(event){


        console.error(

            "Erreur JavaScript:",

            event.error

        );


    }

);





window.addEventListener(

    "unhandledrejection",

    function(event){


        console.error(

            "Erreur Promise:",

            event.reason

        );


    }

);





// ===============================
// VERIFICATION DOM
// ===============================


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        console.log(

            "Application prête"

        );


    }

);
