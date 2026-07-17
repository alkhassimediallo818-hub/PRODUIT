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
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    nettoyerTexte,
    nombreValide,
    utilisateurValide
} from "./utils.js";



let produits = [];

let produitModification = null;
function creerProduit(
    nom,
    prixGros,
    cartons,
    parCarton,
    prixRevente
){

    const stockTotal =
    cartons * parCarton;


    const prixTotalStock =
    prixGros * cartons;


    const prixUnitaire =
    prixGros / parCarton;


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

        benefice

    };

}


export function getProduits(){

    return produits;

}



export async function chargerProduits(utilisateurConnecte){


    if(!utilisateurValide(auth, utilisateurConnecte))
        return;



    produits = [];


    const q = query(

        collection(db,"produits"),

        where(
            "userId",
            "==",
            auth.currentUser.uid
        )

    );



    const snapshot =
    await getDocs(q);



    snapshot.forEach((docSnap)=>{


        const data =
        docSnap.data();



        produits.push({

            id:
            docSnap.id,

            ...data,

            stockTotal:
            nombreValide(data.stockTotal),

            benefice:
            nombreValide(data.benefice),

            prixRevente:
            nombreValide(data.prixRevente),

            prixUnitaire:
            nombreValide(data.prixUnitaire)

        });


    });



    return produits;

}




export async function ajouterProduit(
    utilisateurConnecte,
    produit
){

    if(!utilisateurValide(auth, utilisateurConnecte))
        return false;



    try{


        if(produitModification){


            await updateDoc(

                doc(
                    db,
                    "produits",
                    produitModification
                ),

                produit

            );


            produitModification = null;


        }

        else{


            await addDoc(

                collection(db,"produits"),

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



export async function supprimerProduit(
    utilisateurConnecte,
    id
){


    if(!utilisateurValide(auth, utilisateurConnecte))
        return;



    await deleteDoc(

        doc(
            db,
            "produits",
            id
        )

    );

}
// ===============================
// MODIFIER PRODUIT
// ===============================

export function modifierProduit(id){

    const produit =

    produits.find(
        p => p.id === id
    );


    if(!produit)
        return;



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

    ].forEach((id)=>{


        const element =
        document.getElementById(id);


        if(element)

            element.value = "";


    });

}
