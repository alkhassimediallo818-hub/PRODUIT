// ===============================
// CRUD PRODUITS FIRESTORE
// ===============================


import {

    db,
    auth

} from "../../firebase.js";


import {

    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

    verifierProduit

} from "./validation.js";


import {

    calculerStockTotal,
    calculerPrixUnitaire,
    calculerBeneficeTotal

} from "./calculs.js";


import {

    afficherProduits

} from "./affichage.js";


import {

    envoyerCorbeille

} from "../corbeille.js";



// ===============================
// VARIABLE LOCALE
// ===============================

let produits = [];



// ===============================
// GET PRODUITS
// ===============================

export function getProduits(){

    return produits;

}



// ===============================
// CHARGER PRODUITS
// ===============================

export async function chargerProduits(){


    if(!auth.currentUser)

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



        const resultat =

        await getDocs(q);



        produits = [];



        resultat.forEach(

            (docSnap)=>{


                produits.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });


            }

        );



        afficherProduits(

            produits

        );



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
// AJOUT PRODUIT
// ===============================

export async function ajouterProduit(

    produit

){


    if(!auth.currentUser)

        return false;



    const verification =

    verifierProduit(

        produit

    );



    if(!verification.valide){


        alert(

            verification.message

        );


        return false;


    }



    const stockTotal =

    calculerStockTotal(

        produit.nombreCartons,

        produit.produitsParCarton

    );



    const prixUnitaire =

    calculerPrixUnitaire(

        produit.prixGros,

        stockTotal

    );



    const benefice =

    calculerBeneficeTotal(

        produit.prixRevente,

        prixUnitaire,

        stockTotal

    );



    try{


        const nouveauProduit = {


            ...produit,

            stockTotal,

            prixUnitaire,

            benefice,

            userId:

            auth.currentUser.uid,

            dateAjout:

            serverTimestamp()

        };



        console.log(

            "Produit envoyé :",

            nouveauProduit

        );



        await addDoc(

            collection(

                db,

                "produits"

            ),

            nouveauProduit

        );



        await chargerProduits();



        return true;


    }


    catch(error){


        console.error(

            "Erreur ajout produit:",

            error

        );


        return false;


    }


}




// ===============================
// MODIFIER PRODUIT
// ===============================

export async function modifierProduit(

    id,

    nouvellesDonnees

){


    if(!auth.currentUser)

        return false;



    try{


        const reference =

        doc(

            db,

            "produits",

            id

        );



        const resultat =

        await getDoc(reference);



        if(

            !resultat.exists()

            ||

            resultat.data().userId !== auth.currentUser.uid

        )

        return false;



        await updateDoc(

            reference,

            {


                ...nouvellesDonnees,


                dateModification:

                serverTimestamp()


            }

        );



        await chargerProduits();



        return true;


    }


    catch(error){


        console.error(

            "Erreur modification:",

            error

        );


        return false;


    }


}


export function viderChamps(){


    const champs = [

        "nom",
        "prixGros",
        "nombreCartons",
        "produitsParCarton",
        "prixRevente"

    ];



    champs.forEach((id)=>{


        const champ = document.getElementById(id);


        if(champ){

            champ.value = "";

        }


    });


}


// ===============================
// SUPPRIMER PRODUIT
// ===============================

// ===============================
// SUPPRIMER PRODUIT
// ===============================

export async function supprimerProduit(

    id

){


    if(!auth.currentUser)

        return false;



    // Vérification ID
    if(typeof id !== "string"){

        console.error(

            "ID produit invalide reçu :",

            id

        );

        return false;

    }



    try{


        const reference =

        doc(

            db,

            "produits",

            id

        );



        const resultat =

        await getDoc(

            reference

        );



        if(

            !resultat.exists()

        ){

            console.error(

                "Produit introuvable"

            );

            return false;

        }



        const donneesProduit =

        resultat.data();



        // Sécurité utilisateur

        if(

            donneesProduit.userId

            !==

            auth.currentUser.uid

        ){

            console.error(

                "Accès interdit"

            );

            return false;

        }



        const produit = {


            id,

            ...donneesProduit

        };



        // Sauvegarde dans la corbeille

        await envoyerCorbeille(

            "produits",

            produit

        );



        // Suppression Firestore

        await deleteDoc(

            reference

        );



        // Actualisation affichage

        await chargerProduits();



        return true;



    }


    catch(error){


        console.error(

            "Erreur suppression produit :",

            error

        );


        return false;


    }


}
