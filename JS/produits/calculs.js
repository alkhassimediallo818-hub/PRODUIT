// ===============================
// CALCULS PRODUITS
// ===============================

import {

    nombreValide

} from "./validation.js";



// ===============================
// STOCK TOTAL
// ===============================

export function calculerStockTotal(

    nombreCartons,

    produitsParCarton

){

    return (

        nombreValide(nombreCartons)

        *

        nombreValide(produitsParCarton)

    );

}



// ===============================
// PRIX UNITAIRE
// ===============================

export function calculerPrixUnitaire(

    prixGros,

    stockTotal

){

    prixGros =

    nombreValide(prixGros);

    stockTotal =

    nombreValide(stockTotal);


    if(stockTotal <= 0)

        return 0;


    return prixGros / stockTotal;

}



// ===============================
// BENEFICE UNITAIRE
// ===============================

export function calculerBeneficeUnitaire(

    prixRevente,

    prixUnitaire

){

    return (

        nombreValide(prixRevente)

        -

        nombreValide(prixUnitaire)

    );

}



// ===============================
// BENEFICE TOTAL
// ===============================

export function calculerBeneficeTotal(

    prixRevente,

    prixUnitaire,

    stockTotal

){

    return (

        calculerBeneficeUnitaire(

            prixRevente,

            prixUnitaire

        )

        *

        nombreValide(stockTotal)

    );

}



// ===============================
// VALEUR STOCK
// ===============================

export function calculerValeurStock(

    prixUnitaire,

    stockTotal

){

    return (

        nombreValide(prixUnitaire)

        *

        nombreValide(stockTotal)

    );

}



// ===============================
// MONTANT VENTE
// ===============================

export function calculerMontantVente(

    prixRevente,

    quantite

){

    return (

        nombreValide(prixRevente)

        *

        nombreValide(quantite)

    );

}



// ===============================
// BENEFICE VENTE
// ===============================

export function calculerBeneficeVente(

    prixRevente,

    prixUnitaire,

    quantite

){

    return (

        calculerBeneficeUnitaire(

            prixRevente,

            prixUnitaire

        )

        *

        nombreValide(quantite)

    );

}



// ===============================
// STOCK APRES VENTE
// ===============================

export function calculerStockRestant(

    stock,

    quantite

){

    return (

        nombreValide(stock)

        -

        nombreValide(quantite)

    );

}
