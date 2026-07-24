// ===============================
// PRODUITS
// VERSION RENFORCEE + AFFICHAGE
// PARTIE 1/3
// ===============================


import {

    db,

    auth

} from "../firebase.js";

import {

    creerNotification

} from "./notifications.js";

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

import {

    enregistrerHistorique

} from "./historique.js";




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
// CREATION PRODUIT
// ===============================


function creerProduit(data){



    const nom =

    nettoyerTexte(

        data.nom

    );




    const prixGros =

    nombreValide(

        data.prixGros

    );




    const cartons =

    nombreValide(

        data.nombreCartons

    );




    const parCarton =

    nombreValide(

        data.produitsParCarton

    );




    const prixRevente =

    nombreValide(

        data.prixRevente

    );





    const stockTotal =

    cartons * parCarton;





    const prixTotalStock =

    prixGros * cartons;






    const prixUnitaire =


    stockTotal > 0

    ?

    prixTotalStock / stockTotal

    :

    0;






    const benefice =


    (

        prixRevente

        -

        prixUnitaire

    )

    *

    stockTotal;






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



        benefice:

        Math.max(

            0,

            benefice

        )



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





        const resultat =

        await getDocs(q);





        produits = [];





        resultat.forEach((docSnap)=>{


            produits.push({


                id:

                docSnap.id,



                ...docSnap.data()



            });



        });





        // ===============================
        // VERIFICATION STOCK FAIBLE
        // ===============================


        produits.forEach((produit)=>{


            if(

                nombreValide(produit.stockTotal)

                <=

                5

            ){


                creerNotification(


                    "Stock faible",



                    `${produit.nom} possède seulement ${produit.stockTotal} unités.`,



                    "warning"



                );


            }


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

        creerProduit(

            donnees

        );





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

            await getDoc(

                reference

            );





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


                    userId:

                    auth.currentUser.uid,



                    dateModification:

                    serverTimestamp()



                }

            );

            await creerNotification(

    "Produit modifié",

    `Le produit ${produit.nom} a été mis à jour.`,

    "info"

);
            
        await enregistrerHistorique(
    true,
    "Modification produit",
    produit.nom
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

        await creerNotification(

    "Nouveau produit",

    `Le produit ${produit.nom} a été ajouté.`,

    "success"

);
        
await enregistrerHistorique(
    true,
    "Ajout produit",
    produit.nom
);




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
// AFFICHER PRODUITS
// ===============================


export function afficherProduits(){

    const tableau = document.getElementById(
        "tableauProduits"
    );


    if(!tableau)
        return;


    tableau.innerHTML = "";



    produits.forEach((produit)=>{


        const ligne = document.createElement("tr");



        ligne.innerHTML = `


        <td>
        ${produit.nom || "Produit"}
        </td>


        <td>
        ${nombreValide(produit.prixGros)}
        FCFA
        </td>


        <td>
        ${obtenirStatutStock(produit.stockTotal)}
        </td>


        <td>
        ${nombreValide(produit.nombreCartons)}
        </td>


        <td>
        ${nombreValide(produit.produitsParCarton)}
        </td>


        <td>
        ${nombreValide(produit.stockTotal)}
        </td>


        <td>
        ${nombreValide(produit.prixUnitaire)}
        FCFA
        </td>


        <td>
        ${nombreValide(produit.prixRevente)}
        FCFA
        </td>


        <td>
        ${nombreValide(produit.benefice)}
        FCFA
        </td>


        <td>


        <button onclick="modifierProduit('${produit.id}')">
        Modifier
        </button>


        <button onclick="supprimerProduit('${produit.id}')">
        Supprimer
        </button>


        <button onclick="vendreProduit('${produit.id}')">
        Vendre
        </button>


        </td>


        `;



        if(
            nombreValide(produit.stockTotal) <= 10
        ){

            ligne.classList.add(
                "stock-faible"
            );

        }



        tableau.appendChild(ligne);



    });


}
// ===============================
// SUPPRIMER PRODUIT
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

        await getDoc(

            reference

        );






        if(


            !resultat.exists()

            ||

            resultat.data().userId

            !==

            auth.currentUser.uid

        )

        return false;



const nomProduit = resultat.data().nom || "Produit";



        await deleteDoc(

            reference

        );
        
await creerNotification(

    "Produit supprimé",

    `Le produit ${produit.nom} a été supprimé.`,

    "warning"

);
        

  await enregistrerHistorique(
    true,
    "Suppression produit",
    nomProduit
);




        produits =

        produits.filter(

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


export function modifierProduit(


    id


){



    const produit =

    produits.find(

        (p)=>p.id === id

    );






    if(!produit)

    return false;






    const champs = {



        nom:

        produit.nom || "",




        prixGros:

        produit.prixGros || "",




        nombreCartons:

        produit.nombreCartons || "",




        produitsParCarton:

        produit.produitsParCarton || "",




        prixRevente:

        produit.prixRevente || ""



    };







    Object.entries(champs)

    .forEach(([id,valeur])=>{



        const element =

        document.getElementById(

            id

        );



        if(element){


            element.value = valeur;


        }



    });







    produitModification = id;





    return true;



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

        document.getElementById(

            id

        );






        if(element){


            element.value = "";


        }



    });



}








// ===============================
// NETTOYAGE LOCAL
// ===============================


export function nettoyerProduits(){



    produits = [];



    produitModification = null;



    afficherProduits();



}



// ===============================
// RECHERCHE PRODUITS
// ===============================


const rechercheProduit =
document.getElementById(
    "rechercheProduit"
);



if(rechercheProduit){


    rechercheProduit.addEventListener(

        "input",

        ()=>{


            const texte =
            rechercheProduit.value
            .toLowerCase();



            const lignes =
            document.querySelectorAll(
                "#tableauProduits tr"
            );



            lignes.forEach((ligne)=>{


                const contenu =
                ligne.textContent
                .toLowerCase();



                if(contenu.includes(texte)){

                    ligne.style.display =
                    "";

                }

                else{

                    ligne.style.display =
                    "none";

                }


            });


        }

    );


}




// ===============================
// STATUT STOCK
// ===============================


export function obtenirStatutStock(stock){


    if(stock <= 5){


        return `
        <span class="badge stock-faible">
        Stock faible
        </span>
        `;


    }



    return `

    <span class="badge stock-ok">
    Disponible
    </span>

    `;


}




// ===============================
// FIN MODULE
// ===============================


console.log(

    "Module produits chargé"

);
