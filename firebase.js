// ===============================
// FIREBASE CONFIGURATION
// ===============================

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";



import {

    getAuth,

    GoogleAuthProvider,

    signInWithPopup,

    signOut,

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



import {

    getFirestore

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";






// ===============================
// CONFIGURATION FIREBASE
// ===============================


const firebaseConfig = {


    apiKey:

    "AIzaSyBcJ8ghcBNxJ-VJNksHfUffDuM5ZzwZTXw",



    authDomain:

    "qassimedv.firebaseapp.com",



    projectId:

    "qassimedv",



    storageBucket:

    "qassimedv.firebasestorage.app",



    messagingSenderId:

    "908242149044",



    appId:

    "1:908242149044:web:ec03eb653461152645c1e1"



};






// ===============================
// INITIALISATION
// ===============================


const app = initializeApp(

    firebaseConfig

);






// ===============================
// SERVICES FIREBASE
// ===============================


export const db =

getFirestore(app);





export const auth =

getAuth(app);





export const provider =

new GoogleAuthProvider();





auth.languageCode = "fr";







// ===============================
// CONFIGURATION GOOGLE
// ===============================


provider.setCustomParameters({


    prompt:

    "select_account"


});







// ===============================
// CONNEXION GOOGLE
// ===============================

export async function creerProfilUtilisateur(user){

    const reference = doc(
        db,
        "users",
        user.uid
    );


    const profil = await getDoc(
        reference
    );


    if(!profil.exists()){


        await setDoc(

            reference,

            {

                nomUtilisateur:
                user.displayName || "Utilisateur",


                email:
                user.email,


                photo:
                user.photoURL || "",


                role:
                "admin",


                dateCreation:
                serverTimestamp()

            }

        );


    }

}



export async function connexionGoogle(){


    try{


        if(auth.currentUser){


            console.log(

                "Utilisateur déjà connecté :",

                auth.currentUser.email

            );


            return auth.currentUser;


        }




        const resultat =

        await signInWithPopup(

            auth,

            provider

        );





        console.log(

            "Connexion réussie :",

            resultat.user.email

        );





        return resultat.user;



    }


    catch(error){



        console.error(

            "Erreur connexion Google :",

            error

        );



        throw error;



    }


}







// ===============================
// VERIFICATION SESSION
// ===============================


export function verifierConnexionGoogle(){


    return new Promise((resolve)=>{


        const unsubscribe =

        onAuthStateChanged(

            auth,

            (user)=>{



                unsubscribe();



                if(user){


                    console.log(

                        "Session Firebase active :",

                        user.email

                    );



                    resolve(user);



                }


                else{


                    console.log(

                        "Aucune session Firebase"

                    );



                    resolve(null);



                }


            }


        );


    });



}








// ===============================
// DECONNEXION
// ===============================


export async function deconnexionGoogle(){


    try{


        await signOut(auth);



        console.log(

            "Utilisateur déconnecté"

        );



        return true;



    }


    catch(error){


        console.error(

            "Erreur déconnexion :",

            error

        );



        return false;



    }


}






// ===============================
// EXPORT AUTH STATE
// ===============================


export {

    onAuthStateChanged

};
