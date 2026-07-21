// ===============================
// GESTION CREATION PROFIL
// ===============================


import { db, auth } from "../firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// ===============================
// ELEMENTS HTML
// ===============================


const champNom = document.getElementById(
    "nomUtilisateur"
);


const boutonCreation = document.getElementById(
    "btnCreerProfil"
);


const message = document.getElementById(
    "messageProfil"
);






// ===============================
// VERIFICATION PROFIL EXISTANT
// ===============================


async function verifierProfil(){


    const user = auth.currentUser;


    if(!user){

        window.location.href = "accueil.html";

        return;

    }



    const reference = doc(

        db,

        "users",

        user.uid

    );



    const profil = await getDoc(

        reference

    );



    if(profil.exists()){


        window.location.href = "index.html";


    }


}






// ===============================
// CREATION PROFIL
// ===============================


async function creerProfil(){


    const user = auth.currentUser;



    if(!user){

        message.textContent =
        "Erreur : utilisateur non connecté";

        return;

    }




    const nom = champNom.value.trim();




    if(nom.length < 3){


        message.textContent =
        "Le nom doit contenir au moins 3 caractères";


        return;


    }




    try{



        boutonCreation.disabled = true;



        message.textContent =
        "Création du profil...";





        await setDoc(

            doc(

                db,

                "users",

                user.uid

            ),

            {


                nomUtilisateur: nom,


                email: user.email,


                photo: user.photoURL || null,


                dateCreation: serverTimestamp()


            }


        );





        message.textContent =
        "Profil créé avec succès";





        setTimeout(()=>{


            window.location.href =
            "index.html";


        },1000);




    }


    catch(error){



        console.error(

            "Erreur création profil :",

            error

        );



        message.textContent =
        "Impossible de créer le profil";



        boutonCreation.disabled = false;



    }



}






// ===============================
// EVENEMENT BOUTON
// ===============================


if(boutonCreation){


    boutonCreation.addEventListener(

        "click",

        creerProfil

    );


}







// ===============================
// AUTHENTIFICATION
// ===============================


onAuthStateChanged(

    auth,

    async(user)=>{


        if(user){


            await verifierProfil();


        }


        else{


            window.location.href =
            "accueil.html";


        }


    }

);
