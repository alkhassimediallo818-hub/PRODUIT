// ===============================
// FIREBASE CONFIGURATION
// ===============================


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
// SERVICES
// ===============================


export const db =
getFirestore(app);


export const auth =
getAuth(app);


export const provider =
new GoogleAuthProvider();
auth.languageCode = "fr";



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
// DECONNEXION GOOGLE
// ===============================


export async function deconnexionGoogle(){


    try{


        await signOut(auth);


        return true;


    }


    catch(error){


        console.error(

            "Erreur déconnexion Google :",

            error

        );


        return false;


    }


}
