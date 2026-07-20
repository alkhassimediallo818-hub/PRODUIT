// ===============================
// HISTORIQUE
// ===============================


import {

    db,
    auth

} from "../firebase.js";



import {

    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

    nettoyerTexte,
    utilisateurValide

} from "./utils.js";






// ===============================
// VARIABLES
// ===============================


let historiqueGlobal = [];






// ===============================
// GET HISTORIQUE
// ===============================


export function getHistorique(){


    return historiqueGlobal;


}






// ===============================
// ENREGISTRER HISTORIQUE
// ===============================


export async function enregistrerHistorique(

    utilisateurConnecte,

    type,

    produit

){


    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;




    try{


        const nouvelleAction = {


            userId:

            auth.currentUser.uid,



            type:

            nettoyerTexte(type)

            ||

            "action",



            produit:

            nettoyerTexte(produit)

            ||

            "Inconnu",



            date:

            serverTimestamp()


        };





        await addDoc(

            collection(

                db,

                "historique"

            ),

            nouvelleAction

        );




        return true;



    }


    catch(error){


        console.error(

            "Erreur enregistrement historique:",

            error

        );



        return false;


    }


}
// ===============================
// CHARGER HISTORIQUE
// ===============================


export async function chargerHistorique(

    utilisateurConnecte

){


    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return [];




    try{


        const q = query(


            collection(

                db,

                "historique"

            ),



            where(

                "userId",

                "==",

                auth.currentUser.uid

            )


        );




        const snapshot =

        await getDocs(q);




        historiqueGlobal = [];




        snapshot.forEach((docSnap)=>{



            historiqueGlobal.push({


                id:

                docSnap.id,



                ...docSnap.data()



            });



        });





        afficherHistorique(

            historiqueGlobal

        );




        return historiqueGlobal;



    }


    catch(error){



        console.error(


            "Erreur chargement historique:",


            error


        );



        historiqueGlobal = [];



        return [];



    }


}






// ===============================
// AFFICHER HISTORIQUE
// ===============================


export function afficherHistorique(

    historique = []

){



    const tableau =

    document.getElementById(

        "tableauHistorique"

    );




    if(!tableau)

    return;




    tableau.innerHTML = "";




    historique.forEach((action)=>{



        const ligne =

        document.createElement(

            "tr"

        );




        let date =

        "Date inconnue";





        if(

            action.date

            &&

            typeof action.date.toDate === "function"

        ){



            date =

            action.date

            .toDate()

            .toLocaleString();



        }





        ligne.innerHTML = `


            <td>

                ${action.type || "Action"}

            </td>



            <td>

                ${action.produit || "Produit"}

            </td>



            <td>

                ${date}

            </td>


        `;




        tableau.appendChild(

            ligne

        );



    });



}
// ===============================
// SUPPRIMER HISTORIQUE
// ===============================


export async function viderHistorique(

    utilisateurConnecte

){


    if(

        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;




    const confirmation = confirm(

        "Supprimer tout l'historique ?"

    );




    if(!confirmation)

    return false;





    try{


        const q = query(



            collection(

                db,

                "historique"

            ),



            where(

                "userId",

                "==",

                auth.currentUser.uid

            )


        );





        const snapshot =

        await getDocs(q);





        const suppressions = [];





        snapshot.forEach((element)=>{



            suppressions.push(



                deleteDoc(



                    doc(

                        db,

                        "historique",

                        element.id

                    )



                )



            );



        });







        await Promise.all(

            suppressions

        );





        historiqueGlobal = [];





        afficherHistorique(

            []

        );





        return true;



    }


    catch(error){



        console.error(



            "Erreur suppression historique:",



            error



        );



        return false;



    }


}
