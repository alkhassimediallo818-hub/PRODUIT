import {

    auth,

    connexionGoogle as lancerConnexionGoogle,

    deconnexionGoogle as lancerDeconnexionGoogle,

    verifierConnexionGoogle

} from "./firebase.js";



import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// ===============================
// IMPORT PRODUITS
// ===============================


import {

    chargerProduits,

    ajouterProduit,

    supprimerProduit,

    modifierProduit,

    viderChamps,

    annulerModification as resetModification

} from "./JS/produits.js";




// ===============================
// IMPORT VENTES
// ===============================


import {

    chargerVentes,

    vendreProduit,

    confirmerVente,

    fermerVente as fermerFenetreVente

} from "./JS/ventes.js";




// ===============================
// IMPORT HISTORIQUE
// ===============================


import {

    chargerHistorique,

    viderHistorique as supprimerHistorique

} from "./JS/historique.js";




// ===============================
// IMPORT DASHBOARD
// ===============================


import {

    mettreAJourResume,

    calculerStockRestant,

    viderDashboard,

    preparerGraphique

} from "./JS/dashboard.js";







console.log("MAIN JS CHARGE");






// ===============================
// ETAT APPLICATION
// ===============================


let utilisateurConnecte = false;


let utilisateurActuel = null;


let produits = [];


let ventesGlobales = [];







// ===============================
// AFFICHAGE ETAT UTILISATEUR
// ===============================


function mettreEtatUtilisateur(user){



    const zone =

    document.getElementById(

        "userInfo"

    );



    const boutonConnexion =

    document.getElementById(

        "btnConnexion"

    );



    const boutonDeconnexion =

    document.getElementById(

        "btnDeconnexion"

    );







    if(user){



        utilisateurActuel = user;



        utilisateurConnecte = true;





        if(zone){


            zone.textContent =

            "Connecté : "

            +

            user.email;


        }






        if(boutonConnexion){


            boutonConnexion.style.display =

            "none";


        }





        if(boutonDeconnexion){


            boutonDeconnexion.style.display =

            "inline-block";


        }



    }



    else{



        utilisateurActuel = null;



        utilisateurConnecte = false;





        if(zone){


            zone.textContent =

            "Non connecté";


        }






        if(boutonConnexion){


            boutonConnexion.style.display =

            "inline-block";


        }






        if(boutonDeconnexion){


            boutonDeconnexion.style.display =

            "none";


        }



    }


}









// ===============================
// CONNEXION GOOGLE
// ===============================


window.connexionGoogle = async function(){



    try{



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



        console.log(

            "Etat Firebase :",

            user

        );





        mettreEtatUtilisateur(

            user

        );





        if(user){



            try{



                produits =

                await chargerProduits(

                    true

                )

                ||

                [];





                ventesGlobales =

                await chargerVentes(

                    true

                )

                ||

                [];





                await chargerHistorique(

                    true

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

                    "Données chargées après connexion"

                );



            }



            catch(error){



                console.error(

                    "Erreur chargement données :",

                    error

                );


            }





        }


        else{



            produits = [];



            ventesGlobales = [];



            viderDashboard();



            console.log(

                "Utilisateur déconnecté"

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

            true

        );





        if(!resultat)

            return;






        await actualiserDonnees();





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

            .getElementById(

                "nom"

            )

            ?.value,





            prixGros:

            Number(

                document

                .getElementById(

                    "prixGros"

                )

                ?.value

            ),





            nombreCartons:

            Number(

                document

                .getElementById(

                    "nombreCartons"

                )

                ?.value

            ),





            produitsParCarton:

            Number(

                document

                .getElementById(

                    "produitsParCarton"

                )

                ?.value

            ),





            prixRevente:

            Number(

                document

                .getElementById(

                    "prixRevente"

                )

                ?.value

            )



        };







        const resultat =

        await ajouterProduit(

            true,

            donnees

        );







        if(!resultat)

            return;







        await actualiserDonnees();







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



        modifierProduit(

            id

        );



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

            true,

            id

        );






        if(!resultat)

            return;






        await actualiserDonnees();





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



        await supprimerHistorique(

            true

        );



        await chargerHistorique(

            true

        );



    }


    catch(error){



        console.error(

            "Erreur historique :",

            error

        );


    }



};
// ===============================
// ACTUALISATION DES DONNEES
// ===============================


async function actualiserDonnees(){



    if(!utilisateurConnecte)

        return;





    try{



        produits =

        await chargerProduits(

            true

        )

        || [];






        ventesGlobales =

        await chargerVentes(

            true

        )

        || [];







        await chargerHistorique(

            true

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


    catch(error){



        console.error(

            "Erreur actualisation données:",

            error

        );



    }



}








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

            "Erreur annulation modification:",

            error

        );



    }



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








// ===============================
// VERIFICATION APPLICATION
// ===============================



console.log(

    "Application prête avec authentification Firebase"

);
