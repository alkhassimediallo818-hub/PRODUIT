// ===============================
// VALIDATION PRODUITS
// ===============================

import {

    auth

} from "../../firebase.js";



// ===============================
// NOMBRE VALIDE
// ===============================

export function nombreValide(

    valeur,

    defaut = 0

){

    const nombre =

    Number(valeur);

    return Number.isFinite(nombre)

        ? nombre

        : defaut;

}



// ===============================
// TEXTE PROPRE
// ===============================

export function nettoyerTexte(

    texte = ""

){

    return String(texte)

    .trim()

    .replace(/\s+/g," ");

}



// ===============================
// UTILISATEUR VALIDE
// ===============================

export function utilisateurValide(

    utilisateurConnecte

){

    return (

        utilisateurConnecte === true

        &&

        auth.currentUser

    );

}



// ===============================
// NOM PRODUIT
// ===============================

export function nomProduitValide(

    nom

){

    return nettoyerTexte(

        nom

    ).length >= 2;

}



// ===============================
// PRIX VALIDE
// ===============================

export function prixValide(

    prix

){

    return nombreValide(

        prix

    ) > 0;

}



// ===============================
// QUANTITE VALIDE
// ===============================

export function quantiteValide(

    quantite

){

    return nombreValide(

        quantite

    ) > 0;

}



// ===============================
// FORMULAIRE PRODUIT
// ===============================

export function verifierProduit(

    produit

){

    if(

        !nomProduitValide(

            produit.nom

        )

    ){

        return {

            valide:false,

            message:"Nom invalide"

        };

    }



    if(

        !prixValide(

            produit.prixGros

        )

    ){

        return {

            valide:false,

            message:"Prix d'achat invalide"

        };

    }



    if(

        !prixValide(

            produit.prixRevente

        )

    ){

        return {

            valide:false,

            message:"Prix de vente invalide"

        };

    }



    if(

        !quantiteValide(

            produit.nombreCartons

        )

    ){

        return {

            valide:false,

            message:"Nombre de cartons invalide"

        };

    }



    if(

        !quantiteValide(

            produit.produitsParCarton

        )

    ){

        return {

            valide:false,

            message:"Produits par carton invalide"

        };

    }



    return {

        valide:true,

        message:"OK"

    };

}
