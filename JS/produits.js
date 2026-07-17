// ===============================
// PRODUITS
// ===============================


import {
    db,
    auth
} from "./firebase.js";


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
// ETAT MODIFICATION
// ===============================


export function estEnModification(){

    return produitModification !== null;

}




export function getProduits(){

    return produits;

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


        nombreCartons:
        cartons,


        produitsParCarton:
        parCarton,


        prixTotalStock,


        stockTotal,


        prixUnitaire,


        prixRevente,


        benefice


    };


}





// ===============================
// CHARGER PRODUITS
// ===============================


export async function chargerProduits(
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



        snapshot.forEach((docSnap)=>{


            produits.push({

                id:
                docSnap.id,


                ...docSnap.data()

            });


        });



        return produits;


    }


    catch(error){


        console.error(

            "Erreur chargement produits:",

            error

        );


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



        if(produitModification){



            const reference =

            doc(

                db,

                "produits",

                produitModification

            );



            const ancien =
            await getDoc(reference);



            if(
                !ancien.exists()
                ||
                ancien.data().userId
                !==
                auth.currentUser.uid
            )

                return false;



            await updateDoc(

                reference,

                {

                    ...produit,

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

            "Erreur produit:",

            error

        );


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


        const reference =

        doc(

            db,

            "produits",

            id

        );



        const produit =
        await getDoc(reference);



        if(
            !produit.exists()
            ||
            produit.data().userId
            !==
            auth.currentUser.uid
        )

            return false;



        await deleteDoc(reference);



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
// MODIFICATION
// ===============================


export function modifierProduit(id){


    const produit =

    produits.find(

        p=>p.id === id

    );



    if(!produit)

        return false;



    document.getElementById("nom").value =
    produit.nom || "";



    document.getElementById("prixGros").value =
    produit.prixGros || "";



    document.getElementById("nombreCartons").value =
    produit.nombreCartons || "";



    document.getElementById("produitsParCarton").value =
    produit.produitsParCarton || "";



    document.getElementById("prixRevente").value =
    produit.prixRevente || "";



    produitModification = id;



    return true;


}





// ===============================
// ANNULER
// ===============================


export function annulerModification(){


    produitModification = null;


}





// ===============================
// VIDER FORMULAIRE
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
