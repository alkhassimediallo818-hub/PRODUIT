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


    return (

        utilisateurConnecte === true &&

        auth &&

        auth.currentUser !== null

    );


}





// ===============================
// NETTOYAGE TEXTE
// ===============================


export function nettoyerTexte(
    texte
){


    if(typeof texte !== "string")

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



    return Number.isFinite(nombre)

        ? nombre

        : 0;


}
