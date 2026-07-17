// ===============================
// HISTORIQUE
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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    nettoyerTexte,
    utilisateurValide
} from "./utils.js";




// ===============================
// ENREGISTRER HISTORIQUE
// ===============================

export async function enregistrerHistorique(
    utilisateurConnecte,
    type,
    produit
){


    if(!utilisateurValide(auth, utilisateurConnecte))
        return;



    await addDoc(

        collection(db,"historique"),

        {

            userId:
            auth.currentUser.uid,


            type:
            nettoyerTexte(type)
            ||
            "action",


            produit:
            nettoyerTexte(produit)
            ||
            "Inconnu",


            date:
            serverTimestamp()

        }

    );


}
// ===============================
// CHARGER HISTORIQUE
// ===============================

export async function chargerHistorique(utilisateurConnecte){


    if(!utilisateurValide(auth, utilisateurConnecte))
        return;



    const q = query(

        collection(db,"historique"),

        where(

            "userId",

            "==",

            auth.currentUser.uid

        )

    );



    const snapshot =
    await getDocs(q);



    const historique = [];



    snapshot.forEach((docSnap)=>{


        historique.push({

            id:
            docSnap.id,


            ...docSnap.data()

        });


    });



    afficherHistorique(
        historique
    );


    return historique;

}
