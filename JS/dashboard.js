// ===============================
// DASHBOARD RENFORCE
// ===============================


import {

    nombreValide,
    animerCompteur

} from "./utils.js";




// ===============================
// VARIABLE GRAPHIQUE
// ===============================


let graphiqueActuel = null;

let periodeGraphique = "tout";



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


function calculerProduitVedette(
    ventesGlobales = []
){

    const statistiques = {};



    ventesGlobales.forEach((vente)=>{

        const nom =

        vente.nomProduit
        ||
        vente.produit
        ||
        "Inconnu";



        const quantite =

        nombreValide(
            vente.quantite
        );



        statistiques[nom] =

        (statistiques[nom] || 0)
        +
        quantite;

    });



    let meilleurProduit =
    "Aucun";


    let meilleurScore =
    0;



    Object.entries(
        statistiques
    ).forEach(

        ([nom, total])=>{

            if(
                total >
                meilleurScore
            ){

                meilleurScore =
                total;

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





  animerCompteur(

    "nbProduits",

    produits.length

);




   animerCompteur(

    "stockRestant",

    stockTotal

);




   animerCompteur(

    "stockFaible",

    stockFaible

);



    afficherValeur(

        "beneficeTotal",

        formatFCFA(
            beneficeStock
        )

    );





 animerCompteur(

    "resumeProduits",

    produits.length

);




   animerCompteur(

    "resumeStock",

    stockTotal

);


calculerProduitVedette(
    ventesGlobales
);


  calculerTopProduits(
    ventesGlobales
);

    
    calculerResumeVentes(

        ventesGlobales

    );


}

function calculerTopProduits(

    ventesGlobales = []

){

    const classement = {};



    ventesGlobales.forEach(

        (vente)=>{

            const nom =

            vente.nomProduit
            ||
            vente.produit
            ||
            "Inconnu";



            const quantite =

            nombreValide(
                vente.quantite
            );



            classement[nom] =

            (classement[nom] || 0)
            +
            quantite;

        }

    );



    const top =

    Object.entries(
        classement
    )

    .sort(
        (a,b)=>

        b[1]-a[1]
    )

    .slice(0,5);



    const zone =

    document.getElementById(
        "topProduits"
    );



    if(!zone)
        return;



    if(top.length === 0){

        zone.innerHTML =
        "Aucune vente";

        return;

    }



    zone.innerHTML =

    top.map(

        ([nom,total],index)=>`

        <p>

        ${index+1}.
        ${nom}

        (${total})

        </p>

        `

    ).join("");

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


export function changerPeriodeGraphique(
    periode
){

    periodeGraphique = periode;

}



// ===============================
// GRAPHIQUE VENTES SECURISE
// ===============================


export function preparerGraphique(

    ventesGlobales = []

){

    ventesGlobales =
    tableauValide(ventesGlobales);

const maintenant = new Date();


if(periodeGraphique !== "tout"){


    ventesGlobales =

    ventesGlobales.filter(

        (vente)=>{


            if(
                !vente.date
                ||
                typeof vente.date.toDate !== "function"
            ){

                return false;

            }


            const dateVente =
            vente.date.toDate();



            if(periodeGraphique === "jour"){


                return (

                    dateVente.toDateString()

                    ===

                    maintenant.toDateString()

                );


            }




            if(periodeGraphique === "7jours"){


                const limite =
                new Date();


                limite.setDate(
                    maintenant.getDate() - 7
                );


                return dateVente >= limite;


            }





            if(periodeGraphique === "mois"){


                return (

                    dateVente.getMonth()

                    ===

                    maintenant.getMonth()

                    &&

                    dateVente.getFullYear()

                    ===

                    maintenant.getFullYear()

                );


            }



            return true;


        }

    );


}

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




    const statistiques = {};



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



            if(!statistiques[date]){


                statistiques[date] = {

                    chiffreAffaires:0,

                    benefice:0

                };


            }




            statistiques[date].chiffreAffaires +=

            nombreValide(

                vente.montantTotal

            );



            statistiques[date].benefice +=

            nombreValide(

                vente.benefice

            );



        }

    );






    const labels =

    Object.keys(statistiques)

    .sort(

        (a,b)=>{

            return new Date(a)

            -

            new Date(b);

        }

    );






    const chiffreAffaires =

    labels.map(

        (date)=>

        statistiques[date]
        .chiffreAffaires

    );






    const benefices =

    labels.map(

        (date)=>

        statistiques[date]
        .benefice

    );







    graphiqueActuel =

    new Chart(

        canvas,

        {


            type:"line",



            data:{


                labels:labels,



                datasets:[



                {

                    label:

                    "Chiffre d'affaires",



                    data:

                    chiffreAffaires,



                    tension:

                    0.4,



                    fill:true,



                    pointRadius:5


                },




                {


                    label:

                    "Bénéfices",



                    data:

                    benefices,



                    tension:

                    0.4,



                    fill:true,



                    pointRadius:5


                }



                ]



            },





            options:{



                responsive:true,



                maintainAspectRatio:false,



                plugins:{


                    legend:{


                        display:true


                    }


                },



                scales:{



                    y:{


                        beginAtZero:true



                    }



                }



            }



        }


    );


}


