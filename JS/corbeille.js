// ===============================
// CORBEILLE
// ===============================

import {

    db,
    auth

} from "../firebase.js";

import {

    getDocs,
    query,
    where,
    collection

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

    collection,
    addDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


export async function chargerCorbeille(){


    if(!auth.currentUser)

        return [];


    try{


        const q = query(

            collection(

                db,

                "corbeille"

            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );


        const resultat =

        await getDocs(q);


        const elements = [];


        resultat.forEach((doc)=>{


            elements.push({

                id:doc.id,

                ...doc.data()

            });


        });


        afficherCorbeille(

            elements

        );


        return elements;


    }


    catch(error){


        console.error(

            "Erreur corbeille :",

            error

        );


        return [];


    }


}

export function afficherCorbeille(

    elements = []

){

    const zone =

    document.getElementById(

        "listeCorbeille"

    );


    if(!zone)

        return;


    if(elements.length === 0){

        zone.innerHTML =

        "Aucun élément supprimé.";

        return;

    }


    zone.innerHTML = "";


    elements.forEach((element)=>{


        zone.innerHTML += `

        <div class="elementCorbeille">

            <strong>

            ${element.donnees.nom || "Produit"}

            </strong>

            <br>

            Type :

            ${element.type}

            <br><br>

            <button

            onclick="restaurer('${element.id}')"

            >

            Restaurer

            </button>

        </div>

        `;


    });


}

// ===============================
// ENVOYER DANS LA CORBEILLE
// ===============================

export async function envoyerCorbeille(

    type,

    donnees

){


    if(!auth.currentUser)

        return false;



    try{


        await addDoc(

            collection(

                db,

                "corbeille"

            ),

            {

                userId:

                auth.currentUser.uid,


                type,


                donnees,


                dateSuppression:

                serverTimestamp()

            }

        );


        return true;


    }


    catch(error){


        console.error(

            "Erreur corbeille :",

            error

        );


        return false;


    }


}
