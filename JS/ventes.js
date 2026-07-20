// ===============================
// VENTES - VERSION RENFORCEE
// ===============================


import {
    db,
    auth
} from "../firebase.js";



import {

    collection,
    addDoc,
    getDocs,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    getDoc,
    runTransaction

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

    nombreValide,
    nettoyerTexte,
    utilisateurValide

} from "./utils.js";




// ===============================
// VARIABLES
// ===============================


let ventesGlobales = [];

let produitVenteActuel = null;

let traitementVente = false;





// ===============================
// GET VENTES
// ===============================


export function getVentes(){

    return ventesGlobales;

}






// ===============================
// VERIFICATION SECURITE
// ===============================


function verifierUtilisateur(utilisateurConnecte){


    return utilisateurValide(

        auth,

        utilisateurConnecte

    );


}





function nettoyerVente(vente){


    return {


        id:
        vente.id,


        produit:
        nettoyerTexte(
            vente.produit
        )
        ||
        "Produit",



        quantiteVendue:
        nombreValide(
            vente.quantiteVendue
        ),



        prixVente:
        nombreValide(
            vente.prixVente
        ),



        montantTotal:
        nombreValide(
            vente.montantTotal
        ),



        benefice:
        nombreValide(
            vente.benefice
        ),



        statut:
        vente.statut
        ||
        "validée",



        date:
        vente.date || null


    };


}






// ===============================
// CHARGER LES VENTES
// ===============================


export async function chargerVentes(

    utilisateurConnecte

){


    if(
        !verifierUtilisateur(
            utilisateurConnecte
        )
    )

        return [];



    try{


        const q = query(

            collection(

                db,

                "ventes"

            ),


            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const resultat =

        await getDocs(q);




        ventesGlobales = [];



        resultat.forEach((docSnap)=>{


            ventesGlobales.push(

                nettoyerVente({

                    id:
                    docSnap.id,

                    ...docSnap.data()

                })

            );


        });



        return ventesGlobales;



    }


    catch(error){


        console.error(

            "Erreur chargement ventes:",

            error

        );


        ventesGlobales = [];

        return [];


    }


}






// ===============================
// ENREGISTRER UNE VENTE
// ===============================


export async function enregistrerVente(

    utilisateurConnecte,

    produit,

    quantite,

    benefice

){


    if(

        !verifierUtilisateur(

            utilisateurConnecte

        )

    )

        return false;



    if(

        !produit

        ||

        typeof produit !== "object"

    )

        return false;




    try{


        const quantiteFinale =

        nombreValide(

            quantite

        );



        const prix =

        nombreValide(

            produit.prixRevente

        );



        if(

            quantiteFinale <= 0

            ||

            prix <= 0

        )

            return false;




        const vente = {


            userId:

            auth.currentUser.uid,



            produit:

            nettoyerTexte(

                produit.nom

            )

            ||

            "Produit",




            quantiteVendue:

            quantiteFinale,



            prixVente:

            prix,



            montantTotal:

            prix

            *

            quantiteFinale,



            benefice:

            Math.max(

                0,

                nombreValide(

                    benefice

                )

            ),



            statut:

            "validée",



            date:

            serverTimestamp()


        };



        await addDoc(

            collection(

                db,

                "ventes"

            ),

            vente

        );



        return true;



    }


    catch(error){


        console.error(

            "Erreur création vente:",

            error

        );


        return false;


    }


}
// ===============================
// OUVRIR FENETRE DE VENTE
// ===============================


export function vendreProduit(

    id,

    produits = []

){


    if(

        !Array.isArray(produits)

    )

        return false;



    const produit =

    produits.find(

        p => p.id === id

    );



    if(!produit)

        return false;



    produitVenteActuel = produit;



    const nomProduit =

    document.getElementById(

        "nomProduitVente"

    );



    if(nomProduit){


        nomProduit.textContent =

        "Produit : "

        +

        (

            produit.nom

            ||

            "Produit"

        );


    }





    const champQuantite =

    document.getElementById(

        "quantiteVente"

    );



    if(champQuantite){


        champQuantite.value = "";


    }





    const modal =

    document.getElementById(

        "modalVente"

    );



    if(modal){


        modal.style.display =

        "block";


    }



    return true;


}






// ===============================
// CONFIRMER UNE VENTE
// VERSION TRANSACTION FIRESTORE
// ===============================


export async function confirmerVente(

    utilisateurConnecte

){


    if(traitementVente)

        return false;



    if(

        !verifierUtilisateur(

            utilisateurConnecte

        )

    )

        return false;



    if(!produitVenteActuel){


        alert(

            "Aucun produit sélectionné"

        );


        return false;


    }



    try{


        traitementVente = true;



        const quantiteElement =

        document.getElementById(

            "quantiteVente"

        );



        const quantite =

        nombreValide(

            quantiteElement?.value

        );



        if(

            quantite <= 0

        ){


            alert(

                "Quantité invalide"

            );


            return false;


        }




        const produitId =

        produitVenteActuel.id;



        const referenceProduit =

        doc(

            db,

            "produits",

            produitId

        );




        let ventePreparee = null;



        await runTransaction(

            db,

            async(transaction)=>{



                const snapshot =

                await transaction.get(

                    referenceProduit

                );



                if(

                    !snapshot.exists()

                )

                throw new Error(

                    "Produit introuvable"

                );



                const produit =

                snapshot.data();





                if(

                    produit.userId

                    !==

                    auth.currentUser.uid

                )

                throw new Error(

                    "Accès refusé"

                );





                const stockActuel =

                nombreValide(

                    produit.stockTotal

                );





                if(

                    quantite > stockActuel

                )

                throw new Error(

                    "Stock insuffisant"

                );





                const nouveauStock =

                stockActuel

                -

                quantite;





                const prixRevente =

                nombreValide(

                    produit.prixRevente

                );





                const prixUnitaire =

                nombreValide(

                    produit.prixUnitaire

                );





                const benefice =


                Math.max(

                    0,

                    (

                        prixRevente

                        -

                        prixUnitaire

                    )

                    *

                    quantite

                );





                ventePreparee = {


                    userId:

                    auth.currentUser.uid,



                    produit:

                    nettoyerTexte(

                        produit.nom

                    )

                    ||

                    "Produit",



                    quantiteVendue:

                    quantite,



                    prixVente:

                    prixRevente,



                    montantTotal:

                    prixRevente

                    *

                    quantite,



                    benefice,



                    statut:

                    "validée",



                    date:

                    serverTimestamp()


                };





                transaction.update(

                    referenceProduit,

                    {


                        stockTotal:

                        nouveauStock,



                        derniereVente:

                        serverTimestamp()


                    }

                );



            }

        );





        if(!ventePreparee)

        throw new Error(

            "Vente impossible"

        );





        await addDoc(

            collection(

                db,

                "ventes"

            ),

            ventePreparee

        );





        fermerVente();



        return true;



    }


    catch(error){


        console.error(

            "Erreur confirmation vente:",

            error

        );



        alert(

            error.message

            ||

            "Erreur pendant la vente"

        );



        return false;



    }


    finally{


        traitementVente = false;


    }


}
// ===============================
// FERMER FENETRE DE VENTE
// ===============================


export function fermerVente(){


    const modal =

    document.getElementById(

        "modalVente"

    );



    if(modal){


        modal.style.display =

        "none";


    }




    const champQuantite =

    document.getElementById(

        "quantiteVente"

    );



    if(champQuantite){


        champQuantite.value = "";


    }




    const nomProduit =

    document.getElementById(

        "nomProduitVente"

    );



    if(nomProduit){


        nomProduit.textContent =

        "Produit sélectionné";


    }




    produitVenteActuel = null;



}







// ===============================
// NETTOYAGE SESSION
// ===============================


export function viderVentes(){


    ventesGlobales = [];


    produitVenteActuel = null;


    traitementVente = false;


}







// ===============================
// VERIFIER PRODUIT ACTUEL
// ===============================


export function getProduitVenteActuel(){


    return produitVenteActuel;


}







// ===============================
// FORMAT STATISTIQUE SIMPLE
// ===============================


export function calculerTotalVentes(){


    let total = 0;



    ventesGlobales.forEach((vente)=>{


        total +=

        nombreValide(

            vente.montantTotal

        );


    });



    return total;


}







// ===============================
// EXPORTS UTILITAIRES
// ===============================


export {

    ventesGlobales

};
