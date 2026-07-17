// ===============================
// OUTILS ET SECURITE
// ===============================



// ===============================
// VERIFICATION UTILISATEUR
// ===============================


export function utilisateurValide(
    auth,
    utilisateurConnecte
){


    return Boolean(

        utilisateurConnecte === true

        &&

        auth

        &&

        auth.currentUser

    );


}




// ===============================
// NETTOYAGE TEXTE
// ===============================


export function nettoyerTexte(
    texte
){


    if(
        typeof texte !== "string"
    )

        return "";



    return texte

        .trim()

        .replace(/[<>]/g,"")

        .replace(/\s+/g," ");



}




// ===============================
// VALIDATION NOMBRE
// ===============================


export function nombreValide(
    valeur
){


    const nombre =
    Number(valeur);



    if(
        Number.isFinite(nombre)
    )

        return nombre;



    return 0;


}




// ===============================
// VALIDATION POSITIVE
// ===============================


export function nombrePositif(
    valeur
){


    const nombre =
    nombreValide(valeur);



    return nombre > 0
        ? nombre
        : 0;


}




// ===============================
// VERIFICATION TEXTE VIDE
// ===============================


export function texteValide(
    texte
){


    return (

        typeof texte === "string"

        &&

        texte.trim().length > 0

    );


}




// ===============================
// FORMAT ARGENT
// ===============================


export function formaterArgent(
    montant
){


    return (

        nombreValide(montant)

        .toLocaleString("fr-FR")

        +

        " FCFA"

    );


}
