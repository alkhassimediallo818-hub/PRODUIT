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
    calculerStockRestant

} from "./dashboard.js";




// ===============================
// VARIABLES
// ===============================


let utilisateurConnecte = false;


let produits = [];


let ventesGlobales = [];




// ===============================
// AUTHENTIFICATION HTML
// ===============================


window.connexionGoogle = async ()=>{


    try{


        await lancerConnexion();


    }


    catch(error){


        console.error(

            "Erreur connexion:",

            error

        );


        alert(

            "Connexion impossible"

        );


    }


};





window.deconnexionGoogle = async ()=>{


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
// AUTHENTIFICATION FIREBASE
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


        catch(error){


            console.error(

                "Erreur chargement:",

                error

            );


        }


    }

);
// ===============================
// VENTE
// ===============================


window.vendreProduit = (id)=>{


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





window.confirmerVente = async ()=>{


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



        if(resultat === false)

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





window.fermerVente =

fermerVente;





// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = async ()=>{


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
// MODIFICATION PRODUIT
// ===============================


window.modifierProduit = (id)=>{


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
// AJOUT / MODIFICATION PRODUIT
// ===============================


window.ajouterProduit = async ()=>{


    try{


        if(!utilisateurConnecte){


            alert(

                "Connectez-vous d'abord"

            );


            return;


        }



        const nom =

        document
        .getElementById("nom")
        ?.value
        .trim();



        const prixGros =

        Number(

            document
            .getElementById("prixGros")
            ?.value

        );



        const cartons =

        Number(

            document
            .getElementById("nombreCartons")
            ?.value

        );



        const parCarton =

        Number(

            document
            .getElementById("produitsParCarton")
            ?.value

        );



        const prixRevente =

        Number(

            document
            .getElementById("prixRevente")
            ?.value

        );



        if(

            !nom ||

            prixGros <= 0 ||

            cartons <= 0 ||

            parCarton <= 0 ||

            prixRevente <= 0

        ){


            alert(

                "Informations produit invalides"

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


    }


    catch(error){


        console.error(

            "Erreur ajout produit:",

            error

        );


        alert(

            "Impossible d'ajouter le produit"

        );


    }


};
// ===============================
// SUPPRESSION PRODUIT
// ===============================


window.supprimerProduit = async(id)=>{


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



        if(resultat){


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


    }


    catch(error){


        console.error(

            "Erreur suppression produit:",

            error

        );


        alert(

            "Suppression impossible"

        );


    }


};





// ===============================
// ANNULER MODIFICATION
// ===============================


window.annulerModification = ()=>{


    resetModification();


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





window.addEventListener(

    "unhandledrejection",

    (event)=>{


        console.error(

            "Erreur promise:",

            event.reason

        );


    }

);
