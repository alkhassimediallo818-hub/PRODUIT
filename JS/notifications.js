// ===============================
// SYSTEME NOTIFICATIONS
// ===============================


export function afficherNotification(
    message,
    type = "info"
){

    const container =
    document.getElementById(
        "notificationContainer"
    );


    if(!container){

        console.warn(
            "Container notification introuvable"
        );

        return;

    }



    const notification =
    document.createElement(
        "div"
    );


    notification.className =
    "notification " + type;



    notification.textContent =
    message;



    container.appendChild(
        notification
    );



    setTimeout(()=>{


        notification.classList.add(
            "disparaitre"
        );


        setTimeout(()=>{


            notification.remove();


        },500);



    },3000);


}



console.log(
"Module notifications chargé"
);
