// ===============================
// VENTES
// ===============================


import {
    db,
    auth
} from "./firebase.js";



import {

    collection,
    addDoc,
    getDocs,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    getDoc

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
// CHARGER LES VENTES
// ===============================


export async function chargerVentes(

    utilisateurConnecte

){


    if(

        !utilisateurValide(

            auth,

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



        resultat.forEach((vente)=>{


            ventesGlobales.push({

                id:

                vente.id,


                ...vente.data()

            });


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

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;



    try{


        const quantiteFinale =

        nombreValide(

            quantite

        );



        if(

            quantiteFinale <= 0

        )

        return false;



        const prix =

        nombreValide(

            produit.prixRevente

        );



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

            prix *

            quantiteFinale,



            benefice:

            nombreValide(

                benefice

            ),



            statut:

            "validée",



            date:

            serverTimestamp()


        };



        const ajout =

        await addDoc(

            collection(

                db,

                "ventes"

            ),

            vente

        );



        ventesGlobales.push({

            id:

            ajout.id,


            ...vente


        });



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
// OUVRIR FENÊTRE DE VENTE
// ===============================


export function vendreProduit(

    id,

    produits

){


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

        produit.nom;


    }





    const champQuantite =

    document.getElementById(

        "quantiteVente"

    );



    if(champQuantite){


        champQuantite.value = "";

        champQuantite.focus();


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
// ===============================


export async function confirmerVente(

    utilisateurConnecte

){


    if(traitementVente)

    return false;



    if(

        !utilisateurValide(

            auth,

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



        const reference =

        doc(

            db,

            "produits",

            produitVenteActuel.id

        );



        const resultat =

        await getDoc(reference);



        if(

            !resultat.exists()

        )

        throw new Error(

            "Produit supprimé ou introuvable"

        );





        const produit =

        resultat.data();





        if(

            produit.userId

            !==

            auth.currentUser.uid

        )

        throw new Error(

            "Accès interdit"

        );





        const champ =

        document.getElementById(

            "quantiteVente"

        );



        const quantite =

        nombreValide(

            champ?.value

        );





        const stockActuel =

        nombreValide(

            produit.stockTotal

        );





        if(

            quantite <= 0

            ||

            quantite > stockActuel

        ){


            alert(

                "Stock insuffisant ou quantité invalide"

            );


            return false;


        }





        const nouveauStock =

        stockActuel

        -

        quantite;





        const beneficeUnitaire =

        nombreValide(

            produit.prixRevente

        )

        -

        nombreValide(

            produit.prixUnitaire

        );





        const beneficeTotal =

        beneficeUnitaire

        *

        quantite;





        const vente =

        await enregistrerVente(

            utilisateurConnecte,

            produit,

            quantite,

            beneficeTotal

        );





        if(!vente)


        throw new Error(

            "Impossible d'enregistrer la vente"

        );





        await updateDoc(

            reference,

            {


                stockTotal:

                nouveauStock,



                derniereVente:

                serverTimestamp()


            }

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

        );


        return false;


    }


    finally{


        traitementVente = false;


    }


            }
// ===============================
// FERMER FENÊTRE DE VENTE
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



    const champ =

    document.getElementById(

        "quantiteVente"

    );



    if(champ){


        champ.value = "";


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
