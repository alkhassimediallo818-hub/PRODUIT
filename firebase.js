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
// CONFIG FIREBASE
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





// ===============================
// EXPORTS FIREBASE
// ===============================


export {

    signInWithPopup,

    signOut,

    onAuthStateChanged

};
// ===============================
// CONNEXION GOOGLE
// ===============================


export async function connexionGoogle(){


    try{


        if(auth.currentUser){


            alert(

                "Vous êtes déjà connecté : " +

                auth.currentUser.displayName

            );


            return auth.currentUser;


        }



        const result =

        await signInWithPopup(

            auth,

            provider

        );



        const user =

        result.user;



        const info =

        document.getElementById(

            "userInfo"

        );



        if(info){


            info.innerHTML =

            "👤 " +

            user.displayName;


        }



        alert(

            "Connexion réussie : " +

            user.displayName

        );



        return user;


    }


    catch(error){


        console.error(

            "Erreur connexion:",

            error

        );


        alert(

            error.message

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



        const info =

        document.getElementById(

            "userInfo"

        );



        if(info){


            info.innerHTML =

            "Non connecté";


        }



        alert(

            "Déconnexion réussie"

        );


    }


    catch(error){


        console.error(

            "Erreur déconnexion:",

            error

        );


        alert(

            error.message

        );


    }


    }
