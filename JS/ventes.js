// ===============================
// VENTES
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
// GET VENTES
// ===============================


export function getVentes(){


    return ventesGlobales;


}





export function chargerProduitsVente(produits){


    produitsDisponibles = produits;


    const select = document.getElementById(
        "produitVenteSelect"
    );


    if(!select)
        return;


    select.innerHTML = `
        <option value="">
            Choisir un produit
        </option>
    `;


    produits.forEach((produit)=>{


        const option = document.createElement("option");


        option.value = produit.id;


        option.textContent =
        produit.nom +
        " (Stock: " +
        produit.stockTotal +
        ")";


        select.appendChild(option);


    });


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

    )

    return [];





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

            "Erreur chargement ventes:",

            error

        );



        ventesGlobales = [];



        return [];



    }



}




export function selectionnerProduitVente(){


    const select =
    document.getElementById(
        "produitVenteSelect"
    );


    produitVenteActuel =
    produitsDisponibles.find(
        p => p.id === select.value
    );


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



    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;





    try{



        const quantiteFinale =

        nombreValide(

            quantite

        );




        if(

            quantiteFinale <= 0

        )

        return false;





        const prix =

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

            prix,



            montantTotal:


            prix *

            quantiteFinale,



            benefice:


            nombreValide(

                benefice

            ),



            date:

            serverTimestamp()



        };





        const ajout =

        await addDoc(



            collection(

                db,

                "ventes"

            ),



            nouvelleVente



        );





        ventesGlobales.push({


            id:

            ajout.id,


            ...nouvelleVente



        });



        afficherVentes();




        return true;



    }



    catch(error){



        console.error(

            "Erreur création vente:",

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

        (p)=>p.id === id

    );



    if(!produit)

    return false;





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

        "block";


    }



    return true;


}








// ===============================
// CONFIRMER VENTE
// ===============================


export async function confirmerVente(

    utilisateurConnecte

){



    if(traitementVente)

    return false;





    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;





    if(!produitVenteActuel){



        alert(

            "Aucun produit sélectionné"

        );



        return false;


    }






    try{



        traitementVente = true;





        const reference =

        doc(

            db,

            "produits",

            produitVenteActuel.id

        );





        const resultat =

        await getDoc(reference);






        if(

            !resultat.exists()

        ){


            throw new Error(

                "Produit introuvable"

            );


        }






        const produit =

        resultat.data();






        if(

            produit.userId

            !==

            auth.currentUser.uid

        ){


            throw new Error(

                "Accès interdit"

            );


        }






        const champ =

        document.getElementById(

            "quantiteVente"

        );





        const quantite =

        nombreValide(

            champ?.value

        );






        const stock =

        nombreValide(

            produit.stockTotal

        );






        if(

            quantite <= 0

            ||

            quantite > stock

        ){



            alert(

                "Stock insuffisant"

            );



            return false;


        }







        const nouveauStock =

        stock

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







        const vente =

        await enregistrerVente(

            utilisateurConnecte,

            produit,

            quantite,

            beneficeTotal

        );

await enregistrerHistorique(

    true,

    "Vente produit",

    produit.nom

);




        if(!vente){



            throw new Error(

                "Erreur enregistrement vente"

            );


        }






        await updateDoc(



            reference,



            {


                stockTotal:


                nouveauStock,



                derniereVente:


                serverTimestamp()



            }



        );

if(nouveauStock <= 0){

    await enregistrerHistorique(

        true,

        "Stock épuisé",

        produit.nom

    );

}





        fermerVente();






        return true;





    }



    catch(error){



        console.error(

            "Erreur confirmation vente:",

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






    produitVenteActuel = null;



}









// ===============================
// AFFICHER TABLEAU DES VENTES
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
// REINITIALISER VENTES
// ===============================


export function nettoyerVentes(){



    ventesGlobales = [];



    produitVenteActuel = null;



    afficherVentes();



}








// ===============================
// CALCULS RAPIDES
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



console.log("Module ventes chargé");


// ===============================
// FIN MODULE VENTES
// ===============================
