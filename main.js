import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

if(!auth.currentUser){

   

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


window.deconnexionGoogle = async function(){

    const resultat = await lancerDeconnexionGoogle();

    if(resultat){

        console.log(
            "Déconnexion réussie"
        );

        window.location.href =
        "accueil.html";

    }

};




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

     console.log("ETAT UTILISATEUR TERMINE");
    
    
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


        console.log(
            "AUTH USER =",
            user
        );


        if(!user){

            console.log(
                "Aucun utilisateur pour le moment"
            );

            return;

        }



        console.log(
            "UID CONNECTE =",
            user.uid
        );


        try{

            mettreEtatUtilisateur(user);


            // reste du chargement

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

    document.getElementById(
        "sectionDashboard"
    ).style.display = "block";

break;


      case "produits":

document.getElementById(
"sectionProduits"
).style.display="block";

break;


case "historique":

document.getElementById(
"sectionHistorique"
).style.display="block";

break;


case "profil":

document.getElementById(
"sectionProfil"
).style.display="block";

break;


case "parametres":

document.getElementById(
"sectionParametres"
).style.display="block";

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

// ===============================
// GESTION DES SECTIONS
// ===============================

window.afficherSection = function(section){

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

    const profil =
    document.getElementById(
        "sectionProfil"
    );

    const parametres =
    document.getElementById(
        "sectionParametres"
    );



    // Masquer toutes les sections

    if(dashboard)
        dashboard.style.display = "none";

    if(produits)
        produits.style.display = "none";

    if(historique)
        historique.style.display = "none";

    if(profil)
        profil.style.display = "none";

    if(parametres)
        parametres.style.display = "none";



    // Afficher la section demandée

    switch(section){

        case "dashboard":

            if(dashboard)
                dashboard.style.display = "grid";

        break;



        case "produits":

            if(produits)
                produits.style.display = "block";

        break;



        case "historique":

            if(historique)
                historique.style.display = "block";

        break;



        case "profil":

            if(profil)
                profil.style.display = "block";

        break;



        case "parametres":

            if(parametres)
                parametres.style.display = "block";

        break;



        default:

            console.warn(
                "Section inconnue :",
                section
            );

    }

};

window.deconnexionGoogle = async function(){

    try{

        await lancerDeconnexionGoogle();

        console.log(
            "Déconnexion réussie"
        );

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


window.connexionGoogle = async function(){

    await lancerConnexionGoogle();

};

// ===============================
// GESTION DES SECTIONS
// ===============================


window.afficherSection = function(section){


    const sections = document.querySelectorAll(
        ".page-section"
    );


    sections.forEach((element)=>{

        element.style.display =
        "none";

    });



    switch(section){


        case "profil":

            document.getElementById(
                "sectionProfil"
            ).style.display = "block";

            break;



        case "parametres":

            document.getElementById(
                "sectionParametres"
            ).style.display = "block";

            break;



        case "dashboard":

            document.getElementById(
                "dashboard"
            ).style.display = "block";

            break;



        default:

            console.log(
                "Section inconnue :",
                section
            );

    }

};




// ===============================
// MODE SOMBRE
// ===============================


const boutonSombre =
document.getElementById(
    "btnModeSombre"
);



if(boutonSombre){


    boutonSombre.addEventListener(

        "click",

        ()=>{


            document.body.classList.toggle(
                "dark-mode"
            );


            localStorage.setItem(

                "modeSombre",

                document.body.classList.contains(
                    "dark-mode"
                )

            );


        }

    );

}




// CHARGER LE MODE AU DEMARRAGE

if(
localStorage.getItem("modeSombre")
==="true"
){

    document.body.classList.add(
        "dark-mode"
    );

}

// ===============================
// VERIFICATION APPLICATION
// ===============================



console.log(

    "Application prête avec authentification Firebase"

);
