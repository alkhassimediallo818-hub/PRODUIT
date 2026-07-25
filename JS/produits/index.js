// ===============================
// INDEX PRODUITS
// ===============================


// ===============================
// CRUD
// ===============================

export {

    chargerProduits,

    ajouterProduit,

    modifierProduit,

    supprimerProduit,

    getProduits

}

from "./crud.js";




// ===============================
// AFFICHAGE
// ===============================

export {

    afficherProduits,

    creerLigneProduit,

    obtenirStatutStock,

    rafraichirAffichage

}

from "./affichage.js";




// ===============================
// CALCULS
// ===============================

export {

    calculerStockTotal,

    calculerPrixUnitaire,

    calculerBeneficeUnitaire,

    calculerBeneficeTotal,

    calculerValeurStock,

    calculerMontantVente,

    calculerBeneficeVente,

    calculerStockRestant

}

from "./calculs.js";




// ===============================
// VALIDATION
// ===============================

export {

    nombreValide,

    nettoyerTexte,

    utilisateurValide,

    verifierProduit,

    nomProduitValide,

    prixValide,

    quantiteValide

}

from "./validation.js";




// ===============================
// STOCK
// ===============================

export {

    stockDisponible,

    verifierStock,

    retirerStock,

    ajouterStock,

    estStockFaible,

    obtenirProduitsFaibles,

    calculerStatistiqueStock

}

from "./stock.js";




// ===============================
// RECHERCHE
// ===============================

export {

    rechercherProduit,

    filtrerDisponible,

    filtrerStockFaible,

    filtrerRupture,

    trierParNom,

    trierParPrix,

    trierParStock

}

from "./recherche.js";



console.log(

    "Module produits chargé"

);
