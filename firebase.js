import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
        GoogleAuthProvider,
            signInWithPopup,
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


                                // Firestore
                                export const db = getFirestore(app);


                                // Auth Google
                                const auth = getAuth(app);

                                const provider = new GoogleAuthProvider();



                                window.connexionGoogle = async function(){


                                try {


                                const user = auth.currentUser;


                                // Si déjà connecté
                                if(user){

                                alert("Vous êtes déjà connecté : " + user.displayName);
                                return;

                                }


                                // Nouvelle connexion Google

                                const result = await signInWithPopup(auth, provider);


                                alert(
                                "Connecté : " + result.user.displayName
                                );


                                }
                                catch(error){


                                console.error(error);

                                alert(error.message);


                                }


                                };



                                // Surveillance de connexion

                                onAuthStateChanged(auth, (user)=>{


                                if(user){

                                console.log(
                                "Utilisateur connecté :",
                                user.displayName
                                );


                                }else{

                                console.log(
                                "Aucun utilisateur connecté"
                                );


                                }


                                });