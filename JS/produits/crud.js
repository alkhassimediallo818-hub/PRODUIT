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



await addDoc(
    collection(db, "produits"),
    {
        ...produit,
        stockTotal,
        prixUnitaire,
        benefice,
        userId: auth.currentUser.uid,
        dateAjout: serverTimestamp()
    }
);

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

                    id:

                    docSnap.id,

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


        console.log(

            "Produit envoyé :",

            {

                ...produit,

                stockTotal,

                prixUnitaire,

                benefice,

                userId:

                auth.currentUser.uid

            }

        );


        await addDoc(

            collection(

                db,

                "produits"

            ),

            {

                ...produit,

                stockTotal,

                prixUnitaire,

                benefice,

                userId:

                auth.currentUser.uid,

                dateAjout:

                serverTimestamp()

            }

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


    try{


        const reference =

        doc(

            db,

            "produits",

            id

        );



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



// ===============================
// SUPPRIMER PRODUIT
// ===============================

export async function supprimerProduit(

    id

){


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



        if(!resultat.exists())

            return false;



        const produit =

        {

            id,

            ...resultat.data()

        };



        await envoyerCorbeille(

            "produits",

            produit

        );



        await deleteDoc(

            reference

        );



        await chargerProduits();



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
