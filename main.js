// ===============================
// IMPORTS
// ===============================

console.log("MAIN JS CHARGE");
import {

    auth,

    connexionGoogle as lancerConnexionGoogle,

    deconnexionGoogle as lancerDeconnexionGoogle

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

    annulerModification as resetModification

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

console.log("MAIN JS CHARGE");
console.log("connexionGoogle export firebase:", typeof lancerConnexionGoogle);





// ===============================
// ETAT APPLICATION
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];





// ===============================
// VERIFICATION FIREBASE
// ===============================


if(typeof lancerConnexionGoogle !== "function"){

    console.error(
        "Erreur : connexionGoogle absente dans firebase.js"
    );

}


if(typeof lancerDeconnexionGoogle !== "function"){

    console.error(
        "Erreur : deconnexionGoogle absente dans firebase.js"
    );

}





// ===============================
// CONNEXION GOOGLE
// ===============================


window.connexionGoogle = async function(){


    try{


        console.log(
            "Tentative connexion Google..."
        );


        await lancerConnexionGoogle();



    }


    catch(error){


        console.error(

            "Erreur connexion Google:",

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



                console.log(

                    "Utilisateur connecté:",

                    user.email

                );



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


            }

            else{


                utilisateurConnecte = false;


                produits = [];


                ventesGlobales = [];



                if(typeof viderDashboard === "function"){


                    viderDashboard();


                }



                console.log(

                    "Aucune session active"

                );


            }


        }


        catch(error){


            console.error(

                "Erreur chargement session:",

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


        resetModification();



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
// SUPPRIMER PRODUIT
// ===============================


window.supprimerProduit = async function(id){


    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }



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


    resetModification();


    viderChamps();


};





// ===============================
// ACTUALISATION DONNEES
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
