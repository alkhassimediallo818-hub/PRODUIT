import {

    auth,

    connexionGoogle

} from "../firebase.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

    db

} from "../firebase.js";





const bouton =

document.getElementById(
    "btnConnexionAccueil"
);



const message =

document.getElementById(
    "messageAccueil"
);





if(bouton){


    bouton.addEventListener(

        "click",

        async()=>{


            try{


                message.textContent =
                "Connexion en cours...";



                const user =
                await connexionGoogle();




                const profil =

                await getDoc(

                    doc(

                        db,

                        "users",

                        user.uid

                    )

                );



                console.log(
    "Profil existe ?",
    profil.exists()
);

console.log(
    "UID =",
    user.uid
);


              if(profil.exists()){

    console.log(
        "Redirection vers index"
    );

    window.location.href =
    "index.html";

}
else{

    console.log(
        "Redirection vers profil"
    );

    window.location.href =
    "profil.html";

}


            catch(error){


                console.error(

                    "Erreur connexion :",

                    error

                );


                message.textContent =
                "Erreur de connexion";


            }


        }

    );


}



