// ===============================
// CORBEILLE
// ===============================

import {

    db,
    auth

} from "../firebase.js";


import {

    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// VARIABLES
// ===============================

let elementsCorbeille = [];


// ===============================
// GET
// ===============================

export function getCorbeille(){

    return elementsCorbeille;

}


// ===============================
// RECHERCHE
// ===============================

export function rechercherCorbeille(

    texte = ""

){

    texte =

    texte

    .toLowerCase()

    .trim();


    if(

        texte === ""

    ){

        afficherCorbeille(

            elementsCorbeille

        );

        return;

    }


    const resultat =

    elementsCorbeille.filter(

        (element)=>{


            const nom =

            (

                element.donnees.nom ||

                ""

            )

            .toLowerCase();


            return nom.includes(

                texte

            );


        }

    );


    afficherCorbeille(

        resultat

    );

}


// ===============================
// CHARGEMENT
// ===============================

export async function chargerCorbeille(){


    if(

        !auth.currentUser

    )

    return [];



    try{


        const q =

        query(

            collection(

                db,

                "corbeille"

            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            ),

            orderBy(

                "dateSuppression",

                "desc"

            )

        );


        const resultat =

        await getDocs(

            q

        );


        elementsCorbeille = [];


        resultat.forEach(

            (docSnap)=>{


                elementsCorbeille.push({

                    id:

                    docSnap.id,

                    ...docSnap.data()

                });


            }

        );


        afficherCorbeille(

            elementsCorbeille

        );


        mettreAJourCompteurCorbeille();


        return elementsCorbeille;


    }


    catch(error){


        console.error(

            "Erreur chargement corbeille :",

            error

        );


        return [];


    }


}


// ===============================
// AFFICHAGE
// ===============================

export function afficherCorbeille(

    elements = []

){

    const zone =

    document.getElementById(

        "listeCorbeille"

    );


    if(

        !zone

    )

    return;


    if(

        elements.length === 0

    ){

        zone.innerHTML =

        `

        <div class="vide">

        Aucune donnée dans la corbeille.

        </div>

        `;

        return;

    }


    zone.innerHTML = "";


    elements.forEach(

        (element)=>{


            zone.innerHTML += `

            <div class="elementCorbeille">

                <div>

                    <strong>

                    ${element.donnees.nom || "Produit"}

                    </strong>

                </div>

                <div>

                    Type :

                    ${element.type}

                </div>

                <div>

                    Date :

                    ${

                        element.dateSuppression?.toDate

                        ?

                        element.dateSuppression

                        .toDate()

                        .toLocaleString("fr-FR")

                        :

                        "-"

                    }

                </div>

                <br>

                <button

                onclick="restaurerElement('${element.id}')"

                >

                Restaurer

                </button>

                <button

                onclick="supprimerDefinitivement('${element.id}')"

                >

                Supprimer

                </button>

            </div>

            `;


        }

    );

}


// ===============================
// COMPTEUR
// ===============================

export function mettreAJourCompteurCorbeille(){

    const compteur =

    document.getElementById(

        "compteurCorbeille"

    );


    if(

        compteur

    ){

        compteur.textContent =

        elementsCorbeille.length;

    }

}
// ===============================
// ENVOYER DANS LA CORBEILLE
// ===============================

export async function envoyerCorbeille(

    type,

    donnees

){

    if(!auth.currentUser)

        return false;


    try{

        await addDoc(

            collection(

                db,

                "corbeille"

            ),

            {

                userId:

                auth.currentUser.uid,

                type,

                donnees,

                dateSuppression:

                serverTimestamp()

            }

        );

        return true;

    }

    catch(error){

        console.error(

            "Erreur envoi corbeille :",

            error

        );

        return false;

    }

}



// ===============================
// RESTAURER ELEMENT
// ===============================

export async function restaurerElement(

    id

){

    try{

        const reference =

        doc(

            db,

            "corbeille",

            id

        );


        const resultat =

        await getDoc(

            reference

        );


        if(

            !resultat.exists()

        )

        return false;


        const element =

        resultat.data();


        await setDoc(

            doc(

                db,

                element.type,

                element.donnees.id

            ),

            element.donnees

        );


        await deleteDoc(

            reference

        );


        await chargerCorbeille();


        return true;

    }

    catch(error){

        console.error(

            "Erreur restauration :",

            error

        );

        return false;

    }

}



// ===============================
// SUPPRESSION DEFINITIVE
// ===============================

export async function supprimerDefinitivement(

    id

){

    try{

        await deleteDoc(

            doc(

                db,

                "corbeille",

                id

            )

        );


        await chargerCorbeille();


        return true;

    }

    catch(error){

        console.error(

            "Erreur suppression définitive :",

            error

        );

        return false;

    }

}



// ===============================
// VIDER LA CORBEILLE
// ===============================

export async function viderCorbeille(){

    try{

        const q =

        query(

            collection(

                db,

                "corbeille"

            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )

        );


        const resultat =

        await getDocs(

            q

        );


        for(

            const documentCorbeille

            of

            resultat.docs

        ){

            await deleteDoc(

                documentCorbeille.ref

            );

        }


        elementsCorbeille = [];


        afficherCorbeille(

            []

        );


        mettreAJourCompteurCorbeille();


        return true;

    }

    catch(error){

        console.error(

            "Erreur vidage corbeille :",

            error

        );

        return false;

    }

}
// ===============================
// NOTIFICATIONS (OPTIONNEL)
// ===============================

import {

    creerNotification

} from "./notifications.js";

import {

    enregistrerHistorique

} from "./historique.js";



// ===============================
// RESTAURATION COMPLETE
// ===============================

export async function restaurerElementConfirme(

    id

){

    if(

        !confirm(

            "Restaurer cet élément ?"

        )

    ){

        return false;

    }


    const succes =

    await restaurerElement(

        id

    );


    if(

        succes

    ){

        await creerNotification(

            "Corbeille",

            "Élément restauré avec succès.",

            "success"

        );


        await enregistrerHistorique(

            true,

            "Restauration",

            "Élément restauré"

        );

    }


    return succes;

}



// ===============================
// SUPPRESSION DEFINITIVE COMPLETE
// ===============================

export async function supprimerDefinitivementConfirme(

    id

){

    if(

        !confirm(

            "Cette suppression est définitive. Continuer ?"

        )

    ){

        return false;

    }


    const succes =

    await supprimerDefinitivement(

        id

    );


    if(

        succes

    ){

        await creerNotification(

            "Corbeille",

            "Élément supprimé définitivement.",

            "warning"

        );


        await enregistrerHistorique(

            true,

            "Suppression définitive",

            "Corbeille"

        );

    }


    return succes;

}



// ===============================
// VIDER CORBEILLE COMPLETE
// ===============================

export async function viderCorbeilleComplete(){

    if(

        !confirm(

            "Vider complètement la corbeille ?"

        )

    ){

        return false;

    }


    const succes =

    await viderCorbeille();


    if(

        succes

    ){

        await creerNotification(

            "Corbeille",

            "La corbeille a été vidée.",

            "warning"

        );


        await enregistrerHistorique(

            true,

            "Vidage corbeille",

            "Tous les éléments"

        );

    }


    return succes;

}



// ===============================
// EXPORT JSON
// ===============================

export function exporterCorbeille(){

    const blob =

    new Blob(

        [

            JSON.stringify(

                elementsCorbeille,

                null,

                2

            )

        ],

        {

            type:

            "application/json"

        }

    );


    const url =

    URL.createObjectURL(

        blob

    );


    const lien =

    document.createElement(

        "a"

    );


    lien.href =

    url;


    lien.download =

    "corbeille.json";


    lien.click();


    URL.revokeObjectURL(

        url

    );

}



// ===============================
// ACTUALISER
// ===============================

export async function actualiserCorbeille(){

    return await chargerCorbeille();

}



// ===============================
// FONCTIONS GLOBALES
// ===============================

window.restaurerElement =

restaurerElementConfirme;


window.supprimerDefinitivement =

supprimerDefinitivementConfirme;


window.viderCorbeille =

viderCorbeilleComplete;


window.exporterCorbeille =

exporterCorbeille;



console.log(

    "Module corbeille chargé"

);
