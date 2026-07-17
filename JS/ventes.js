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

export async function chargerVentes(utilisateurConnecte){


    if(!utilisateurValide(auth, utilisateurConnecte))
        return;



    const q = query(

        collection(db,"ventes"),

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
