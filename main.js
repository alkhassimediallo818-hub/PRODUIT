import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

if(!auth.currentUser){

    window.location.href =
    "./accueil.html";

}

import {

    db,

    auth,

    connexionGoogle as lancerConnexionGoogle,

    deconnexionGoogle as lancerDeconnexionGoogle,

    creerProfilUtilisateur

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

async function chargerProfilUtilisateur(user){

    try{


        const photo =
        document.getElementById(
            "photoProfilPage"
        );


        const email =
        document.getElementById(
            "emailProfil"
        );


        const pseudo =
        document.getElementById(
            "pseudoProfil"
        );


        const role =
        document.getElementById(
            "roleUtilisateur"
        );



        if(photo && user.photoURL){

            photo.src =
            user.photoURL;

        }



        if(email){

            email.textContent =
            user.email;

        }




        const reference = doc(

            db,

            "users",

            user.uid

        );



        const resultat =
        await getDoc(reference);




        if(resultat.exists()){


            const donnees =
            resultat.data();



            if(pseudo){

                pseudo.textContent =
                donnees.nomUtilisateur;

            }



            if(role){

                role.textContent =
                donnees.role;

            }


        }



    }

    catch(error){


        console.error(

            "Erreur chargement profil :",

            error

        );


    }


}


async function chargerNomUtilisateur(user){


    try{


        const reference = doc(

            db,

            "users",

            user.uid

        );



        const resultat =

        await getDoc(reference);



        const zone =

        document.getElementById(

            "userInfo"

        );



        if(
            resultat.exists()
            &&
            zone
        ){


            const donnees =

            resultat.data();



            zone.textContent =

            "Bienvenue " +

            donnees.nomUtilisateur;



        }

        else if(zone){


            zone.textContent =

            "Bienvenue utilisateur";


        }



    }


    catch(error){


        console.error(

            "Erreur nom utilisateur :",

            error

        );


    }


}

async function mettreEtatUtilisateur(user){


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



        await creerProfilUtilisateur(
            user
        );


        await chargerNomUtilisateur(
            user
        );


        await chargerProfilUtilisateur(
            user
        );



        if(zone){

            zone.textContent =
            "Bienvenue";

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


        if(!user){

            window.location.href =
            "accueil.html";

            return;

        }


        try{


            const profilReference = doc(

                db,

                "users",

                user.uid

            );


            const profil = await getDoc(

                profilReference

            );


            if(!profil.exists()){


                window.location.href =
                "profil.html";


                return;


            }


            // ICI ton chargement produits
            // ventes
            // historique
            // dashboard



        }


        catch(error){


            console.error(

                "Erreur session :",

                error

            );


        }


    }

);


        const profilReference = doc(

            db,

            "users",

            user.uid

        );



        const profil = await getDoc(

            profilReference

        );



        if(!profil.exists()){

            window.location.href = "profil.html";

            return;

        }


        try{


            // Mise à jour état connexion

            mettreEtatUtilisateur(

                user

            );




            if(user){



                utilisateurConnecte = true;



                console.log(

                    "Utilisateur connecté :",

                    user.email

                );




                // Chargement données utilisateur

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





                // Mise à jour tableau de bord

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
// NAVIGATION MENU
// ===============================

window.afficherSection = function(section){

    const profil =
document.getElementById(
    "sectionProfil"
);

    const dashboard =
    document.getElementById(
        "sectionDashboard"
    );

    const produits =
    document.getElementById(
        "sectionProduits"
    );

    const historique =
    document.getElementById(
        "sectionHistorique"
    );

     if(profil)
          profil.style.display = "none";

    if(dashboard)
        dashboard.style.display = "none";

    if(produits)
        produits.style.display = "none";

    if(historique)
        historique.style.display = "none";



    switch(section){

        case "dashboard":

            if(dashboard)
                dashboard.style.display = "grid";

        break;



       case "profil":

           if(profil)
                profil.style.display = "block";

        break;



        case "produits":

            if(produits)
                produits.style.display = "block";

        break;



        case "historique":

            if(historique)
                historique.style.display = "block";

        break;

    }

};



// ===============================
// AFFICHAGE PAR DEFAUT
// ===============================

window.addEventListener(

    "load",

    ()=>{

        afficherSection(
            "dashboard"
        );

    }

);


// ===============================
// RECHERCHE PRODUITS
// ===============================

window.rechercherProduit = function(){


    const recherche =

    document

    .getElementById(
        "rechercheProduit"
    )

    .value

    .toLowerCase();



    const lignes =

    document

    .querySelectorAll(
        "#tableauProduits tr"
    );



    lignes.forEach(

        (ligne)=>{


            const texte =

            ligne

            .textContent

            .toLowerCase();



            if(
                texte.includes(
                    recherche
                )
            ){

                ligne.style.display =
                "";

            }

            else{

                ligne.style.display =
                "none";

            }


        }

    );


};

window.afficherSection = function(section){

    const dashboard =
    document.getElementById("sectionDashboard");

    const produits =
    document.getElementById("sectionProduits");

    const historique =
    document.getElementById("sectionHistorique");

    const profil =
    document.getElementById("sectionProfil");


    if(dashboard)
        dashboard.style.display = "none";

    if(produits)
        produits.style.display = "none";

    if(historique)
        historique.style.display = "none";

    if(profil)
        profil.style.display = "none";


    if(section === "dashboard")
        dashboard.style.display = "grid";


    if(section === "produits")
        produits.style.display = "block";


    if(section === "historique")
        historique.style.display = "block";


    if(section === "profil")
        profil.style.display = "block";

};

// ===============================
// VERIFICATION APPLICATION
// ===============================



console.log(

    "Application prête avec authentification Firebase"

);
