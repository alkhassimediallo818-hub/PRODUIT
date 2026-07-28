// ===============================
// VENTES
// VERSION RENFORCEE CORRIGEE
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
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

    nombreValide,
    nettoyerTexte,
    utilisateurValide

} from "./utils.js";


import {

    enregistrerHistorique

} from "./historique.js";




// ===============================
// VARIABLES
// ===============================


let ventesGlobales = [];

let produitVenteActuel = null;

let traitementVente = false;

let produitsDisponibles = [];




// ===============================
// CALCUL AUTOMATIQUE VENTE
// ===============================


export function calculerVente(){


    if(!produitVenteActuel)

        return;



    const champQuantite =

    document.getElementById(
        "quantiteVente"
    );



    const quantite =

    nombreValide(
        champQuantite?.value
    );



    const prixVente =

    nombreValide(
        produitVenteActuel.prixRevente
    );



    const prixAchat =

    nombreValide(
        produitVenteActuel.prixUnitaire
    );



    const montant =

    prixVente * quantite;



    const benefice =

    (prixVente - prixAchat)
    *
    quantite;



    const montantElement =

    document.getElementById(
        "montantVente"
    );



    const beneficeElement =

    document.getElementById(
        "beneficeVente"
    );



    if(montantElement){

        montantElement.textContent =
        montant + " FCFA";

    }



    if(beneficeElement){

        beneficeElement.textContent =
        benefice + " FCFA";

    }


}




// ===============================
// GET VENTES
// ===============================


export function getVentes(){

    return ventesGlobales;

}




// ===============================
// CHARGER PRODUITS POUR VENTE
// ===============================


export function chargerProduitsVente(produits){


    produitsDisponibles = produits || [];



    const select =

    document.getElementById(
        "produitVenteSelect"
    );



    if(!select)

        return;



    select.innerHTML = `

        <option value="">
            Choisir un produit
        </option>

    `;



    produitsDisponibles.forEach((produit)=>{


        const option =

        document.createElement(
            "option"
        );



        option.value = produit.id;



        option.textContent =

        `${produit.nom} 
        (Stock : ${produit.stockTotal || 0})`;



        select.appendChild(option);


    });


}



// ===============================
// SELECTION PRODUIT VENTE
// ===============================


export function selectionnerProduitVente(){


    const select =

    document.getElementById(
        "produitVenteSelect"
    );



    if(!select)

        return;



    produitVenteActuel =

    produitsDisponibles.find(

        produit =>

        produit.id === select.value

    );



    calculerVente();


}


// ===============================
// CHARGER LES VENTES
// ===============================


export async function chargerVentes(

    utilisateurConnecte

){


    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    ){

        return [];

    }



    try{


        const q = query(

            collection(

                db,

                "ventes"

            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const resultat =

        await getDocs(q);



        ventesGlobales = [];



        resultat.forEach((docSnap)=>{


            ventesGlobales.push({

                id:

                docSnap.id,


                ...docSnap.data()

            });


        });



        afficherVentes();



        return ventesGlobales;



    }

    catch(error){


        console.error(

            "Erreur chargement ventes :",

            error

        );


        ventesGlobales = [];


        return [];

    }


}







// ===============================
// ENREGISTRER UNE VENTE
// ===============================


export async function enregistrerVente(


    utilisateurConnecte,


    produit,


    quantite,


    benefice


){


if(!auth.currentUser){

    console.warn(
        "Utilisateur non connecté"
    );

    return false;

}



    try{



        const quantiteFinale =

        nombreValide(

            quantite

        );



        if(

            quantiteFinale <= 0

        ){

            return false;

        }





        const prixVente =

        nombreValide(

            produit.prixRevente

        );





        const nouvelleVente = {


            userId:

            auth.currentUser.uid,



            produit:

            nettoyerTexte(

                produit.nom

            ),



            quantiteVendue:

            quantiteFinale,



            prixVente:



            prixVente,



            montantTotal:


            prixVente

            *

            quantiteFinale,



            benefice:


            nombreValide(

                benefice

            ),



            date:

            serverTimestamp()



        };







        const resultat =

        await addDoc(


            collection(

                db,

                "ventes"

            ),


            nouvelleVente


        );






        ventesGlobales.push({


            id:

            resultat.id,


            ...nouvelleVente



        });






        afficherVentes();




        return true;




    }


    catch(error){



        console.error(

            "Erreur création vente :",

            error

        );



        return false;


    }



}






// ===============================
// OUVRIR FENETRE DE VENTE
// ===============================


export function vendreProduit(

    id,

    produits

){



    const produit =


    produits.find(

        p =>

        p.id === id

    );





    if(!produit){


        console.warn(

            "Produit introuvable"

        );


        return false;

    }





    produitVenteActuel = produit;





    const nom =

    document.getElementById(

        "nomProduitVente"

    );



    if(nom){


        nom.textContent =

        "Produit : "

        +

        produit.nom;


    }







    const quantite =

    document.getElementById(

        "quantiteVente"

    );



    if(quantite){


        quantite.value = "";

        quantite.focus();


    }







    const modal =

    document.getElementById(

        "modalVente"

    );



    if(modal){


        modal.style.display =

        "flex";


    }




    return true;


}


// ===============================
// CONFIRMER VENTE
// ===============================


export async function confirmerVente(

    utilisateurConnecte

){



    if(traitementVente){


        console.warn(

            "Vente déjà en cours"

        );


        return false;

    }





    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    ){


        console.warn(

            "Utilisateur invalide"

        );


        return false;

    }





    if(!produitVenteActuel){


        alert(

            "Aucun produit sélectionné"

        );


        return false;

    }






    try{


        traitementVente = true;



        console.log(

            "Début confirmation vente",

            produitVenteActuel

        );






        const reference =


        doc(

            db,

            "produits",

            produitVenteActuel.id

        );






        const resultat =

        await getDoc(reference);






        if(!resultat.exists()){


            throw new Error(

                "Produit introuvable"

            );


        }







        const produit = {


            id:

            resultat.id,


            ...resultat.data()


        };








        if(

            produit.userId !==

            auth.currentUser.uid

        ){


            throw new Error(

                "Accès interdit"

            );


        }








        const champQuantite =

        document.getElementById(

            "quantiteVente"

        );






        const quantite =

        nombreValide(

            champQuantite?.value

        );








        const stockActuel =

        nombreValide(

            produit.stockTotal

        );








        if(

            quantite <= 0

            ||

            quantite > stockActuel

        ){


            alert(

                "Stock insuffisant"

            );


            return false;


        }







        const nouveauStock =


        stockActuel

        -

        quantite;







        const beneficeUnitaire =


        nombreValide(

            produit.prixRevente

        )

        -

        nombreValide(

            produit.prixUnitaire

        );






        const beneficeTotal =


        beneficeUnitaire

        *

        quantite;







        console.log(

            "Données vente",

            {

                produit:

                produit.nom,

                quantite,

                nouveauStock,

                beneficeTotal

            }

        );







        // ===============================
        // ENREGISTREMENT VENTE
        // ===============================


        const vente =

        await enregistrerVente(

            utilisateurConnecte,

            produit,

            quantite,

            beneficeTotal

        );






        if(!vente){


            throw new Error(

                "Impossible d'enregistrer la vente"

            );


        }







        // ===============================
        // MISE A JOUR STOCK
        // ===============================


        await updateDoc(


            reference,


            {


                stockTotal:


                nouveauStock,



                derniereVente:


                serverTimestamp()



            }


        );







        // ===============================
        // HISTORIQUE
        // ===============================


        await enregistrerHistorique(


            true,


            "Vente produit",


            produit.nom


        );








        // ===============================
        // NOTIFICATION
        // ===============================


        await creerNotification(


            "Nouvelle vente",


            `Vente de ${produit.nom} effectuée (${quantite} unité(s)).`,


            "success"


        );







        if(nouveauStock <= 0){



            await creerNotification(


                "Stock épuisé",


                `${produit.nom} n'est plus disponible.`,


                "error"


            );



        }


        else if(nouveauStock <= 5){



            await creerNotification(


                "Stock faible",


                `${produit.nom} possède seulement ${nouveauStock} unité(s).`,


                "warning"


            );



        }








        fermerVente();






        console.log(

            "Vente terminée avec succès"

        );






        return true;






    }



    catch(error){



        console.error(

            "Erreur confirmation vente :",

            error

        );



        alert(

            error.message

        );



        return false;




    }



    finally{


        traitementVente = false;


    }



}


// ===============================
// FERMER FENETRE VENTE
// ===============================


export function fermerVente(){



    const modal =

    document.getElementById(

        "modalVente"

    );



    if(modal){


        modal.style.display =

        "none";


    }






    const champ =

    document.getElementById(

        "quantiteVente"

    );



    if(champ){


        champ.value = "";


    }







    const nom =

    document.getElementById(

        "nomProduitVente"

    );



    if(nom){


        nom.textContent =

        "Produit sélectionné";


    }






    const montant =

    document.getElementById(

        "montantVente"

    );



    if(montant){


        montant.textContent =

        "0 FCFA";


    }






    const benefice =

    document.getElementById(

        "beneficeVente"

    );



    if(benefice){


        benefice.textContent =

        "0 FCFA";


    }






    produitVenteActuel = null;



}





// ===============================
// AFFICHER TABLEAU VENTES
// ===============================


export function afficherVentes(){



    const tableau =

    document.getElementById(

        "tableauVentesDirectes"

    );



    if(!tableau)

        return;





    tableau.innerHTML = "";







    ventesGlobales.forEach((vente)=>{



        const ligne =

        document.createElement(

            "tr"

        );






        let date =

        "Date inconnue";





        if(

            vente.date

            &&

            typeof vente.date.toDate === "function"

        ){


            date =

            vente.date

            .toDate()

            .toLocaleString();



        }








        ligne.innerHTML = `



        <td>

            ${vente.produit || "Produit"}

        </td>



        <td>

            ${vente.quantiteVendue || 0}

        </td>



        <td>

            ${vente.montantTotal || 0} FCFA

        </td>



        <td>

            ${vente.benefice || 0} FCFA

        </td>



        <td>

            ${date}

        </td>



        `;








        tableau.appendChild(

            ligne

        );




    });



}






// ===============================
// NETTOYER VENTES
// ===============================


export function nettoyerVentes(){



    ventesGlobales = [];

    produitVenteActuel = null;


    afficherVentes();



}







// ===============================
// TOTAL VENTES
// ===============================


export function totalVentes(){



    let total = 0;



    ventesGlobales.forEach((vente)=>{


        total +=

        nombreValide(

            vente.montantTotal

        );


    });



    return total;


}








// ===============================
// TOTAL BENEFICES
// ===============================


export function totalBeneficeVentes(){



    let total = 0;



    ventesGlobales.forEach((vente)=>{


        total +=

        nombreValide(

            vente.benefice

        );


    });



    return total;


}






console.log(

    "Module ventes chargé"

);





