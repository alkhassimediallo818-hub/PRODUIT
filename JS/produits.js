// ===============================
// PRODUITS
// VERSION RENFORCEE
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
// GET PRODUITS
// ===============================


export function getProduits(){

    return produits;

}




export function estEnModification(){

    return produitModification !== null;

}





// ===============================
// CREER PRODUIT
// ===============================


function creerProduit(data){


    const nom =
    nettoyerTexte(data.nom);



    const prixGros =
    nombreValide(data.prixGros);



    const nombreCartons =
    nombreValide(data.nombreCartons);



    const produitsParCarton =
    nombreValide(data.produitsParCarton);



    const prixRevente =
    nombreValide(data.prixRevente);




    const stockTotal =

    nombreCartons *

    produitsParCarton;




    const prixTotalStock =

    prixGros *

    nombreCartons;




    const prixUnitaire =

    stockTotal > 0

    ?

    prixTotalStock / stockTotal

    :

    0;




    const benefice =

    (

        prixRevente *

        stockTotal

    )

    -

    prixTotalStock;





    return {


        nom,


        prixGros,


        nombreCartons,


        produitsParCarton,


        prixTotalStock,


        stockTotal,


        stockUnitaire:

        prixUnitaire,


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
// CHARGER PRODUITS FIRESTORE
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





        const resultat =

        await getDocs(q);





        produits = [];





        resultat.forEach((docSnap)=>{



            const data =

            docSnap.data();




            produits.push({


                id:

                docSnap.id,



                ...data,



                stockTotal:

                nombreValide(

                    data.stockTotal

                ),



                benefice:

                nombreValide(

                    data.benefice

                )



            });



        });





        afficherProduits();



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
// AJOUT / MODIFICATION PRODUIT
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

            !produit.nom

            ||

            produit.stockTotal <= 0

        ){

            alert(

                "Informations produit invalides"

            );

            return false;

        }




        // ===============================
        // MODIFICATION
        // ===============================


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



        // ===============================
        // NOUVEAU PRODUIT
        // ===============================


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


        return false;


    }


}







// ===============================
// SUPPRESSION PRODUIT
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




        const resultat =

        await getDoc(reference);




        if(

            !resultat.exists()

            ||

            resultat.data().userId

            !==

            auth.currentUser.uid

        )

        return false;




        await deleteDoc(reference);





        produits = produits.filter(

            (produit)=>


            produit.id !== id


        );




        afficherProduits();



        return true;



    }



    catch(error){



        console.error(

            "Erreur suppression produit:",

            error

        );


        return false;


    }


}







// ===============================
// MODIFIER PRODUIT
// ===============================


export function modifierProduit(id){



    const produit =

    produits.find(

        (p)=>p.id === id

    );




    if(!produit)

    return false;




    const champs = {



        nom:

        produit.nom,



        prixGros:

        produit.prixGros,



        nombreCartons:

        produit.nombreCartons,



        produitsParCarton:

        produit.produitsParCarton,



        prixRevente:

        produit.prixRevente


    };





    Object.keys(champs)

    .forEach((champ)=>{



        const element =

        document.getElementById(champ);




        if(element)

        element.value = champs[champ];



    });




    produitModification = id;



    return true;


}





// ===============================
// AFFICHAGE TABLEAU PRODUITS
// ===============================


export function afficherProduits(){


    const tableau =

    document.getElementById(

        "tableauProduits"

    );



    if(!tableau)

    return;




    tableau.innerHTML = "";





    produits.forEach((produit)=>{



        const ligne =

        document.createElement(

            "tr"

        );




        ligne.innerHTML = `


        <td>${produit.nom}</td>


        <td>${produit.stockTotal}</td>


        <td>${produit.prixRevente} FCFA</td>


        <td>${produit.benefice} FCFA</td>


        <td>


        <button onclick="vendreProduit('${produit.id}')">

        Vendre

        </button>



        <button onclick="modifierProduit('${produit.id}')">

        Modifier

        </button>



        <button onclick="supprimerProduit('${produit.id}')">

        Supprimer

        </button>


        </td>


        `;



        tableau.appendChild(

            ligne

        );



    });



}
// ===============================
// ANNULER MODIFICATION
// ===============================


export function annulerModification(){


    produitModification = null;


}







// ===============================
// VIDER CHAMPS FORMULAIRE
// ===============================


export function viderChamps(){



    const champs = [


        "nom",

        "prixGros",

        "nombreCartons",

        "produitsParCarton",

        "prixRevente"


    ];





    champs.forEach((id)=>{



        const element =

        document.getElementById(id);




        if(element){


            element.value = "";

        }



    });


}







// ===============================
// REINITIALISER PRODUITS
// ===============================


export function nettoyerProduits(){


    produits = [];


    produitModification = null;



    afficherProduits();


}







// ===============================
// RECHERCHER PRODUIT
// ===============================


export function rechercherProduit(

    texte

){



    const recherche =

    nettoyerTexte(texte)

    .toLowerCase();




    if(!recherche)

    return produits;




    return produits.filter(

        (produit)=>


        produit.nom

        .toLowerCase()

        .includes(recherche)


    );


}







// ===============================
// CALCUL STOCK TOTAL
// ===============================


export function calculerStockProduits(){


    let total = 0;



    produits.forEach((produit)=>{



        total +=

        nombreValide(

            produit.stockTotal

        );



    });



    return total;


}







// ===============================
// FIN MODULE PRODUITS
// ===============================
