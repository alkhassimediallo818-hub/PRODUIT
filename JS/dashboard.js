// ===============================
// DASHBOARD RENFORCE
// ===============================


import {
    nombreValide
} from "./utils.js";




// ===============================
// VARIABLE GRAPHIQUE
// ===============================


let graphiqueActuel = null;




// ===============================
// AFFICHAGE SECURISE
// ===============================


function afficherValeur(
    id,
    valeur
){

    const element =
    document.getElementById(id);


    if(!element)

        return;


    if(
        valeur === undefined ||
        valeur === null ||
        Number.isNaN(valeur)
    ){

        element.textContent = "0";

        return;

    }


    element.textContent = valeur;


}




// ===============================
// FORMAT FCFA
// ===============================


function formatFCFA(
    nombre
){

    return (

        nombreValide(nombre)

        .toLocaleString(
            "fr-FR"
        )

        +

        " FCFA"

    );

}





// ===============================
// VERIFICATION TABLEAUX
// ===============================


function tableauValide(
    tableau
){

    return Array.isArray(tableau)
        ? tableau
        : [];

}




// ===============================
// RESUME PRINCIPAL
// ===============================


export function mettreAJourResume(

    produits = [],

    ventesGlobales = []

){


    produits =
    tableauValide(produits);



    ventesGlobales =
    tableauValide(ventesGlobales);



    let stockTotal = 0;

    let stockFaible = 0;

    let beneficeStock = 0;




    produits.forEach(

        (produit)=>{


            const stock =

            nombreValide(

                produit.stockTotal

            );



            stockTotal += stock;



            if(
                stock <= 10
                &&
                stock > 0
            ){

                stockFaible++;

            }



            beneficeStock +=

            nombreValide(

                produit.benefice

            );


        }

    );





    afficherValeur(

        "nbProduits",

        produits.length

    );




    afficherValeur(

        "stockRestant",

        stockTotal

    );




    afficherValeur(

        "stockFaible",

        stockFaible

    );




    afficherValeur(

        "beneficeTotal",

        formatFCFA(
            beneficeStock
        )

    );





    afficherValeur(

        "resumeProduits",

        produits.length

    );




    afficherValeur(

        "resumeStock",

        stockTotal

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


    ventesGlobales =
    tableauValide(ventesGlobales);



    let chiffreAffaires = 0;

    let beneficeReel = 0;

    let unitesVendues = 0;

    let ventesJour = 0;

    let ventesMois = 0;



    const maintenant = new Date();




    ventesGlobales.forEach(

        (vente)=>{


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

            beneficeReel += gain;

            unitesVendues += quantite;





            if(

                vente.date

                &&

                typeof vente.date.toDate === "function"

            ){


                const dateVente =

                vente.date.toDate();




                const memeJour =

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

                maintenant.getFullYear();





                const memeMois =

                dateVente.getMonth()

                ===

                maintenant.getMonth()

                &&

                dateVente.getFullYear()

                ===

                maintenant.getFullYear();





                if(memeJour){

                    ventesJour += montant;

                }



                if(memeMois){

                    ventesMois += montant;

                }



            }


        }

    );





    afficherValeur(

        "chiffreAffaires",

        formatFCFA(
            chiffreAffaires
        )

    );




    afficherValeur(

        "beneficeVentes",

        formatFCFA(
            beneficeReel
        )

    );




    afficherValeur(

        "ventesJour",

        formatFCFA(
            ventesJour
        )

    );




    afficherValeur(

        "ventesMois",

        formatFCFA(
            ventesMois
        )

    );




    afficherValeur(

        "unitesVendues",

        unitesVendues

    );




    afficherValeur(

        "nbTransactions",

        ventesGlobales.length

    );





    afficherValeur(

        "resumeVentes",

        unitesVendues

    );




    afficherValeur(

        "resumeCA",

        formatFCFA(
            chiffreAffaires
        )

    );




    afficherValeur(

        "resumeBenefice",

        formatFCFA(
            beneficeReel
        )

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


    ventesGlobales =
    tableauValide(ventesGlobales);



    const compteur = {};




    ventesGlobales.forEach(

        (vente)=>{


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



        }

    );




    let meilleurProduit =
    "Aucun";



    let maximum = 0;




    Object.keys(compteur)

    .forEach(

        (nom)=>{


            if(

                compteur[nom]

                >

                maximum

            ){


                maximum =

                compteur[nom];



                meilleurProduit =

                nom;


            }


        }

    );




    afficherValeur(

        "produitVedette",

        meilleurProduit

    );


}
// ===============================
// CALCUL STOCK RESTANT
// ===============================


export function calculerStockRestant(

    produits = []

){


    produits =
    tableauValide(produits);



    let total = 0;



    produits.forEach(

        (produit)=>{


            total +=

            nombreValide(

                produit.stockTotal

            );


        }

    );




    afficherValeur(

        "stockRestant",

        total

    );


    return total;


}





// ===============================
// NETTOYAGE DASHBOARD
// ===============================


export function viderDashboard(){


    const valeurs = {


        nbProduits:0,


        beneficeTotal:"0 FCFA",


        chiffreAffaires:"0 FCFA",


        beneficeVentes:"0 FCFA",


        stockRestant:0,


        ventesJour:"0 FCFA",


        ventesMois:"0 FCFA",


        produitVedette:"Aucun",


        unitesVendues:0,


        nbTransactions:0,


        stockFaible:0,


        resumeProduits:0,


        resumeStock:0,


        resumeVentes:0,


        resumeCA:"0 FCFA",


        resumeBenefice:"0 FCFA"



    };





    Object.entries(valeurs)

    .forEach(

        ([id,valeur])=>{


            afficherValeur(

                id,

                valeur

            );


        }

    );



    detruireGraphique();


}






// ===============================
// DETRUIRE GRAPHIQUE EXISTANT
// ===============================


function detruireGraphique(){


    if(graphiqueActuel){


        try{


            graphiqueActuel.destroy();


        }


        catch(error){


            console.warn(

                "Erreur destruction graphique:",

                error

            );


        }


        graphiqueActuel = null;


    }


}






// ===============================
// GRAPHIQUE VENTES SECURISE
// ===============================


export function preparerGraphique(

    ventesGlobales = []

){


    ventesGlobales =
    tableauValide(ventesGlobales);



    const canvas =

    document.getElementById(

        "graphiqueVentes"

    );



    if(

        !canvas

        ||

        typeof Chart === "undefined"

    ){

        console.warn(

            "Graphique indisponible"

        );

        return;


    }





    detruireGraphique();




    const donnees = {};





    ventesGlobales.forEach(

        (vente)=>{


            let date =

            "Inconnu";



            if(

                vente.date

                &&

                typeof vente.date.toDate === "function"

            ){


                date =

                vente.date

                .toDate()

                .toLocaleDateString(

                    "fr-FR"

                );


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



        }

    );





    graphiqueActuel =

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


                responsive:true,



                maintainAspectRatio:false



            }


        }


    );


}
