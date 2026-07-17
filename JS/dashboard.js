// ===============================
// DASHBOARD
// ===============================


import {
    nombreValide
} from "./utils.js";




// ===============================
// OUTILS AFFICHAGE
// ===============================


function afficherValeur(id, valeur){

    const element =
    document.getElementById(id);


    if(element){

        element.textContent = valeur;

    }

}





function formatFCFA(nombre){

    return (
        nombreValide(nombre)
        .toLocaleString("fr-FR")
        +
        " FCFA"
    );

}





// ===============================
// RESUME COMPLET
// ===============================


export function mettreAJourResume(

    produits = [],

    ventesGlobales = []

){


    let stock = 0;

    let stockFaible = 0;

    let beneficeStock = 0;



    produits.forEach((produit)=>{


        const stockProduit =

        nombreValide(

            produit.stockTotal

        );



        stock += stockProduit;



        if(stockProduit <= 10)

            stockFaible++;



        beneficeStock +=

        nombreValide(

            produit.benefice

        );


    });





    afficherValeur(

        "nbProduits",

        produits.length

    );



    afficherValeur(

        "beneficeTotal",

        formatFCFA(
            beneficeStock
        )

    );



    afficherValeur(

        "stockRestant",

        stock

    );



    afficherValeur(

        "stockFaible",

        stockFaible

    );





    afficherValeur(

        "resumeProduits",

        produits.length

    );



    afficherValeur(

        "resumeStock",

        stock

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



    let ventesJour = 0;

    let ventesMois = 0;



    const maintenant = new Date();



    ventesGlobales.forEach((vente)=>{


        const montant =

        nombreValide(

            vente.montantTotal

        );



        const gain =

        nombreValide(

            vente.benefice

        );



        const quantite =

        nombreValide(

            vente.quantiteVendue

        );



        chiffreAffaires += montant;

        benefice += gain;

        unites += quantite;




        if(

            vente.date &&

            typeof vente.date.toDate === "function"

        ){


            const dateVente =

            vente.date.toDate();



            if(

                dateVente.getDate()

                ===

                maintenant.getDate()

                &&

                dateVente.getMonth()

                ===

                maintenant.getMonth()

                &&

                dateVente.getFullYear()

                ===

                maintenant.getFullYear()

            ){

                ventesJour += montant;

            }





            if(

                dateVente.getMonth()

                ===

                maintenant.getMonth()

                &&

                dateVente.getFullYear()

                ===

                maintenant.getFullYear()

            ){

                ventesMois += montant;

            }


        }


    });





    afficherValeur(

        "chiffreAffaires",

        formatFCFA(chiffreAffaires)

    );



    afficherValeur(

        "beneficeVentes",

        formatFCFA(benefice)

    );



    afficherValeur(

        "ventesJour",

        formatFCFA(ventesJour)

    );



    afficherValeur(

        "ventesMois",

        formatFCFA(ventesMois)

    );



    afficherValeur(

        "unitesVendues",

        unites

    );



    afficherValeur(

        "nbTransactions",

        ventesGlobales.length

    );





    afficherValeur(

        "resumeVentes",

        unites

    );



    afficherValeur(

        "resumeCA",

        formatFCFA(chiffreAffaires)

    );



    afficherValeur(

        "resumeBenefice",

        formatFCFA(benefice)

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



    ventesGlobales.forEach((vente)=>{


        const nom =

        vente.produit

        ||

        "Produit";



        compteur[nom] =

        (

            compteur[nom]

            ||

            0

        )

        +

        nombreValide(

            vente.quantiteVendue

        );


    });





    let meilleur = "Aucun";

    let maximum = 0;



    Object.keys(compteur)

    .forEach((nom)=>{


        if(

            compteur[nom]

            >

            maximum

        ){


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
// CALCUL STOCK SIMPLE
// ===============================


export function calculerStockRestant(

    produits = []

){


    let total = 0;



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


}





// ===============================
// NETTOYAGE DASHBOARD
// ===============================


export function viderDashboard(){


    const valeurs = {


        "nbProduits":0,

        "beneficeTotal":"0 FCFA",

        "chiffreAffaires":"0 FCFA",

        "beneficeVentes":"0 FCFA",

        "stockRestant":0,

        "ventesJour":"0 FCFA",

        "ventesMois":"0 FCFA",

        "produitVedette":"Aucun",

        "unitesVendues":0,

        "nbTransactions":0,

        "stockFaible":0,

        "resumeProduits":0,

        "resumeStock":0,

        "resumeVentes":0,

        "resumeCA":"0 FCFA",

        "resumeBenefice":"0 FCFA"


    };





    Object.keys(valeurs)

    .forEach((id)=>{


        afficherValeur(

            id,

            valeurs[id]

        );


    });


}





// ===============================
// GRAPHIQUE VENTES
// ===============================


export function preparerGraphique(

    ventesGlobales = []

){


    const canvas =

    document.getElementById(

        "graphiqueVentes"

    );



    if(

        !canvas

        ||

        typeof Chart === "undefined"

    )

        return;



    const donnees = {};



    ventesGlobales.forEach((vente)=>{


        let date = "Inconnu";



        if(

            vente.date

            &&

            typeof vente.date.toDate === "function"

        ){


            date =

            vente.date

            .toDate()

            .toLocaleDateString();


        }



        donnees[date] =

        (

            donnees[date]

            ||

            0

        )

        +

        nombreValide(

            vente.montantTotal

        );


    });





    new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:

                Object.keys(donnees),



                datasets:[{


                    label:

                    "Ventes",



                    data:

                    Object.values(donnees)


                }]


            },


            options:{


                responsive:true


            }


        }

    );


}
