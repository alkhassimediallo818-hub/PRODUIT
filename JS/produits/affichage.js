// ===============================
// AFFICHAGE PRODUITS
// ===============================

import {

    nombreValide

} from "./validation.js";



// ===============================
// STATUT STOCK
// ===============================

export function obtenirStatutStock(

    stock

){

    stock =

    nombreValide(stock);


    if(stock <= 0){

        return "🔴 Rupture";

    }


    if(stock <= 5){

        return "🟠 Critique";

    }


    if(stock <= 10){

        return "🟡 Faible";

    }


    return "🟢 Disponible";

}



// ===============================
// LIGNE PRODUIT
// ===============================

export function creerLigneProduit(

    produit

){

    const ligne =

    document.createElement(

        "tr"

    );


    ligne.innerHTML = `

        <td>

            ${produit.nom || "Produit"}

        </td>

        <td>

            ${nombreValide(produit.prixGros)} FCFA

        </td>

        <td>

            ${obtenirStatutStock(

                produit.stockTotal

            )}

        </td>

        <td>

            ${nombreValide(

                produit.nombreCartons

            )}

        </td>

        <td>

            ${nombreValide(

                produit.produitsParCarton

            )}

        </td>

        <td>

            ${nombreValide(

                produit.stockTotal

            )}

        </td>

        <td>

            ${nombreValide(

                produit.prixUnitaire

            )} FCFA

        </td>

        <td>

            ${nombreValide(

                produit.prixRevente

            )} FCFA

        </td>

        <td>

            ${nombreValide(

                produit.benefice

            )} FCFA

        </td>

   <td>

    <button

    onclick="modifierProduit('${produit.id}')"

    >

    Modifier

    </button>


    <button

    onclick="supprimerProduit('${produit.id}')"

    >

    Supprimer

    </button>

</td>

    `;


    if(

        nombreValide(

            produit.stockTotal

        ) <= 10

    ){

        ligne.classList.add(

            "stock-faible"

        );

    }


    return ligne;

}



// ===============================
// TABLEAU
// ===============================

export function afficherProduits(

    produits = []

){

    const tableau =

    document.getElementById(

        "tableauProduits"

    );


    if(

        !tableau

    )

    return;


    tableau.innerHTML = "";


    produits.forEach(

        (produit)=>{

            tableau.appendChild(

                creerLigneProduit(

                    produit

                )

            );

        }

    );

}



// ===============================
// NOMBRE PRODUITS
// ===============================

export function afficherNombreProduits(

    produits = []

){

    const element =

    document.getElementById(

        "nombreProduits"

    );


    if(

        element

    ){

        element.textContent =

        produits.length;

    }

}



// ===============================
// STOCK TOTAL
// ===============================

export function afficherStockTotal(

    produits = []

){

    const element =

    document.getElementById(

        "stockTotal"

    );


    if(

        !element

    )

    return;


    let total = 0;


    produits.forEach(

        (produit)=>{

            total +=

            nombreValide(

                produit.stockTotal

            );

        }

    );


    element.textContent =

    total;

}



// ===============================
// RAFRAICHIR
// ===============================

export function rafraichirAffichage(

    produits = []

){

    afficherProduits(

        produits

    );

    afficherNombreProduits(

        produits

    );

    afficherStockTotal(

        produits

    );

}
