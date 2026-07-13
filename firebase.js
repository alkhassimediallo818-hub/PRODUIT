import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBcJ8ghcBNxJ-VJNksHfUffDuM5ZzwZTXw",
  authDomain: "qassimedv.firebaseapp.com",
  projectId: "qassimedv",
  storageBucket: "qassimedv.firebasestorage.app",
  messagingSenderId: "908242149044",
  appId: "1:908242149044:web:ec03eb653461152645c1e1"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


window.connexionGoogle = async function(){

try{

const result =
await signInWithPopup(auth, provider);

alert(
"Connecté : " +
result.user.displayName
);

}catch(error){

alert(error.message);

}

}
