// ===============================
// GESTION STOCK PRODUITS
// ===============================


import {

    nombreValide

} from "./validation.js";



// ===============================
// STOCK DISPONIBLE
// ===============================

export function stockDisponible(

    produit

){

    return nombreValide(

        produit.stockTotal

    );

}



// ===============================
// VERIFIER STOCK
// ===============================

export function verifierStock(

    produit,

    quantite

){


    const stock =

    stockDisponible(

        produit

    );


    return (

        nombreValide(

            quantite

        )

        <=

        stock

    );

}



// ===============================
// STOCK APRES SORTIE
// ===============================

export function retirerStock(

    stock,

    quantite

){

    const nouveauStock =

    nombreValide(stock)

    -

    nombreValide(quantite);



    return nouveauStock < 0

    ?

    0

    :

    nouveauStock;

}



// ===============================
// AJOUT STOCK
// ===============================

export function ajouterStock(

    stock,

    quantite

){

    return (

        nombreValide(stock)

        +

        nombreValide(quantite)

    );

}



// ===============================
// STOCK FAIBLE
// ===============================

export function estStockFaible(

    stock,

    limite = 10

){

    return (

        nombreValide(stock)

        <=

        limite

    );

}



// ===============================
// PRODUITS STOCK FAIBLE
// ===============================

export function obtenirProduitsFaibles(

    produits = [],

    limite = 10

){

    return produits.filter(

        (produit)=>{


            return estStockFaible(

                produit.stockTotal,

                limite

            );


        }

    );

}



// ===============================
// STATISTIQUE STOCK
// ===============================

export function calculerStatistiqueStock(

    produits = []

){


    let total = 0;

    let faibles = 0;



    produits.forEach(

        (produit)=>{


            const stock =

            nombreValide(

                produit.stockTotal

            );


            total += stock;



            if(

                estStockFaible(stock)

            ){

                faibles++;

            }


        }

    );



    return {

        stockTotal: total,

        produitsFaibles: faibles

    };

}
