import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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


const firebaseConfig = {
apiKey: "AIzaSyBcJ8ghcBNxJ-VJNksHfUffDuM5ZzwZTXw",
authDomain: "qassimedv.firebaseapp.com",
projectId: "qassimedv",
storageBucket: "qassimedv.firebasestorage.app",
messagingSenderId: "908242149044",
appId: "1:908242149044:web:ec03eb653461152645c1e1"
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();


export {
signInWithPopup,
signOut,
onAuthStateChanged
};



window.connexionGoogle = async function () {

try {


    if (auth.currentUser) {


        alert(
            "Vous êtes déjà connecté : " +
            auth.currentUser.displayName
        );


        return;

    }



    const result =
        await signInWithPopup(auth, provider);



    const user = result.user;



    console.log(
        "Utilisateur connecté :",
        user
    );



    const info =
        document.getElementById("userInfo");



    if (info) {


        info.innerHTML =
            "👤 " + user.displayName;


    }



    alert(
        "Connexion réussie : " +
        user.displayName
    );



}

catch (error) {


    console.error(
        "Erreur Google :",
        error
    );


    alert(
        "Erreur Google : " +
        error.code +
        "\n" +
        error.message
    );


}

};





window.deconnexionGoogle = async function () {

try {


    await signOut(auth);


    const info =
        document.getElementById("userInfo");



    if (info) {


        info.innerHTML =
            "Non connecté";


    }


    alert("Déconnexion réussie");


}

catch (error) {


    console.error(error);


    alert(error.message);


}

};





onAuthStateChanged(auth, (user) => {


const info =
    document.getElementById("userInfo");



if (!info) return;



if (user) {


    info.innerHTML =
        "👤 " + user.displayName;


}

else {


    info.innerHTML =
        "Non connecté";


}


});
