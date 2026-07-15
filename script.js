import { db, auth } from "./firebase.js";

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
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// VARIABLES GLOBALES
// ===============================

let produits = [];

let utilisateurConnecte = false;

let produitModification = null;

let produitVenteActuel = null;

let traitementVente = false;


// Protection anti double chargement

let chargementProduits = false;

let chargementVentes = false;

let chargementHistorique = false;


// ===============================
// VERIFICATION UTILISATEUR
// ===============================

function utilisateurValide(){

    return (
        utilisateurConnecte === true &&
        auth.currentUser !== null
    );

}



// ===============================
// NETTOYAGE TEXTE SECURISE
// ===============================

function nettoyerTexte(texte){

    if(typeof texte !== "string")
        return "";

    return texte
        .trim()
        .replace(/[<>]/g,"");

}



// ===============================
// CONVERSION NOMBRE SECURISEE
// ===============================

function nombreValide(valeur){

    const nombre = Number(valeur);

    return Number.isFinite(nombre)
        ? nombre
        : 0;

}



// ===============================
// HISTORIQUE SECURISE
// ===============================

async function enregistrerHistorique(type, produit){


    if(!utilisateurValide())
        return;


    try{


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

    catch(error){


        console.error(
            "Erreur historique :",
            error
        );


    }


}




// ===============================
// ENREGISTREMENT VENTE SECURISE
// ===============================


async function enregistrerVente(
    produit,
    quantiteVendue,
    benefice
){


    if(!utilisateurValide())
        return false;



    try{


        await addDoc(

            collection(db,"ventes"),

            {


                userId:
                auth.currentUser.uid,


                produit:
                nettoyerTexte(produit.nom)
                ||
                "Produit",


                quantiteVendue:
                nombreValide(quantiteVendue),


                prixVente:
                nombreValide(
                    produit.prixRevente
                ),


                benefice:
                nombreValide(benefice),


                montantTotal:

                nombreValide(
                    produit.prixRevente
                )

                *

                nombreValide(
                    quantiteVendue
                ),


                statut:
                "validée",


                date:
                serverTimestamp()


            }

        );


        return true;


    }


    catch(error){


        console.error(
            "Erreur vente :",
            error
        );


        return false;


    }


}

// ===============================
// CHARGER PRODUITS
// ===============================

async function chargerProduits(){


    if(!utilisateurValide())
        return;


    if(chargementProduits)
        return;


    try{


        chargementProduits = true;


        produits = [];



        const produitsUtilisateur = query(

            collection(db,"produits"),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(produitsUtilisateur);



        snapshot.forEach((document)=>{


            const data = document.data();



            produits.push({

                id:
                document.id,


                ...data,


                stockTotal:
                nombreValide(data.stockTotal),


                prixRevente:
                nombreValide(data.prixRevente)


            });



        });



        afficherProduits();



    }


    catch(error){


        console.error(

            "Erreur chargement produits :",

            error

        );


    }


    finally{


        chargementProduits = false;


    }


}





// ===============================
// AJOUT / MODIFICATION PRODUIT
// ===============================


async function ajouterProduit(){



    if(!utilisateurValide()){


        alert(
            "Connectez-vous d'abord."
        );


        return;


    }




    try{


        const nom =
        nettoyerTexte(
            document.getElementById("nom")?.value
        );



        const prixGros =
        nombreValide(
            document.getElementById("prixGros")?.value
        );



        const nombreCartons =
        nombreValide(
            document.getElementById("nombreCartons")?.value
        );



        const produitsParCarton =
        nombreValide(
            document.getElementById("produitsParCarton")?.value
        );



        const prixRevente =
        nombreValide(
            document.getElementById("prixRevente")?.value
        );





        if(

            !nom ||

            prixGros <= 0 ||

            nombreCartons <= 0 ||

            produitsParCarton <= 0 ||

            prixRevente <= 0

        ){


            alert(
                "Informations invalides."
            );


            return;


        }





        const stockTotal =

        nombreCartons *

        produitsParCarton;



        const prixTotalStock =

        prixGros *

        nombreCartons;



        const prixUnitaire =

        prixGros /

        produitsParCarton;



        const benefice =

        (

            prixRevente *

            stockTotal

        )

        -

        prixTotalStock;





        const donneesProduit = {


            nom,


            prixGros,


            nombreCartons,


            produitsParCarton,


            prixTotalStock,


            stockTotal,


            prixUnitaire,


            prixRevente,


            benefice


        };






        if(produitModification){



            await updateDoc(

                doc(

                    db,

                    "produits",

                    produitModification

                ),

                donneesProduit

            );



            await enregistrerHistorique(

                "modification",

                nom

            );



            produitModification = null;



            alert(
                "Produit modifié."
            );



        }

        else{



            await addDoc(

                collection(db,"produits"),

                {


                    ...donneesProduit,


                    userId:
                    auth.currentUser.uid,


                    dateAjout:
                    serverTimestamp()


                }

            );



            await enregistrerHistorique(

                "ajout",

                nom

            );



            alert(
                "Produit ajouté."
            );


        }





        viderChamps();


        await chargerProduits();



    }


    catch(error){


        console.error(

            "Erreur produit :",

            error

        );


        alert(
            "Erreur pendant l'opération."
        );


    }



}





// ===============================
// AFFICHER PRODUITS
// ===============================


function afficherProduits(){



    const tableau =

    document.getElementById(
        "tableauProduits"
    );



    if(!tableau)
        return;



    tableau.innerHTML = "";



    let beneficeTotal = 0;



    produits.forEach((produit)=>{



        beneficeTotal +=

        nombreValide(
            produit.benefice
        );




        const ligne =

        document.createElement("tr");



        ligne.innerHTML = `


        <td>${produit.nom}</td>

        <td>${produit.prixGros} FCFA</td>

        <td>${produit.nombreCartons}</td>

        <td>${produit.produitsParCarton}</td>

        <td>${produit.stockTotal}</td>

        <td>${produit.prixUnitaire.toFixed(2)} FCFA</td>

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



        tableau.appendChild(ligne);



    });





    const compteur =

    document.getElementById(
        "nbProduits"
    );


    if(compteur)

        compteur.textContent =
        produits.length;




    const benefice =

    document.getElementById(
        "beneficeTotal"
    );


    if(benefice)

        benefice.textContent =

        beneficeTotal
        +
        " FCFA";



    calculerStockRestant();


}




// ===============================
// CALCUL STOCK
// ===============================


function calculerStockRestant(){


    let stock = 0;



    produits.forEach((produit)=>{


        stock +=

        nombreValide(
            produit.stockTotal
        );


    });



    const element =

    document.getElementById(
        "stockRestant"
    );



    if(element)

        element.textContent =
        stock;


}

// ===============================
// CHARGER VENTES
// ===============================

async function chargerVentes(){


    if(!utilisateurValide())
        return;


    if(chargementVentes)
        return;



    try{


        chargementVentes = true;



        const ventesQuery = query(

            collection(db,"ventes"),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const snapshot =
        await getDocs(ventesQuery);



        let ventes = [];



        snapshot.forEach((document)=>{


            ventes.push({

                id:
                document.id,


                ...document.data()

            });


        });



        afficherVentes(ventes);


        calculerStatistiquesVentes(ventes);



    }


    catch(error){


        console.error(

            "Erreur chargement ventes :",

            error

        );


    }


    finally{


        chargementVentes = false;


    }


}







// ===============================
// CONFIRMER UNE VENTE
// ===============================


async function confirmerVente(){


    if(traitementVente)
        return;



    if(!produitVenteActuel)
        return;



    const champ =

    document.getElementById(
        "quantiteVente"
    );



    if(!champ)
        return;



    const quantite =

    nombreValide(
        champ.value
    );




    if(quantite <= 0){


        alert(
            "Quantité invalide."
        );


        return;


    }




    const stockActuel =

    nombreValide(
        produitVenteActuel.stockTotal
    );




    if(quantite > stockActuel){


        alert(
            "Stock insuffisant."
        );


        return;


    }





    try{


        traitementVente = true;



        const nouveauStock =

        stockActuel

        -

        quantite;




        const beneficeVente =


        (

            nombreValide(
                produitVenteActuel.prixRevente
            )


            -

            nombreValide(
                produitVenteActuel.prixUnitaire
            )

        )

        *

        quantite;





        const venteOk =

        await enregistrerVente(

            produitVenteActuel,

            quantite,

            beneficeVente

        );





        if(!venteOk){


            throw new Error(
                "Vente non enregistrée"
            );


        }





        await updateDoc(

            doc(

                db,

                "produits",

                produitVenteActuel.id

            ),

            {


                stockTotal:
                nouveauStock


            }

        );






        await enregistrerHistorique(

            "vente",

            produitVenteActuel.nom

            +

            " x "

            +

            quantite

        );





        alert(

            "Vente enregistrée.\nBénéfice : "

            +

            beneficeVente

            +

            " FCFA"

        );





        fermerVente();



        await chargerProduits();

        await chargerVentes();

        await chargerHistorique();



    }


    catch(error){


        console.error(

            "Erreur vente :",

            error

        );


        alert(
            "Impossible d'enregistrer la vente."
        );


    }


    finally{


        traitementVente = false;


    }



}







// ===============================
// OUVRIR FENÊTRE VENTE
// ===============================


function vendreProduit(id){



    const produit =

    produits.find(

        p => p.id === id

    );



    if(!produit)
        return;



    produitVenteActuel = produit;




    const nom =

    document.getElementById(
        "nomProduitVente"
    );



    if(nom)

        nom.textContent =

        "Produit : "

        +

        produit.nom;




    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =
        "block";



}







// ===============================
// FERMER VENTE
// ===============================


function fermerVente(){


    const modal =

    document.getElementById(
        "modalVente"
    );



    if(modal)

        modal.style.display =
        "none";



    produitVenteActuel = null;


}








// ===============================
// AFFICHER VENTES
// ===============================


function afficherVentes(ventes){



    const tableau =

    document.getElementById(
        "tableauVentes"
    );



    if(!tableau)
        return;




    tableau.innerHTML = "";




    ventes.forEach((vente)=>{


        let date =

        "Date inconnue";



        if(vente.date){


            date =

            vente.date.toDate()
            .toLocaleString();


        }





        const ligne =

        document.createElement("tr");



        ligne.innerHTML = `


        <td>${vente.produit || "Produit"}</td>


        <td>${vente.quantiteVendue || 0}</td>


        <td>${vente.montantTotal || 0} FCFA</td>


        <td>${vente.benefice || 0} FCFA</td>


        <td>${vente.statut || "validée"}</td>


        <td>${date}</td>


        `;



        tableau.appendChild(ligne);



    });


}








// ===============================
// CHARGER HISTORIQUE
// ===============================


async function chargerHistorique(){



    if(!utilisateurValide())
        return;



    if(chargementHistorique)
        return;




    try{


        chargementHistorique = true;



        const historiqueQuery = query(

            collection(db,"historique"),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const snapshot =

        await getDocs(
            historiqueQuery
        );



        let historique = [];



        snapshot.forEach((document)=>{


            historique.push({

                id:
                document.id,


                ...document.data()

            });



        });



        afficherHistorique(historique);



    }


    catch(error){


        console.error(

            "Erreur historique :",

            error

        );


    }


    finally{


        chargementHistorique = false;


    }



}

// ===============================
// AFFICHER HISTORIQUE
// ===============================


function afficherHistorique(historique){


    const tableau =

    document.getElementById(
        "tableauHistorique"
    );



    if(!tableau)
        return;



    tableau.innerHTML = "";



    historique.forEach((action)=>{


        let date =

        "Date inconnue";



        if(action.date){


            date =

            action.date.toDate()
            .toLocaleString();


        }





        const ligne =

        document.createElement("tr");



        ligne.innerHTML = `


        <td>${action.type || "Action"}</td>


        <td>${action.produit || "Produit"}</td>


        <td>${date}</td>


        `;



        tableau.appendChild(ligne);



    });



}







// ===============================
// MODIFIER PRODUIT
// ===============================


function modifierProduit(id){



    const produit =

    produits.find(

        p => p.id === id

    );



    if(!produit)
        return;




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





    Object.keys(champs)
    .forEach((champ)=>{


        const element =

        document.getElementById(
            champ
        );



        if(element)

            element.value =
            champs[champ];


    });




    produitModification = id;



}








// ===============================
// SUPPRESSION PRODUIT
// ===============================


async function supprimerProduit(id){



    if(!utilisateurValide())
        return;




    const produit =

    produits.find(

        p => p.id === id

    );



    if(!produit)
        return;





    const confirmation =

    confirm(

        "Supprimer ce produit ?"

    );



    if(!confirmation)
        return;






    try{


        await enregistrerHistorique(

            "suppression",

            produit.nom

        );




        await deleteDoc(

            doc(

                db,

                "produits",

                id

            )

        );




        await chargerProduits();



        await chargerHistorique();



    }



    catch(error){


        console.error(

            "Erreur suppression :",

            error

        );



        alert(

            "Suppression impossible."

        );


    }



}








// ===============================
// VIDER FORMULAIRE
// ===============================


function viderChamps(){


    const champs = [


        "nom",


        "prixGros",


        "nombreCartons",


        "produitsParCarton",


        "prixRevente"


    ];



    champs.forEach((champ)=>{


        const element =

        document.getElementById(
            champ
        );



        if(element)

            element.value = "";



    });



}








// ===============================
// SUPPRIMER HISTORIQUE
// ===============================


async function viderHistorique(){



    if(!utilisateurValide())
        return;




    const confirmation =

    confirm(

        "Supprimer tout l'historique ?"

    );



    if(!confirmation)
        return;





    try{


        const historiqueQuery = query(

            collection(db,"historique"),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );



        const snapshot =

        await getDocs(
            historiqueQuery
        );





        for(

            const documentHistorique

            of

            snapshot.docs

        ){



            await deleteDoc(

                doc(

                    db,

                    "historique",

                    documentHistorique.id

                )

            );



        }





        await chargerHistorique();



        alert(

            "Historique supprimé."

        );



    }



    catch(error){


        console.error(

            "Erreur suppression historique :",

            error

        );



    }



}








// ===============================
// AUTHENTIFICATION FIREBASE
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{



        if(user){



            utilisateurConnecte = true;



            await chargerProduits();



            await chargerHistorique();



            await chargerVentes();



        }



        else{



            utilisateurConnecte = false;



            produits = [];



            produitModification = null;



            produitVenteActuel = null;



            afficherProduits();





            const compteurs = [


                "nbProduits",

                "beneficeTotal",

                "chiffreAffaires",

                "beneficeVentes",

                "ventesJour",

                "ventesMois",

                "stockRestant"


            ];





            compteurs.forEach((id)=>{


                const element =

                document.getElementById(
                    id
                );



                if(element)

                    element.textContent =
                    "0";



            });



        }



    }



);








// ===============================
// ACCES HTML
// ===============================


window.ajouterProduit =
ajouterProduit;


window.supprimerProduit =
supprimerProduit;


window.modifierProduit =
modifierProduit;


window.viderHistorique =
viderHistorique;


window.vendreProduit =
vendreProduit;


window.confirmerVente =
confirmerVente;


window.fermerVente =
fermerVente;