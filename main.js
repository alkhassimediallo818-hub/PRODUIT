// ==================================================
// MAIN JS - GPE
// Sprint 0 v2 - Orchestrateur Application Refactorisé
// ==================================================

console.log("MAIN JS CHARGE");


// ==================================================
// FIREBASE
// ==================================================

import {

    auth,
    db,

    connexionGoogle as lancerConnexionGoogle,
    deconnexionGoogle as lancerDeconnexionGoogle,
    creerProfilUtilisateur

} from "./firebase.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    doc,
    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// ==================================================
// PRODUITS
// ==================================================

import {

    chargerProduits,
    ajouterProduit,
    supprimerProduit,
    modifierProduit,
    getProduits,
    viderChamps

} from "./JS/produits/index.js";




// ==================================================
// VENTES
// ==================================================

import {

    chargerVentes,
    afficherVentes,
    vendreProduit,
    confirmerVente,
    fermerVente,
    chargerProduitsVente,
    selectionnerProduitVente,
    calculerVente

} from "./JS/ventes.js";




// ==================================================
// HISTORIQUE
// ==================================================

import {

    chargerHistorique,
    viderHistorique

} from "./JS/historique.js";




// ==================================================
// NOTIFICATIONS
// ==================================================

import {

    chargerNotifications,
    marquerToutesNotificationsLues,
    marquerNotificationLue

} from "./JS/notifications.js";




// ==================================================
// DASHBOARD
// ==================================================

import {

    mettreAJourResume,
    calculerResumeVentes,
    calculerStockRestant,
    preparerGraphique,
    changerPeriodeGraphique

} from "./JS/dashboard.js";





// ==================================================
// ETAT GLOBAL APPLICATION
// ==================================================

const EtatApplication = {


    utilisateurConnecte:false,


    utilisateurActuel:null,


    produits:[],


    ventes:[],


    chargement:false


};




// ==================================================
// VERIFICATION UTILISATEUR
// ==================================================

function utilisateurValide(){


    return (

        EtatApplication.utilisateurConnecte
        &&
        auth.currentUser

    );


}






// ==================================================
// SYNCHRONISATION DES DONNEES
// ==================================================

async function actualiserDonnees(){



    if(!utilisateurValide()){

        console.warn(
            "Synchronisation impossible : utilisateur absent"
        );

        return;

    }



    if(EtatApplication.chargement){

        console.log(
            "Synchronisation déjà en cours"
        );

        return;

    }



    EtatApplication.chargement = true;



    try{


        EtatApplication.produits =
        await chargerProduits() || [];



        chargerProduitsVente(

            EtatApplication.produits

        );




        EtatApplication.ventes =
        await chargerVentes() || [];




        await chargerHistorique();



        await chargerNotifications();




        afficherVentes();




        mettreAJourResume(

            EtatApplication.produits,

            EtatApplication.ventes

        );




        calculerResumeVentes(

            EtatApplication.ventes

        );




        calculerStockRestant(

            EtatApplication.produits

        );




        preparerGraphique(

            EtatApplication.ventes

        );




        console.log(
            "Données actualisées"
        );



    }


    catch(error){


        console.error(

            "Erreur actualisation données :",

            error

        );


    }


    finally{


        EtatApplication.chargement = false;


    }



}
// ==================================================
// PROFIL UTILISATEUR
// ==================================================

async function chargerProfilUtilisateur(user){


    try{


        const reference = doc(

            db,

            "users",

            user.uid

        );



        const resultat = await getDoc(

            reference

        );




        const pseudo =
        document.getElementById(
            "pseudoProfil"
        );



        const role =
        document.getElementById(
            "roleUtilisateur"
        );



        const email =
        document.getElementById(
            "emailProfil"
        );



        const photo =
        document.getElementById(
            "photoProfilPage"
        );





        if(email){

            email.textContent =
            user.email || "";

        }




        if(photo && user.photoURL){

            photo.src =
            user.photoURL;

        }





        if(resultat.exists()){


            const donnees =
            resultat.data();




            if(pseudo){

                pseudo.textContent =
                donnees.nomUtilisateur || "Utilisateur";

            }





            if(role){

                role.textContent =
                donnees.role || "Utilisateur";

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







async function mettreEtatUtilisateur(user){



    if(user){



        EtatApplication.utilisateurActuel =
        user;



        EtatApplication.utilisateurConnecte =
        true;





        await creerProfilUtilisateur(

            user

        );





        await chargerProfilUtilisateur(

            user

        );





        const zone =
        document.getElementById(

            "userInfo"

        );





        if(zone){


            zone.textContent =

            "Bienvenue";


        }





        console.log(

            "Utilisateur prêt :",

            user.uid

        );



    }


    else{



        EtatApplication.utilisateurActuel =
        null;



        EtatApplication.utilisateurConnecte =
        false;



        console.log(

            "Utilisateur déconnecté"

        );



    }



}







// ==================================================
// AUTHENTIFICATION FIREBASE
// ==================================================

onAuthStateChanged(

    auth,


    async(user)=>{


        console.log(

            "AUTH USER =",

            user

        );




        if(!user){


            mettreEtatUtilisateur(null);


            console.log(

                "Aucun utilisateur connecté"

            );


            return;


        }





        console.log(

            "UID CONNECTE =",

            user.uid

        );





        await mettreEtatUtilisateur(

            user

        );





        await actualiserDonnees();



    }


);


// ==================================================
// EXPOSITION DES FONCTIONS HTML
// ==================================================


// ===============================
// AUTHENTIFICATION
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


    }


};





window.deconnexionGoogle = async function(){



    try{


        await lancerDeconnexionGoogle();



        window.location.href =

        "accueil.html";



    }


    catch(error){


        console.error(

            "Erreur déconnexion :",

            error

        );


    }


};







// ===============================
// PRODUITS
// ===============================


window.ajouterProduit = async function(donnees){



    if(!utilisateurValide()){


        alert(

            "Connectez-vous d'abord"

        );


        return null;


    }




    try{


        const resultat =

        await ajouterProduit(

            donnees

        );




        await actualiserDonnees();




        return resultat;



    }


    catch(error){


        console.error(

            "Erreur ajout produit :",

            error

        );


    }


};







window.supprimerProduit = async function(id){



    if(!utilisateurValide()){


        return;


    }




    try{


        const resultat =

        await supprimerProduit(

            id

        );




        await actualiserDonnees();




        return resultat;



    }


    catch(error){


        console.error(

            "Erreur suppression produit :",

            error

        );


    }



};






window.modifierProduit = function(id){


    if(!utilisateurValide()){


        return;


    }



    return modifierProduit(id);


};







window.viderChamps = function(){


    viderChamps();


};








// ===============================
// VENTES
// ===============================


window.vendreProduit = function(id){



    return vendreProduit(id);


};






window.confirmerVente = async function(){



    const resultat =

    await confirmerVente();




    await actualiserDonnees();




    return resultat;


};






window.fermerVente = function(){


    fermerVente();


};






window.selectionnerProduitVente = function(id){



    selectionnerProduitVente(id);


};






window.calculerVente = function(){


    calculerVente();


};

// ===============================
// HISTORIQUE
// ===============================


window.viderHistorique = async function(){


    if(!utilisateurValide()){

        return;

    }



    try{


        await viderHistorique();



        await chargerHistorique();



    }


    catch(error){


        console.error(

            "Erreur suppression historique :",

            error

        );


    }


};







// ===============================
// NOTIFICATIONS
// ===============================


window.lireNotification = async function(id){



    try{


        await marquerNotificationLue(

            id

        );



        await chargerNotifications();



    }


    catch(error){


        console.error(

            "Erreur notification :",

            error

        );


    }


};







window.marquerToutesCommeLues = async function(){



    try{


        await marquerToutesNotificationsLues();



        await chargerNotifications();



    }


    catch(error){


        console.error(

            "Erreur lecture notifications :",

            error

        );


    }


};







// ===============================
// DASHBOARD
// ===============================


window.changerPeriodeGraphique = function(periode){



    changerPeriodeGraphique(

        periode

    );




    preparerGraphique(

        EtatApplication.ventes

    );



};







// ===============================
// ERREURS GLOBALES
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

            utilisateurValide()

        ){


            actualiserDonnees();


        }



    },



    300000



);




// ==================================================
// INTERFACE NAVIGATION
// ==================================================


window.afficherSection = function(section){


    document
    .querySelectorAll(".section")
    .forEach((element)=>{


        element.style.display = "none";


    });



    const cible =
    document.getElementById(section);



    if(cible){

        cible.style.display = "block";

    }


};





window.toggleNotifications = function(){


    const panneau =
    document.getElementById(
        "notificationPanel"
    );



    if(!panneau){

        console.warn(
            "Panneau notifications introuvable"
        );

        return;

    }



    panneau.classList.toggle(
        "active"
    );


};


// ===============================
// FIN APPLICATION
// ===============================


console.log(

    "Application prête avec authentification Firebase"

);
