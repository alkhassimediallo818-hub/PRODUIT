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



export {
    produits,
    produitModification
};
