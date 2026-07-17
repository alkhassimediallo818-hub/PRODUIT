// ===============================
// OUTILS ET SECURITE
// ===============================


export function utilisateurValide(auth, utilisateurConnecte){

    return (
        utilisateurConnecte === true &&
        auth.currentUser !== null
    );

}



export function nettoyerTexte(texte){

    if(typeof texte !== "string")
        return "";

    return texte
        .trim()
        .replace(/[<>]/g,"");

}



export function nombreValide(valeur){

    const nombre = Number(valeur);

    return Number.isFinite(nombre)
        ? nombre
        : 0;

}
