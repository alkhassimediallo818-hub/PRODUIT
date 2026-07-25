// ===============================
// RECHERCHE PRODUITS
// ===============================


import {

    nombreValide

} from "./validation.js";



// ===============================
// RECHERCHE PAR NOM
// ===============================

export function rechercherProduit(

    produits = [],

    recherche = ""

){

    recherche =

    recherche

    .toLowerCase()

    .trim();



    if(!recherche)

        return produits;



    return produits.filter(

        (produit)=>{


            const nom =

            (

                produit.nom

                ||

                ""

            )

            .toLowerCase();



            return nom.includes(

                recherche

            );


        }

    );

}



// ===============================
// FILTRE STOCK DISPONIBLE
// ===============================

export function filtrerDisponible(

    produits = []

){

    return produits.filter(

        (produit)=>{


            return nombreValide(

                produit.stockTotal

            ) > 0;


        }

    );

}



// ===============================
// FILTRE STOCK FAIBLE
// ===============================

export function filtrerStockFaible(

    produits = [],

    limite = 10

){

    return produits.filter(

        (produit)=>{


            return nombreValide(

                produit.stockTotal

            )

            <=

            limite;


        }

    );

}



// ===============================
// FILTRE RUPTURE
// ===============================

export function filtrerRupture(

    produits = []

){

    return produits.filter(

        (produit)=>{


            return nombreValide(

                produit.stockTotal

            )

            <=

            0;


        }

    );

}



// ===============================
// TRI NOM
// ===============================

export function trierParNom(

    produits = []

){

    return [...produits].sort(

        (a,b)=>{


            return (

                a.nom || ""

            )

            .localeCompare(

                b.nom || ""

            );


        }

    );

}



// ===============================
// TRI PRIX
// ===============================

export function trierParPrix(

    produits = [],

    ordre = "asc"

){

    return [...produits].sort(

        (a,b)=>{


            const resultat =

            nombreValide(

                a.prixRevente

            )

            -

            nombreValide(

                b.prixRevente

            );



            return ordre === "desc"

            ?

            -resultat

            :

            resultat;


        }

    );

}



// ===============================
// TRI STOCK
// ===============================

export function trierParStock(

    produits = [],

    ordre = "desc"

){

    return [...produits].sort(

        (a,b)=>{


            const resultat =

            nombreValide(

                a.stockTotal

            )

            -

            nombreValide(

                b.stockTotal

            );



            return ordre === "desc"

            ?

            -resultat

            :

            resultat;


        }

    );

}
