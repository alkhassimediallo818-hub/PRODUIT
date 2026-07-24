import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

if(!auth.currentUser){

   

}

import {

    afficherNotification

} from "./JS/notifications.js";
window.afficherNotification =
afficherNotification;

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
afficherVentes,
vendreProduit,
confirmerVente,
fermerVente as fermerFenetreVente,
chargerProduitsVente,
selectionnerProduitVente,
calculerVente

} from "./JS/ventes.js";

window.selectionnerProduitVente = selectionnerProduitVente;

window.calculerVente = calculerVente;


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

    calculerResumeVentes,

    calculerStockRestant,

    viderDashboard,

    preparerGraphique,

    changerPeriodeGraphique

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
// MISE A JOUR DASHBOARD
// ===============================

function mettreAJourDashboard(
    produits = [],
    ventes = []
){

    // Sécurisation
    if(!Array.isArray(produits)){
        produits = [];
    }

    if(!Array.isArray(ventes)){
        ventes = [];
    }


    // ===============================
    // PRODUITS
    // ===============================

    const nombreProduits =
    produits.length;


    const stock =
    produits.reduce(

        (total, produit)=>{

            return total +
            Number(
                produit.stockTotal || 0
            );

        },

        0

    );


    const depenses =
    produits.reduce(

        (total, produit)=>{

            return total +
            Number(
                produit.prixGros || 0
            );

        },

        0

    );


    const valeurStock =
    produits.reduce(

        (total, produit)=>{

            return total +

            (

                Number(
                    produit.stockTotal || 0
                )

                *

                Number(
                    produit.prixUnitaire || 0
                )

            );

        },

        0

    );


    const produitsFaibles =
    produits.filter(

        (produit)=>{

            return Number(
                produit.stockTotal || 0
            ) <= 5;

        }

    );


    // ===============================
    // VENTES
    // ===============================

    const transactions =
    ventes.length;


    const chiffreAffaires =
    ventes.reduce(

        (total, vente)=>{

            return total +

            Number(
                vente.montantTotal || 0
            );

        },

        0

    );


    const benefice =
    ventes.reduce(

        (total, vente)=>{

            return total +

            Number(
                vente.benefice || 0
            );

        },

        0

    );


    const unitesVendues =
    ventes.reduce(

        (total, vente)=>{

            return total +

            Number(
                vente.quantiteVendue || 0
            );

        },

        0

    );


    const aujourdHui =
    new Date().toDateString();


    const ventesJour =
    ventes.reduce(

        (total, vente)=>{

            if(

                vente.date &&
                typeof vente.date.toDate === "function"

            ){

                if(

                    vente.date
                    .toDate()
                    .toDateString()

                    ===

                    aujourdHui

                ){

                    return total +

                    Number(
                        vente.montantTotal || 0
                    );

                }

            }

            return total;

        },

        0

    );


    const totalStock =
    stock;


    const taux =
    (totalStock + unitesVendues) === 0

    ?

    0

    :

    Math.round(

        (

            unitesVendues

            /

            (totalStock + unitesVendues)

        )

        * 100

    );


    let derniere =
    "Aucune";


    if(ventes.length){

        const vente =
        ventes[ventes.length - 1];

        if(

            vente.date &&
            typeof vente.date.toDate === "function"

        ){

            derniere =
            vente.date
            .toDate()
            .toLocaleString();

        }

    }
        // ===============================
    // TOP PRODUITS
    // ===============================

    const classement = {};

    ventes.forEach((vente)=>{

        const nom =
        vente.produit || "Inconnu";

        classement[nom] =

        (

            classement[nom]

            ||

            0

        )

        +

        Number(
            vente.quantiteVendue || 0
        );

    });



    let meilleurProduit = "Aucun";
    let meilleureQuantite = 0;


    Object.entries(classement).forEach(

        ([nom, quantite])=>{

            if(quantite > meilleureQuantite){

                meilleureQuantite =
                quantite;

                meilleurProduit =
                nom;

            }

        }

    );



    // ===============================
    // LISTE STOCK FAIBLE
    // ===============================

    const liste =
    document.getElementById(
        "listeStockFaible"
    );

    if(liste){

        if(produitsFaibles.length === 0){

            liste.textContent =
            "Aucun produit";

        }

        else{

            liste.innerHTML =

            produitsFaibles

            .map(

                (produit)=>`

                <div>

                ${produit.nom}

                (${produit.stockTotal})

                </div>

                `

            )

            .join("");

        }

    }



    // ===============================
    // MISE A JOUR DASHBOARD
    // ===============================

    animerCompteur(
        "nbProduits",
        nombreProduits
    );

    animerCompteur(
        "stockRestant",
        stock
    );

    animerCompteur(
        "nbTransactions",
        transactions
    );

    animerCompteur(
        "stockFaible",
        produitsFaibles.length
    );

    animerCompteur(
        "unitesVendues",
        unitesVendues
    );



    const majTexte = (id, valeur)=>{

        const element =
        document.getElementById(id);

        if(element){

            element.textContent =
            valeur;

        }

    };



    majTexte(
        "beneficeTotal",
        benefice + " FCFA"
    );

    majTexte(
        "beneficeVentes",
        benefice + " FCFA"
    );

    majTexte(
        "chiffreAffaires",
        chiffreAffaires + " FCFA"
    );

    majTexte(
        "ventesJour",
        ventesJour + " FCFA"
    );

    majTexte(
        "depensesTotales",
        depenses + " FCFA"
    );

    majTexte(
        "valeurStock",
        valeurStock + " FCFA"
    );

    majTexte(
        "tauxVente",
        taux + " %"
    );

    majTexte(
        "derniereVente",
        derniere
    );

    majTexte(
        "produitVedette",
        meilleurProduit
    );



    const top =
    document.getElementById(
        "topProduits"
    );

    if(top){

        top.innerHTML = "";

        Object.entries(classement)

        .sort(
            (a,b)=>b[1]-a[1]
        )

        .slice(0,5)

        .forEach(

            ([nom, quantite])=>{

                top.innerHTML += `

                <div>

                ${nom}

                <strong>

                (${quantite})

                </strong>

                </div>

                `;

            }

        );

    }

}

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

// ===============================
// ANIMATION DES COMPTEURS DASHBOARD
// ===============================

function animerCompteur(elementId, valeurFinale){


    const element =
    document.getElementById(
        elementId
    );


    if(!element)
        return;



    let valeur = 0;


    const increment =
    Math.max(
        1,
        Math.ceil(
            valeurFinale / 50
        )
    );



    const timer =
    setInterval(()=>{


        valeur += increment;



        if(valeur >= valeurFinale){


            valeur = valeurFinale;


            clearInterval(timer);


        }



        element.textContent =
        valeur.toLocaleString(
            "fr-FR"
        );



    },20);


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

            await actualiserDonnees(); // <-- ajouter ici

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
await chargerProduits(true)
|| [];


chargerProduitsVente(produits);






        ventesGlobales =

        await chargerVentes(

            true

        )

        || [];







        await chargerHistorique(

            true

        );



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

const boutonsMenu = document.querySelectorAll(
    ".sidebar button"
);

// ===============================
// GESTION DES SECTIONS + MENU ACTIF
// ===============================

// ===============================
// NAVIGATION ENTRE LES SECTIONS
// ===============================

window.afficherSection = function(section){

    const sections = {

        dashboard: "dashboard",

        produits: "produits",

        ventes: "ventes",

        historique: "historique",

        profil: "profil",

        parametres: "parametres"

    };

    Object.values(sections).forEach((id)=>{

        const element = document.getElementById(id);

        if(element){

            element.style.display = "none";

        }

    });

    const sectionActive = sections[section];

    if(!sectionActive){

        console.log(
            "Section inconnue :",
            section
        );

        return;

    }

    const element = document.getElementById(sectionActive);

    if(!element){

        console.error(
            "Section introuvable :",
            sectionActive
        );

        return;

    }

    if(section === "dashboard"){

        element.style.display = "grid";

    }else{

        element.style.display = "block";

    }

    boutonsMenu.forEach((bouton)=>{

        bouton.classList.remove("active");

        if(
            bouton.getAttribute("onclick")
            ?.includes(section)
        ){

            bouton.classList.add("active");

        }

    });

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
