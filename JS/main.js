// ===============================
// IMPORTS
// ===============================


import {
    auth
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



import {
    chargerProduits,
    ajouterProduit,
    supprimerProduit,
    getProduits
} from "./produits.js";



import {
    chargerVentes,
    vendreProduit,
    confirmerVente,
    fermerVente
} from "./ventes.js";



import {
    chargerHistorique,
    viderHistorique
} from "./historique.js";


import {
    mettreAJourResume,
    calculerStockRestant
} from "./dashboard.js";
