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
