// ===============================
// PRODUITS
// ===============================


import {
    db,
    auth
} from "../firebase.js";

import {

    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

    nombreValide,
    utilisateurValide,
    nettoyerTexte

} from "./utils.js";




// ===============================
// VARIABLES
// ===============================


let produits = [];

let produitModification = null;




// ===============================
// GETTERS
// ===============================


export function getProduits(){

    return produits;

}



export function estEnModification(){

    return produitModification !== null;

}




// ===============================
// CREATION PRODUIT
// ===============================


function creerProduit(data){


    const nom =
    nettoyerTexte(data.nom);



    const prixGros =
    nombreValide(data.prixGros);



    const cartons =
    nombreValide(data.nombreCartons);



    const parCarton =
    nombreValide(data.produitsParCarton);



    const prixRevente =
    nombreValide(data.prixRevente);



    const stockTotal =
    cartons * parCarton;



    const prixTotalStock =
    prixGros * cartons;



    const prixUnitaire =

    stockTotal > 0

    ?

    prixGros / stockTotal

    :

    0;



    const benefice =

    (prixRevente * stockTotal)

    -

    prixTotalStock;



    return {


        nom,

        prixGros,

        nombreCartons: cartons,

        produitsParCarton: parCarton,

        prixTotalStock,

        stockTotal,

        prixUnitaire,

        prixRevente,

        benefice:

        benefice > 0

        ?

        benefice

        :

        0


    };


}





// ===============================
// CHARGER PRODUITS
// ===============================


export async function chargerProduits(utilisateurConnecte){


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
                "produits"
            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const snapshot =

        await getDocs(q);



        produits = [];



        snapshot.forEach((item)=>{


            produits.push({

id: docSnap.id,

...docSnap.data(),

stockTotal:
nombreValide(docSnap.data().stockTotal),

benefice:
nombreValide(docSnap.data().benefice)

});


        return produits;


    }


    catch(error){


        console.error(
            "Erreur chargement produits:",
            error
        );


        produits = [];

        return [];


    }


}





// ===============================
// AJOUT / MODIFICATION
// ===============================


export async function ajouterProduit(

    utilisateurConnecte,

    donnees

){


    if(
        !utilisateurValide(
            auth,
            utilisateurConnecte
        )
    )

    return false;



    try{


        const produit =

        creerProduit(donnees);



        if(
            !produit.nom ||
            produit.stockTotal <= 0
        )

        return false;



        if(produitModification){



            const ref =

            doc(

                db,

                "produits",

                produitModification

            );



            const ancien =

            await getDoc(ref);



            if(
                !ancien.exists()
                ||
                ancien.data().userId !== auth.currentUser.uid
            )

            return false;



            await updateDoc(
    reference,
    {
        ...produit,

        userId:
        auth.currentUser.uid,

        dateModification:
        serverTimestamp()
    }
);



            produitModification = null;


        }

        else{


            await addDoc(

                collection(
                    db,
                    "produits"
                ),

                {

                    ...produit,

                    userId:
                    auth.currentUser.uid,


                    dateAjout:
                    serverTimestamp()


                }

            );


        }



        return true;


    }


    catch(error){


        console.error(

            "Erreur ajout produit:",

            error

        );


        produitModification = null;


        return false;


    }


}





// ===============================
// SUPPRESSION
// ===============================


export async function supprimerProduit(

    utilisateurConnecte,

    id

){


    if(
        !utilisateurValide(
            auth,
            utilisateurConnecte
        )
    )

    return false;



    try{


        const ref =

        doc(

            db,

            "produits",

            id

        );



        const resultat =

        await getDoc(ref);



        if(
            !resultat.exists()
            ||
            resultat.data().userId !== auth.currentUser.uid
        )

        return false;



        await deleteDoc(ref);



        produits = produits.filter(

            p=>p.id !== id

        );



        return true;


    }


    catch(error){


        console.error(

            "Erreur suppression:",

            error

        );


        return false;


    }


}





// ===============================
// MODIFIER
// ===============================


export function modifierProduit(id){


    const produit =

    produits.find(

        p=>p.id === id

    );



    if(!produit)

    return false;



    const champs = {

        nom: produit.nom,

        prixGros: produit.prixGros,

        nombreCartons: produit.nombreCartons,

        produitsParCarton: produit.produitsParCarton,

        prixRevente: produit.prixRevente

    };



    Object.keys(champs).forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

        element.value = champs[id];


    });



    produitModification = id;



    return true;


}





// ===============================
// ANNULER MODIFICATION
// ===============================


export function annulerModification(){


    produitModification = null;


}





// ===============================
// VIDER CHAMPS
// ===============================


export function viderChamps(){


    [

        "nom",

        "prixGros",

        "nombreCartons",

        "produitsParCarton",

        "prixRevente"

    ]

    .forEach((id)=>{


        const element =

        document.getElementById(id);



        if(element)

        element.value = "";


    });


}
