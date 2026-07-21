// ===============================
// GESTION PROFIL UTILISATEUR
// ===============================


import { db, auth } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// ===============================
// RECUPERER LE PROFIL
// ===============================

export async function recupererProfilUtilisateur(){


    const user = auth.currentUser;


    if(!user){

        return null;

    }



    const referenceProfil = doc(

        db,

        "users",

        user.uid

    );



    const resultat = await getDoc(

        referenceProfil

    );



    if(resultat.exists()){


        return resultat.data();


    }



    return null;


}






// ===============================
// CREER LE PROFIL
// ===============================

export async function creerProfilUtilisateur(nomUtilisateur){


    const user = auth.currentUser;



    if(!user){

        throw new Error(

            "Utilisateur non connecté"

        );

    }




    if(!nomUtilisateur || nomUtilisateur.trim().length < 3){


        throw new Error(

            "Le nom utilisateur doit contenir au moins 3 caractères"

        );


    }





    await setDoc(

        doc(

            db,

            "users",

            user.uid

        ),

        {

            nomUtilisateur:

            nomUtilisateur.trim(),


            email:

            user.email,


            photo:

            user.photoURL || null,


            dateCreation:

            serverTimestamp()


        }


    );



    return true;


}
