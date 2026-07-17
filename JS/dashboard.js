// ===============================
// DASHBOARD
// ===============================


import {
    nombreValide
} from "./utils.js";




// ===============================
// OUTIL AFFICHAGE SECURISE
// ===============================


function afficherValeur(id, valeur){

    const element = document.getElementById(id);

    if(element){

        element.textContent = valeur;

    }

}





// ===============================
// RESUME GENERAL
// ===============================


export function mettreAJourResume(
    produits = [],
    ventesGlobales = []
){


    let stockTotal = 0;

    let stockFaible = 0;



    if(!Array.isArray(produits))
        produits = [];



    produits.forEach((produit)=>{


        const stock =

        nombreValide(
            produit.stockTotal
        );



        stockTotal += stock;



        if(stock <= 10){

            stockFaible++;

        }


    });




    afficherValeur(

        "resumeProduits",

        produits.length

    );



    afficherValeur(

        "resumeStock",

        stockTotal

    );



    afficherValeur(

        "stockRestant",

        stockTotal

    );



    afficherValeur(

        "stockFaible",

        stockFaible

    );




    calculerResumeVentes(

        ventesGlobales

    );


}






// ===============================
// RESUME DES VENTES
// ===============================


export function calculerResumeVentes(

    ventesGlobales = []

){


    let chiffreAffaires = 0;

    let benefice = 0;

    let unites = 0;



    if(!Array.isArray(ventesGlobales))

        ventesGlobales = [];




    ventesGlobales.forEach((vente)=>{


        chiffreAffaires +=

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






    afficherValeur(

        "resumeVentes",

        unites

    );



    afficherValeur(

        "resumeCA",

        chiffreAffaires + " FCFA"

    );



    afficherValeur(

        "resumeBenefice",

        benefice + " FCFA"

    );



    afficherValeur(

        "chiffreAffaires",

        chiffreAffaires + " FCFA"

    );



    afficherValeur(

        "beneficeVentes",

        benefice + " FCFA"

    );



    afficherValeur(

        "unitesVendues",

        unites

    );



    afficherValeur(

        "nbTransactions",

        ventesGlobales.length

    );




    afficherProduitVedette(

        ventesGlobales

    );


}







// ===============================
// PRODUIT VEDETTE
// ===============================


export function afficherProduitVedette(

    ventesGlobales = []

){


    const compteur = {};



    if(!Array.isArray(ventesGlobales))

        ventesGlobales = [];





    ventesGlobales.forEach((vente)=>{


        const nom =

        vente.produit ||

        "Produit";



        const quantite =

        nombreValide(

            vente.quantiteVendue

        );



        compteur[nom] =

        (compteur[nom] || 0)

        +

        quantite;


    });





    let meilleur = "Aucun";

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





    afficherValeur(

        "produitVedette",

        meilleur

    );


}







// ===============================
// CALCUL STOCK RESTANT
// ===============================


export function calculerStockRestant(

    produits = []

){


    let total = 0;



    if(!Array.isArray(produits))

        produits = [];





    produits.forEach((produit)=>{


        total +=

        nombreValide(

            produit.stockTotal

        );


    });





    afficherValeur(

        "stockRestant",

        total

    );



    return total;


}







// ===============================
// EXPORT GLOBAL OPTIONNEL
// ===============================


export function actualiserDashboard(

    produits = [],

    ventes = []

){


    mettreAJourResume(

        produits,

        ventes

    );


}
