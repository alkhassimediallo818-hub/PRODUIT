// ===============================
// CORBEILLE
// ===============================

import {

    db,
    auth

} from "../firebase.js";


import {

    collection,
    addDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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
