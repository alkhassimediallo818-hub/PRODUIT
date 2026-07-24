// ===============================
// NOTIFICATIONS
// ===============================


import {

    db,
    auth

} from "../firebase.js";

import {

    doc,
    updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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



export async function marquerNotificationLue(

    id

){


    if(!auth.currentUser)

        return false;



    try{


        await updateDoc(

            doc(

                db,

                "notifications",

                id

            ),

            {

                lu:true

            }

        );


        return true;


    }


    catch(error){


        console.error(

            "Erreur lecture notification :",

            error

        );


        return false;


    }


}


// ===============================
// AFFICHER LISTE NOTIFICATIONS
// ===============================


export function afficherListeNotifications(

    listeNotifications = []

){


    const liste =

    document.getElementById(

        "listeNotifications"

    );



    if(!liste)

        return;




    if(listeNotifications.length === 0){


        liste.innerHTML =

        "Aucune notification";


        return;


    }





    liste.innerHTML = "";





    listeNotifications.forEach(

        (notification)=>{


            liste.innerHTML += `


            <div class="notificationItem ${notification.type || "info"}">


                <strong>

                ${notification.titre || "Notification"}

                </strong>


                <br>


                ${notification.message || ""}



            </div>


            `;



        }

    );



}




export async function changerEtatNotifications(

    actif

){


    if(!auth.currentUser)

        return false;



    try{


        await updateDoc(

            doc(

                db,

                "users",

                auth.currentUser.uid

            ),

            {


                notificationsActives:

                actif


            }

        );


        return true;


    }


    catch(error){


        console.error(

            "Erreur réglage notifications :",

            error

        );


        return false;


    }


}


// ===============================
// AFFICHAGE COMPTEUR
// ===============================


function mettreAJourCompteurNotifications(){


    const compteur =

    document.getElementById(

        "compteurNotifications"

    );



    if(!compteur)

        return;




    compteur.textContent =

    notifications.length;



}








// ===============================
// CREER NOTIFICATION
// ===============================


export async function creerNotification(


    titre,


    message,


    type = "info"


){



    if(!auth.currentUser)

        return false;





    try{



        await addDoc(



            collection(

                db,

                "notifications"

            ),



            {


                userId:

                auth.currentUser.uid,



                titre,



                message,



                type,



                lu:false,



                date:

                serverTimestamp()



            }



        );





        return true;



    }



    catch(error){



        console.error(


            "Erreur création notification :",


            error


        );



        return false;



    }



}









// ===============================
// CHARGER NOTIFICATIONS
// ===============================


export async function chargerNotifications(){



    if(!auth.currentUser)

        return [];





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

            (docSnap)=>{



                notifications.push({


                    id:

                    docSnap.id,



                    ...docSnap.data()



                });



            }


        );







       afficherListeNotifications(

    notifications

);



// ===============================
// COMPTEUR NOTIFICATIONS NON LUES
// ===============================


const nonLues =

notifications.filter(

    (notification)=>{

        return notification.lu !== true;

    }

).length;



const compteur =

document.getElementById(

    "compteurNotifications"

);



if(compteur){


    compteur.textContent = nonLues;


}





        mettreAJourCompteurNotifications();







        return notifications;




    }



    catch(error){



        console.error(


            "Erreur chargement notifications :",


            error


        );



        return [];



    }



}







console.log(

"Module notifications chargé"

);
