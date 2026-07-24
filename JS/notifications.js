// ===============================
// NOTIFICATIONS
// ===============================

import {

    db,
    auth

} from "../firebase.js";


import {

    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// VARIABLES
// ===============================

let notifications = [];


// ===============================
// GET
// ===============================

export function getNotifications(){

    return notifications;

}

// ===============================
// AFFICHER LISTE
// ===============================

export function afficherListeNotifications(

    notifications = []

){

    const liste =

    document.getElementById(

        "listeNotifications"

    );



    if(!liste)

        return;



    if(notifications.length === 0){

        liste.innerHTML =

        "Aucune notification";

        return;

    }



    liste.innerHTML = "";



    notifications.forEach(

        (notification)=>{

            liste.innerHTML += `

            <div class="notificationItem">

                <strong>

                ${notification.titre}

                </strong>

                <br>

                ${notification.message}

            </div>

            `;

        }

    );

}

// ===============================
// CREER NOTIFICATION
// ===============================

export async function creerNotification(

    titre,

    message,

    type = "info"

){

    if(!auth.currentUser){

        return false;

    }


    try{

        const notification = {

            userId:

            auth.currentUser.uid,

            titre,

            message,

            type,

            lu:false,

            date:

            serverTimestamp()

        };


        await addDoc(

            collection(

                db,

                "notifications"

            ),

            notification

        );


        return true;

    }

    catch(error){

        console.error(

            "Erreur notification :",

            error

        );

        return false;

    }

}
// ===============================
// CHARGER NOTIFICATIONS
// ===============================

export async function chargerNotifications(){

    if(!auth.currentUser){

        return [];

    }


    try{

        const q = query(

            collection(

                db,

                "notifications"

            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            ),

            orderBy(

                "date",

                "desc"

            )

        );


        const resultat =

        await getDocs(q);


        notifications = [];


        resultat.forEach(

            (doc)=>{

                notifications.push({

                    id:doc.id,

                    ...doc.data()

                });

            }

        );


        afficherNotifications();


        return notifications;

    }

    catch(error){

        console.error(

            error

        );

        return [];

    }

}
afficherListeNotifications(

    notifications

);


document.getElementById(

    "compteurNotifications"

).textContent =

notifications.length;
