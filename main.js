// ==================================================
// MAIN JS - GPE
// Sprint 0 v1 - Orchestrateur Application
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
// ETAT APPLICATION
// ==================================================

let utilisateurConnecte = false;

let utilisateurActuel = null;

let produits = [];

let ventesGlobales = [];

let produitModification = null;




// ==================================================
// SYNCHRONISATION DONNEES
// ==================================================

async function actualiserDonnees(){


    if(!auth.currentUser)

        return;



    try{


        produits = await chargerProduits() || [];


        chargerProduitsVente(
            produits
        );



        ventesGlobales = await chargerVentes() || [];



        await chargerHistorique();


        await chargerNotifications();



        afficherVentes();



        mettreAJourResume(

            produits,

            ventesGlobales

        );



        calculerResumeVentes(

            ventesGlobales

        );



        calculerStockRestant(

            produits

        );



        preparerGraphique(

            ventesGlobales

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



        if(email)
            email.textContent = user.email;



        if(photo && user.photoURL)
            photo.src = user.photoURL;



        if(resultat.exists()){


            const data =
            resultat.data();



            if(pseudo)
                pseudo.textContent =
                data.nomUtilisateur;



            if(role)
                role.textContent =
                data.role;


        }



    }


    catch(error){

        console.error(
            "Erreur profil :",
            error
        );

    }


}




async function mettreEtatUtilisateur(user){


    if(user){


        utilisateurActuel = user;

        utilisateurConnecte = true;



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


        if(zone)
            zone.textContent =
            "Bienvenue";



    }

    else{


        utilisateurActuel = null;

        utilisateurConnecte = false;


    }


}







// ==================================================
// AUTHENTIFICATION
// ==================================================

onAuthStateChanged(

    auth,

    async(user)=>{


        console.log(
            "AUTH USER =",
            user
        );



        if(!user){

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
// EXPOSITION HTML
// ==================================================

window.connexionGoogle = async function(){


    await lancerConnexionGoogle();


};





window.deconnexionGoogle = async function(){


    await lancerDeconnexionGoogle();


    window.location.href =
    "accueil.html";


};





window.vendreProduit = vendreProduit;


window.confirmerVente = confirmerVente;


window.fermerVente = fermerVente;


window.selectionnerProduitVente =
selectionnerProduitVente;


window.calculerVente =
calculerVente;




window.ajouterProduit = async function(donnees){


    const resultat =
    await ajouterProduit(
        donnees
    );


    await actualiserDonnees();


    return resultat;


};





window.supprimerProduit = async function(id){


    const resultat =
    await supprimerProduit(
        id
    );


    await actualiserDonnees();


    return resultat;


};





window.modifierProduit = modifierProduit;



window.viderHistorique = async function(){


    await viderHistorique();


    await chargerHistorique();


};





window.lireNotification = async function(id){


    await marquerNotificationLue(id);


    await chargerNotifications();


};





window.marquerToutesCommeLues = async function(){


    await marquerToutesNotificationsLues();


    await chargerNotifications();


};





window.changerPeriodeGraphique = function(periode){


    changerPeriodeGraphique(
        periode
    );


    preparerGraphique(
        ventesGlobales
    );


};






// ==================================================
// ERREURS GLOBALES
// ==================================================

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





// ==================================================
// SYNCHRONISATION AUTOMATIQUE
// ==================================================

setInterval(

    ()=>{


        if(
            auth.currentUser &&
            utilisateurConnecte
        ){

            actualiserDonnees();

        }


    },

    300000

);





console.log(
    "Application prête avec authentification Firebase"
);
