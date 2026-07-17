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
        return;



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
