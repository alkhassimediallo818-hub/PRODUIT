// ===============================
// DASHBOARD
// ===============================


import {
    nombreValide
} from "./utils.js";



export function mettreAJourResume(produits, ventesGlobales){


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



    const valeurs = {


        resumeProduits:
        produits.length,


        resumeStock:
        stock,


        stockFaible:
        stockFaible


    };



    Object.keys(valeurs)
    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

            element.textContent =
            valeurs[id];


    });



    calculerResumeVentes(
        ventesGlobales
    );


}
// ===============================
// RESUME VENTES
// ===============================

export function calculerResumeVentes(ventesGlobales){


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



    afficherProduitVedette(
        ventesGlobales
    );


}
