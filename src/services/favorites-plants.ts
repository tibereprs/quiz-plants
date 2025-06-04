import { doc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { collection, query, getDocs, where } from "firebase/firestore";


export async function addToFavorites(userId: string, plantId: string, dossierName?: string) {
  console.log("📥 Appel addToFavorites:", { userId, plantId, dossierName });

  if (!userId || !plantId) return;

  const dossierNom = dossierName?.trim() || 'non classé';


  // Référence à la collection dossiers de l'utilisateur
  const dossiersRef = collection(db, "users", userId, "dossiers");

  // Vérifie si le dossier existe déjà
  const q = query(dossiersRef, where("nom", "==", dossierNom));
  const snapshot = await getDocs(q);

  let dossierId: string;

  if (snapshot.empty) {
    // Crée le dossier s'il n'existe pas
    const docRef = await addDoc(dossiersRef, { nom: dossierNom, createdAt: new Date() });
    dossierId = docRef.id;
  } else {
    dossierId = snapshot.docs[0].id;
  }

  // Pour gérer plusieurs favoris sur même plante dans différents dossiers, on génère un nouvel id
  const favoritesRef = collection(db, "users", userId, "favorites-plants");

await addDoc(favoritesRef, {
  idPlante: plantId,
  dateAjout: new Date(),
  dossierId,
  dossierNom,
});
}

export async function removeFromFavorites(userId: string, favoriteDocId: string) {
  if (!userId || !favoriteDocId) return;
  const ref = doc(db, "users", userId, "favorites-plants", favoriteDocId);
  await deleteDoc(ref);
}

export async function isFavorite(userId: string, plantId: string) {
  if (!userId || !plantId) {
    console.warn("userId or plantId is undefined", { userId, plantId });
    return false;
  }
  const favoritesRef = collection(db, "users", userId, "favorites-plants");
  const q = query(favoritesRef, where("idPlante", "==", plantId));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function getUserDossiers(userId: string): Promise<{ id: string, nom: string }[]> {
  if (!userId) return [];
  const dossiersRef = collection(db, "users", userId, "dossiers");
  const snapshot = await getDocs(dossiersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, nom: doc.data().nom }));
}

export async function getFavoriteDocId(userId: string, plantId: string): Promise<string | null> {
  if (!userId || !plantId) return null;
  const favoritesRef = collection(db, "users", userId, "favorites-plants");
  const q = query(favoritesRef, where("idPlante", "==", plantId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }
  return null;
}
