import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// VARIABLES GLOBALES
// ===============================

let produits = [];

let ventesGlobales = [];

let utilisateurConnecte = false;

let produitModification = null;

let produitVenteActuel = null;

let traitementVente = false;

let chargementProduits = false;

let chargementVentes = false;

let chargementHistorique = false;



// ===============================
// SECURITE
// ===============================


function utilisateurValide(){

    return (
        utilisateurConnecte === true &&
        auth.currentUser !== null
    );

}




function nettoyerTexte(texte){

    if(typeof texte !== "string")
        return "";


    return texte
        .trim()
        .replace(/[<>]/g,"");

}




function nombreValide(valeur){

    const nombre = Number(valeur);


    return Number.isFinite(nombre)
        ? nombre
        : 0;

}




function dateValide(date){

    try{

        if(
            date &&
            typeof date.toDate === "function"
        ){

            return date.toDate();

        }


        return null;

    }

    catch{

        return null;

    }

}




// ===============================
// HISTORIQUE
// ===============================


async function enregistrerHistorique(type, produit){


    if(!utilisateurValide())
        return;



    try{


        await addDoc(

            collection(
                db,
                "historique"
            ),

            {

                userId:
                auth.currentUser.uid,


                type:
                nettoyerTexte(type)
                ||
                "action",


                produit:
                nettoyerTexte(produit)
                ||
                "Inconnu",


                date:
                serverTimestamp()

            }

        );


    }


    catch(error){


        console.error(
            "Erreur historique:",
            error
        );


    }


}





// ===============================
// CHARGER PRODUITS
// ===============================


async function chargerProduits(){


    if(!utilisateurValide())
        return;



    if(chargementProduits)
        return;



    try{


        chargementProduits = true;


        produits = [];



        const q = query(

            collection(
                db,
                "produits"
            ),

            where(

                "userId",
                "==",
                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(q);



        snapshot.forEach((docSnap)=>{


            const data =
            docSnap.data();



            produits.push({

                id:
                docSnap.id,


                ...data,


                stockTotal:
                nombreValide(
                    data.stockTotal
                ),


                benefice:
                nombreValide(
                    data.benefice
                ),


                prixRevente:
                nombreValide(
                    data.prixRevente
                ),


                prixUnitaire:
                nombreValide(
                    data.prixUnitaire
                )


            });


        });



        afficherProduits();

        calculerStockRestant();

        mettreAJourResume();



    }


    catch(error){


        console.error(
            "Erreur chargement produits:",
            error
        );


    }


    finally{


        chargementProduits = false;


    }


}





// ===============================
// AJOUT PRODUIT
// ===============================


async function ajouterProduit(){


    if(!utilisateurValide()){


        alert(
            "Connectez-vous d'abord."
        );


        return;

    }



    try{


        const nom =

        nettoyerTexte(

            document.getElementById("nom")?.value

        );



        const prixGros =

        nombreValide(

            document.getElementById("prixGros")?.value

        );



        const cartons =

        nombreValide(

            document.getElementById("nombreCartons")?.value

        );



        const parCarton =

        nombreValide(

            document.getElementById("produitsParCarton")?.value

        );



        const prixRevente =

        nombreValide(

            document.getElementById("prixRevente")?.value

        );



        if(

            !nom ||

            prixGros <= 0 ||

            cartons <= 0 ||

            parCarton <= 0 ||

            prixRevente <= 0

        ){


            alert(
                "Informations invalides."
            );


            return;

        }



        const stockTotal =

        cartons *
        parCarton;



        const prixTotal =

        prixGros *
        cartons;



        const prixUnitaire =

        prixGros /
        parCarton;



        const benefice =

        (

            prixRevente *
            stockTotal

        )
        -
        prixTotal;




        const produit = {


            nom,

            prixGros,


            nombreCartons:
            cartons,


            produitsParCarton:
            parCarton,


            prixTotalStock:
            prixTotal,


            stockTotal,


            prixUnitaire,


            prixRevente,


            benefice


        };



        if(produitModification){


            await updateDoc(

                doc(

                    db,

                    "produits",

                    produitModification

                ),

                produit

            );


            await enregistrerHistorique(

                "modification",

                nom

            );


            produitModification = null;


        }

        else{


            await addDoc(

                collection(
                    db,
                    "produits"
                ),

                {


                    ...produit,


                    userId:
                    auth.currentUser.uid,


                    dateAjout:
                    serverTimestamp()


                }

            );



            await enregistrerHistorique(

                "ajout",

                nom

            );


        }



        viderChamps();


        await chargerProduits();



    }


    catch(error){


        console.error(
            "Erreur ajout produit:",
            error
        );


        alert(
            "Erreur pendant l'enregistrement."
        );


    }


}
// ===============================
// AFFICHAGE PRODUITS
// ===============================

function afficherProduits(){


    const tableau =
    document.getElementById(
        "tableauProduits"
    );


    if(!tableau)
        return;



    tableau.innerHTML = "";



    let beneficeTotal = 0;



    produits.forEach((produit)=>{


        beneficeTotal +=
        nombreValide(
            produit.benefice
        );



        const ligne =
        document.createElement("tr");



        ligne.innerHTML = `

        <td>${produit.nom || "Produit"}</td>

        <td>${produit.prixGros || 0} FCFA</td>

        <td>${produit.nombreCartons || 0}</td>

        <td>${produit.produitsParCarton || 0}</td>

        <td>${produit.stockTotal || 0}</td>

        <td>${Number(produit.prixUnitaire || 0).toFixed(2)} FCFA</td>

        <td>${produit.prixRevente || 0} FCFA</td>

        <td>${produit.benefice || 0} FCFA</td>


        <td>

        <button onclick="vendreProduit('${produit.id}')">
        Vendre
        </button>


        <button onclick="modifierProduit('${produit.id}')">
        Modifier
        </button>


        <button onclick="supprimerProduit('${produit.id}')">
        Supprimer
        </button>


        </td>

        `;



        tableau.appendChild(ligne);



    });



    const nb =
    document.getElementById(
        "nbProduits"
    );


    if(nb)

        nb.textContent =
        produits.length;




    const benefice =
    document.getElementById(
        "beneficeTotal"
    );


    if(benefice)

        benefice.textContent =
        beneficeTotal + " FCFA";



}





// ===============================
// RESUME COMPLET
// ===============================

function mettreAJourResume(){


    let stock = 0;

    let stockFaible = 0;



    produits.forEach((produit)=>{


        const valeur =
        nombreValide(
            produit.stockTotal
        );



        stock += valeur;



        if(valeur <= 10)

            stockFaible++;



    });



    const elements = {


        resumeProduits:
        produits.length,


        resumeStock:
        stock,


        stockFaible:
        stockFaible,


        stockRestant:
        stock


    };



    Object.keys(elements)

    .forEach((id)=>{


        const element =
        document.getElementById(id);



        if(element)

            element.textContent =
            elements[id];


    });



    calculerResumeVentes();



}





// ===============================
// RESUME VENTES
// ===============================

function calculerResumeVentes(){


    let ca = 0;

    let benefice = 0;

    let unites = 0;



    ventesGlobales.forEach((vente)=>{


        ca +=
        nombreValide(
            vente.montantTotal
        );


        benefice +=
        nombreValide(
            vente.benefice
        );


        unites +=
        nombreValide(
            vente.quantiteVendue
        );


    });




    const elements = {


        resumeVentes:
        unites,


        resumeCA:
        ca + " FCFA",


        resumeBenefice:
        benefice + " FCFA",


        chiffreAffaires:
        ca + " FCFA",


        beneficeVentes:
        benefice + " FCFA",


        unitesVendues:
        unites,


        nbTransactions:
        ventesGlobales.length



    };



    Object.keys(elements)

    .forEach((id)=>{


        const element =
        document.getElementById(id);



        if(element)

            element.textContent =
            elements[id];


    });



    afficherProduitVedette();



}





// ===============================
// PRODUIT VEDETTE
// ===============================

function afficherProduitVedette(){


    const compteur = {};



    ventesGlobales.forEach((vente)=>{


        const nom =
        vente.produit ||
        "Produit";



        compteur[nom] =

        (compteur[nom] || 0)

        +

        nombreValide(
            vente.quantiteVendue
        );


    });



    let meilleur =
    "Aucun";


    let maximum = 0;



    Object.keys(compteur)

    .forEach((nom)=>{


        if(compteur[nom] > maximum){


            maximum =
            compteur[nom];


            meilleur =
            nom;


        }


    });



    const element =
    document.getElementById(
        "produitVedette"
    );


    if(element)

        element.textContent =
        meilleur;



}





// ===============================
// STOCK RESTANT
// ===============================

function calculerStockRestant(){


    let total = 0;



    produits.forEach((produit)=>{


        total +=
        nombreValide(
            produit.stockTotal
        );


    });



    const element =
    document.getElementById(
        "stockRestant"
    );



    if(element)

        element.textContent =
        total;



}
// ===============================
// ENREGISTRER VENTE
// ===============================

async function enregistrerVente(
    produit,
    quantite,
    benefice
){

    if(!utilisateurValide())
        return false;


    try{


        await addDoc(

            collection(db,"ventes"),

            {

                userId:
                auth.currentUser.uid,


                produit:
                nettoyerTexte(
                    produit.nom
                )
                ||
                "Produit",


                quantiteVendue:
                nombreValide(
                    quantite
                ),


                prixVente:
                nombreValide(
                    produit.prixRevente
                ),


                montantTotal:

                nombreValide(
                    produit.prixRevente
                )
                *
                nombreValide(
                    quantite
                ),


                benefice:
                nombreValide(
                    benefice
                ),


                statut:
                "validée",


                date:
                serverTimestamp()


            }

        );


        return true;


    }

    catch(error){


        console.error(
            "Erreur enregistrement vente:",
            error
        );


        return false;


    }


}





// ===============================
// VENDRE PRODUIT
// ===============================

function vendreProduit(id){


    const produit =
    produits.find(
        produit =>
        produit.id === id
    );



    if(!produit){

        console.error(
            "Produit introuvable"
        );

        return;

    }



    produitVenteActuel =
    produit;



    const nom =
    document.getElementById(
        "nomProduitVente"
    );


    if(nom){

        nom.textContent =
        "Produit : "
        +
        produit.nom;

    }



    const champ =
    document.getElementById(
        "quantiteVente"
    );


    if(champ){

        champ.value="";

    }



    const modal =
    document.getElementById(
        "modalVente"
    );



    if(!modal){

        console.error(
            "Modal vente introuvable dans index.html"
        );

        return;

    }



    modal.style.display =
    "block";


}





// ===============================
// CONFIRMER VENTE
// ===============================

async function confirmerVente(){


    if(traitementVente)
        return;



    if(!produitVenteActuel){

        alert(
            "Aucun produit sélectionné"
        );

        return;

    }



    const champ =
    document.getElementById(
        "quantiteVente"
    );



    const quantite =
    nombreValide(
        champ?.value
    );



    if(quantite <= 0){

        alert(
            "Quantité invalide"
        );

        return;

    }



    const stock =
    nombreValide(
        produitVenteActuel.stockTotal
    );



    if(quantite > stock){

        alert(
            "Stock insuffisant"
        );

        return;

    }



    try{


        traitementVente=true;



        const nouveauStock =
        stock - quantite;



        const benefice =


        (

            nombreValide(
                produitVenteActuel.prixRevente
            )

            -

            nombreValide(
                produitVenteActuel.prixUnitaire
            )

        )

        *

        quantite;



        const resultat =

        await enregistrerVente(

            produitVenteActuel,

            quantite,

            benefice

        );



        if(!resultat)

            throw new Error(
                "Vente refusée"
            );





        await updateDoc(

            doc(

                db,

                "produits",

                produitVenteActuel.id

            ),

            {

                stockTotal:
                nouveauStock

            }

        );




        await enregistrerHistorique(

            "vente",

            produitVenteActuel.nom
            +
            " x "
            +
            quantite

        );




        fermerVente();


        await chargerProduits();

        await chargerVentes();


    }


    catch(error){


        console.error(
            "Erreur vente:",
            error
        );


        alert(
            "Erreur pendant la vente"
        );


    }


    finally{


        traitementVente=false;


    }


}





// ===============================
// FERMER MODAL VENTE
// ===============================

function fermerVente(){


    const modal =
    document.getElementById(
        "modalVente"
    );


    if(modal){

        modal.style.display =
        "none";

    }



    produitVenteActuel=null;



}// ===============================
// HISTORIQUE
// ===============================

async function chargerHistorique(){


    if(!utilisateurValide())
        return;



    try{


        const q = query(

            collection(
                db,
                "historique"
            ),

            where(

                "userId",
                "==",
                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(q);



        const historique=[];



        snapshot.forEach((docSnap)=>{


            historique.push({

                id:
                docSnap.id,


                ...docSnap.data()

            });


        });



        afficherHistorique(
            historique
        );


    }


    catch(error){


        console.error(
            "Erreur historique:",
            error
        );


    }


}





function afficherHistorique(historique){


    const tableau =
    document.getElementById(
        "tableauHistorique"
    );


    if(!tableau)
        return;



    tableau.innerHTML="";



    historique.forEach((action)=>{


        const ligne =
        document.createElement("tr");



        let date =
        "Date inconnue";



        if(
            action.date &&
            typeof action.date.toDate === "function"
        ){

            date =
            action.date
            .toDate()
            .toLocaleString();

        }



        ligne.innerHTML = `


        <td>${action.type || "Action"}</td>

        <td>${action.produit || "Produit"}</td>

        <td>${date}</td>


        `;



        tableau.appendChild(ligne);



    });


}





// ===============================
// VIDER HISTORIQUE
// ===============================

async function viderHistorique(){


    if(!utilisateurValide())
        return;



    if(
        !confirm(
            "Supprimer tout l'historique ?"
        )
    )
        return;



    try{


        const q=query(

            collection(
                db,
                "historique"
            ),

            where(

                "userId",
                "==",
                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(q);



        for(
            const element of snapshot.docs
        ){


            await deleteDoc(

                doc(
                    db,
                    "historique",
                    element.id
                )

            );


        }



        await chargerHistorique();


    }


    catch(error){


        console.error(
            "Erreur suppression historique:",
            error
        );


    }


}





// ===============================
// VIDER CHAMPS
// ===============================

function viderChamps(){


    const champs=[

        "nom",

        "prixGros",

        "nombreCartons",

        "produitsParCarton",

        "prixRevente"

    ];



    champs.forEach((id)=>{


        const element =
        document.getElementById(id);



        if(element)

            element.value="";


    });


}





// ===============================
// AUTHENTIFICATION
// ===============================

onAuthStateChanged(

    auth,

    async(user)=>{


        try{


            if(user){


                utilisateurConnecte=true;



                await chargerProduits();

                await chargerHistorique();

                await chargerVentes();



            }

            else{


                utilisateurConnecte=false;


                produits=[];

                ventesGlobales=[];


                afficherProduits();

                mettreAJourResume();



            }


        }


        catch(error){


            console.error(
                "Erreur authentification:",
                error
            );


        }


    }

);






// ===============================
// EXPORT DES FONCTIONS HTML
// ===============================

window.ajouterProduit =
ajouterProduit;


window.supprimerProduit =
supprimerProduit;


window.modifierProduit =
modifierProduit;


window.viderHistorique =
viderHistorique;


window.vendreProduit =
vendreProduit;


window.confirmerVente =
confirmerVente;


window.fermerVente = 
fermerVente;
