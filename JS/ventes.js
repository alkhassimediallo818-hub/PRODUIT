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
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    nombreValide,
    nettoyerTexte,
    utilisateurValide
} from "./utils.js";



let ventesGlobales = [];

let produitVenteActuel = null;

let traitementVente = false;



export function getVentes(){

    return ventesGlobales;

}





// ===============================
// CHARGER VENTES
// ===============================


export async function chargerVentes(
    utilisateurConnecte
){


    if(!utilisateurValide(auth, utilisateurConnecte))

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



        const snapshot =

        await getDocs(q);



        ventesGlobales = [];



        snapshot.forEach((docSnap)=>{


            ventesGlobales.push({

                id:

                docSnap.id,


                ...docSnap.data()


            });


        });



        return ventesGlobales;


    }


    catch(error){


        console.error(

            "Erreur chargement ventes:",

            error

        );


        return [];

    }


}
// ===============================
// ENREGISTRER VENTE
// ===============================


export async function enregistrerVente(
    utilisateurConnecte,
    produit,
    quantite,
    benefice
){


    if(!utilisateurValide(auth, utilisateurConnecte))

        return false;



    try{


        await addDoc(

            collection(
                db,
                "ventes"
            ),


            {


                userId:

                auth.currentUser.uid,



                produit:

                nettoyerTexte(
                    produit.nom
                )
                ||
                "Produit",



                quantiteVendue:

                nombreValide(
                    quantite
                ),



                prixVente:

                nombreValide(
                    produit.prixRevente
                ),



                montantTotal:

                nombreValide(
                    produit.prixRevente
                )
                *
                nombreValide(
                    quantite
                ),



                benefice:

                nombreValide(
                    benefice
                ),



                statut:

                "validée",



                date:

                serverTimestamp()


            }


        );



        return true;


    }


    catch(error){


        console.error(

            "Erreur enregistrement vente:",

            error

        );


        return false;


    }


}





// ===============================
// OUVRIR FENETRE VENTE
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



    const nom =

    document.getElementById(
        "nomProduitVente"
    );



    if(nom)

        nom.textContent =

        "Produit : "
        +
        produit.nom;



    const champ =

    document.getElementById(
        "quantiteVente"
    );



    if(champ)

        champ.value = "";



    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =

        "block";



    return true;


}
// ===============================
// CONFIRMER VENTE
// ===============================


export async function confirmerVente(
    utilisateurConnecte
){


    if(traitementVente)

        return false;



    if(!produitVenteActuel){


        alert(

            "Aucun produit sélectionné"

        );


        return false;


    }



    const champ =

    document.getElementById(
        "quantiteVente"
    );



    const quantite =

    nombreValide(
        champ?.value
    );



    if(quantite <= 0){


        alert(

            "Quantité invalide"

        );


        return false;


    }



    const stock =

    nombreValide(
        produitVenteActuel.stockTotal
    );



    if(quantite > stock){


        alert(

            "Stock insuffisant"

        );


        return false;


    }



    try{


        traitementVente = true;



        const nouveauStock =

        stock - quantite;



        const benefice =


        (

            nombreValide(
                produitVenteActuel.prixRevente
            )

            -

            nombreValide(
                produitVenteActuel.prixUnitaire
            )

        )

        *

        quantite;



        const ok =

        await enregistrerVente(

            utilisateurConnecte,

            produitVenteActuel,

            quantite,

            benefice

        );



        if(!ok)

            throw new Error(
                "Vente refusée"
            );



        await updateDoc(

            doc(

                db,

                "produits",

                produitVenteActuel.id

            ),


            {


                stockTotal:

                nouveauStock


            }


        );



        fermerVente();



        return true;


    }


    catch(error){


        console.error(

            "Erreur vente:",

            error

        );


        alert(

            "Erreur pendant la vente"

        );


        return false;


    }


    finally{


        traitementVente = false;


    }


}





// ===============================
// FERMER FENETRE VENTE
// ===============================


export function fermerVente(){


    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =

        "none";



    produitVenteActuel = null;


}
