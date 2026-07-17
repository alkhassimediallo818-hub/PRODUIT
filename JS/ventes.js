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
// CHARGER VENTES
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



        const snapshot =

        await getDocs(q);



        ventesGlobales = [];



        snapshot.forEach(

            (docSnap)=>{


                ventesGlobales.push({

                    id:

                    docSnap.id,


                    ...docSnap.data()

                });


            }

        );



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


    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

        return false;



    try{


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


        };




        if(

            vente.quantiteVendue <= 0

        )

            return false;



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

        modal.style.display = "block";



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



        const produitFirestore =

        await getDoc(reference);



        if(

            !produitFirestore.exists()

        )

            throw new Error(

                "Produit introuvable"

            );



        const data =

        produitFirestore.data();



        if(

            data.userId !== auth.currentUser.uid

        )

            throw new Error(

                "Accès refusé"

            );



        const champ =

        document.getElementById(

            "quantiteVente"

        );



        const quantite =

        nombreValide(

            champ?.value

        );



        const stock =

        nombreValide(

            data.stockTotal

        );



        if(

            quantite <= 0

            ||

            quantite > stock

        ){


            alert(

                "Quantité invalide ou stock insuffisant"

            );


            return false;


        }



        const nouveauStock =

        stock - quantite;



        const prixUnitaire =

        nombreValide(

            data.prixUnitaire

        );



        const prixRevente =

        nombreValide(

            data.prixRevente

        );



        const benefice =

        (

            prixRevente

            -

            prixUnitaire

        )

        *

        quantite;




        const venteOk =

        await enregistrerVente(

            utilisateurConnecte,

            data,

            quantite,

            benefice

        );



        if(!venteOk)

            throw new Error(

                "Vente non enregistrée"

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

            "Impossible de terminer la vente"

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

        modal.style.display = "none";



    produitVenteActuel = null;


}
