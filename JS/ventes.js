// ===============================
// SUPPRIMER PRODUIT
// ===============================


export async function supprimerProduit(


    utilisateurConnecte,


    id


){



    if(


        !utilisateurValide(

            auth,

            utilisateurConnecte

        )

    )

    return false;





    try{



        const reference =

        doc(

            db,

            "produits",

            id

        );






        const resultat =

        await getDoc(

            reference

        );






        if(


            !resultat.exists()

            ||

            resultat.data().userId

            !==

            auth.currentUser.uid

        )

        return false;







        await deleteDoc(

            reference

        );






        produits =

        produits.filter(

            (produit)=>


            produit.id !== id


        );






        afficherProduits();






        return true;



    }


    catch(error){


        console.error(

            "Erreur suppression produit:",

            error

        );


        return false;



    }



}








// ===============================
// MODIFIER PRODUIT
// ===============================


export function modifierProduit(


    id


){



    const produit =

    produits.find(

        (p)=>p.id === id

    );






    if(!produit)

    return false;






    const champs = {



        nom:

        produit.nom || "",




        prixGros:

        produit.prixGros || "",




        nombreCartons:

        produit.nombreCartons || "",




        produitsParCarton:

        produit.produitsParCarton || "",




        prixRevente:

        produit.prixRevente || ""



    };







    Object.entries(champs)

    .forEach(([id,valeur])=>{



        const element =

        document.getElementById(

            id

        );



        if(element){


            element.value = valeur;


        }



    });







    produitModification = id;





    return true;



}








// ===============================
// ANNULER MODIFICATION
// ===============================


export function annulerModification(){



    produitModification = null;



}








// ===============================
// VIDER CHAMPS FORMULAIRE
// ===============================


export function viderChamps(){



    const champs = [


        "nom",


        "prixGros",


        "nombreCartons",


        "produitsParCarton",


        "prixRevente"



    ];






    champs.forEach((id)=>{



        const element =

        document.getElementById(

            id

        );






        if(element){


            element.value = "";


        }



    });



}








// ===============================
// NETTOYAGE LOCAL
// ===============================


export function nettoyerProduits(){



    produits = [];



    produitModification = null;



    afficherProduits();



}








// ===============================
// FIN MODULE
// ===============================


console.log(

    "Module produits chargé"

);
// ===============================
// OUVRIR FENETRE VENTE
// ===============================


export function vendreProduit(


    id,


    produits = []


){



    if(!Array.isArray(produits))

        return false;






    const produit =

    produits.find(

        (p)=>p.id === id

    );






    if(!produit)

        return false;






    produitVenteActuel = produit;







    const nom =

    document.getElementById(

        "nomProduitVente"

    );





    if(nom){



        nom.textContent =

        "Produit : "

        +

        produit.nom;



    }






    const quantite =

    document.getElementById(

        "quantiteVente"

    );





    if(quantite){



        quantite.value = "";



    }







    const modal =

    document.getElementById(

        "modalVente"

    );





    if(modal){



        modal.style.display =

        "block";



    }







    return true;



}








// ===============================
// CONFIRMER VENTE
// ===============================


export async function confirmerVente(


    utilisateurConnecte


){



    if(traitementVente)

        return false;






    if(

        !verifierUtilisateur(

            utilisateurConnecte

        )

    )

        return false;






    if(!produitVenteActuel){



        alert(

            "Aucun produit sélectionné"

        );



        return false;



    }







    try{



        traitementVente = true;






        const champ =

        document.getElementById(

            "quantiteVente"

        );





        const quantite =

        nombreValide(

            champ?.value

        );







        if(quantite <= 0){



            alert(

                "Quantité invalide"

            );



            return false;



        }







        const produitId =

        produitVenteActuel.id;







        const reference =

        doc(

            db,

            "produits",

            produitId

        );






        let vente = null;








        await runTransaction(



            db,



            async(transaction)=>{






                const produitSnap =

                await transaction.get(

                    reference

                );







                if(!produitSnap.exists())

                    throw new Error(

                        "Produit introuvable"

                    );







                const produit =

                produitSnap.data();








                if(

                    produit.userId

                    !==

                    auth.currentUser.uid

                ){



                    throw new Error(

                        "Accès refusé"

                    );



                }








                const stock =

                nombreValide(

                    produit.stockTotal

                );








                if(

                    quantite > stock

                ){



                    throw new Error(

                        "Stock insuffisant"

                    );



                }








                const prixRevente =

                nombreValide(

                    produit.prixRevente

                );







                const prixUnitaire =

                nombreValide(

                    produit.prixUnitaire

                );







                const benefice =



                Math.max(

                    0,

                    (

                        prixRevente

                        -

                        prixUnitaire

                    )

                    *

                    quantite

                );









                vente = {




                    userId:

                    auth.currentUser.uid,




                    produit:

                    nettoyerTexte(

                        produit.nom

                    )

                    || "Produit",






                    quantiteVendue:

                    quantite,






                    prixVente:

                    prixRevente,






                    montantTotal:

                    prixRevente

                    *

                    quantite,







                    benefice:

                    benefice,






                    statut:

                    "validée",






                    date:

                    serverTimestamp()



                };







                transaction.update(



                    reference,



                    {



                        stockTotal:

                        stock - quantite,





                        derniereVente:

                        serverTimestamp()



                    }



                );





            }



        );









        if(!vente)

            throw new Error(

                "Vente impossible"

            );








        await addDoc(



            collection(

                db,

                "ventes"

            ),



            vente



        );







        fermerVente();






        return true;






    }


    catch(error){



        console.error(

            "Erreur création vente:",

            error

        );



        alert(

            error.message

        );



        return false;



    }


    finally{



        traitementVente = false;



    }



}
// ===============================
// FERMER FENETRE VENTE
// ===============================


export function fermerVente(){



    const modal =

    document.getElementById(

        "modalVente"

    );





    if(modal){



        modal.style.display =

        "none";



    }







    const champ =

    document.getElementById(

        "quantiteVente"

    );





    if(champ){



        champ.value = "";



    }







    const nomProduit =

    document.getElementById(

        "nomProduitVente"

    );





    if(nomProduit){



        nomProduit.textContent =

        "Produit sélectionné";



    }







    produitVenteActuel = null;



}









// ===============================
// NETTOYAGE SESSION
// ===============================


export function viderVentes(){



    ventesGlobales = [];



    produitVenteActuel = null;



    traitementVente = false;





    afficherVentes();



}








// ===============================
// PRODUIT ACTUEL
// ===============================


export function getProduitVenteActuel(){



    return produitVenteActuel;



}








// ===============================
// TOTAL VENTES
// ===============================


export function calculerTotalVentes(){



    let total = 0;






    ventesGlobales.forEach((vente)=>{



        total +=

        nombreValide(

            vente.montantTotal

        );



    });






    return total;



}








// ===============================
// FIN MODULE
// ===============================


console.log(

    "Module ventes chargé"

);
