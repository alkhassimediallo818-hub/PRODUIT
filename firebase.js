// ===============================
// FIREBASE CONFIGURATION
// ===============================


// ===============================
// IMPORTS
// ===============================


import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";



import {

    getAuth,

    GoogleAuthProvider,

    signInWithPopup,

    signOut,

    browserLocalPersistence,

    setPersistence,

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



import {

    getFirestore

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";





// ===============================
// CONFIGURATION
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


const app =

initializeApp(firebaseConfig);






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
// PARAMETRES GOOGLE
// ===============================


provider.setCustomParameters({

    prompt: "select_account"

});






// ===============================
// PERSISTANCE SESSION
// ===============================


setPersistence(

    auth,

    browserLocalPersistence

)

.catch((error)=>{


    console.error(

        "Erreur persistence Firebase:",

        error

    );


});







// ===============================
// CONNEXION GOOGLE
// ===============================


export async function connexionGoogle(){


    try{



        if(auth.currentUser){


            return auth.currentUser;


        }






        const resultat =

        await signInWithPopup(

            auth,

            provider

        );






        console.log(

            "Connexion réussie:",

            resultat.user.email

        );






        return resultat.user;





    }


    catch(error){



        console.error(

            "Erreur connexion Google:",

            error

        );



        throw error;



    }


}







// ===============================
// VERIFICATION CONNEXION
// ===============================


export function verifierConnexionGoogle(){


    if(auth.currentUser){



        console.log(

            "Utilisateur actif:",

            auth.currentUser.email

        );



        return auth.currentUser;



    }





    console.log(

        "Aucun utilisateur Firebase"

    );



    return null;



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

            "Erreur déconnexion:",

            error

        );



        return false;



    }


}






// ===============================
// EXPORT
// ===============================


export {

    onAuthStateChanged

};
