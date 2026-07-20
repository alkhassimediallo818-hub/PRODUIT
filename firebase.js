// ===============================
// FIREBASE CONFIGURATION
// ===============================


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
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
// INITIALISATION FIREBASE
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
// CONFIG GOOGLE
// ===============================


provider.setCustomParameters({

    prompt: "select_account"

});




// ===============================
// CONNEXION GOOGLE
// ===============================


export async function connexionGoogle(){


    try{


        if(auth.currentUser){


            return auth.currentUser;


        }



        await signInWithRedirect(

            auth,

            provider

        );



    }


    catch(error){


        console.error(

            "Erreur lancement connexion Google :",

            error

        );


        throw error;


    }


}




// ===============================
// VERIFICATION RETOUR GOOGLE
// ===============================


export async function verifierConnexionGoogle(){


    try{


        const resultat =

        await getRedirectResult(auth);



        if(resultat){


            console.log(

                "Connexion Google réussie :",

                resultat.user.email

            );



            return resultat.user;


        }



        return null;


    }


    catch(error){


        console.error(

            "Erreur retour Google :",

            error

        );


        return null;


    }


}




// ===============================
// DECONNEXION GOOGLE
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
