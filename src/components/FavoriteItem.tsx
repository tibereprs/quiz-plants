import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase-config";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";

interface FavoriteItemProps {
  userId: string;
  favorite: {
    id: string;
    planteId: string;
    dossierId: string;
    dossierNom: string;
    // autres champs si besoin
  };
}

async function getUserFavorites(userId: string) {
  const favRef = collection(db, "users", userId, "favorites-plants");
  const snapshot = await getDocs(favRef);
  const list = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return list;
}


export default function FavoriteItem({ userId, favorite }: FavoriteItemProps) {
  const [dossiers, setDossiers] = useState<{ id: string; nom: string }[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState(favorite.dossierId);

  // Charger dossiers pour select
  useEffect(() => {
    if (!userId) return;
    const fetchDossiers = async () => {
      const dossiersRef = collection(db, "users", userId, "dossiers");
      const snapshot = await getDocs(dossiersRef);
      const list: { id: string; nom: string }[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, nom: doc.data().nom }));
      setDossiers(list);
    };
    fetchDossiers();
  }, [userId]);

  const handleChangeDossier = async (newDossierId: string) => {
    if (!userId) return;

    setSelectedDossierId(newDossierId);

    // Trouver nom dossier pour sauvegarde
    const newDossier = dossiers.find((d) => d.id === newDossierId);
    if (!newDossier) return;

    // Mettre à jour favorite dans Firestore
    const favRef = doc(db, "users", userId, "favorites-plants", favorite.id);
    await updateDoc(favRef, {
    dossierId: newDossier.id,
    dossierNom: newDossier.nom,
    });

  };

  return (
    <div style={{ marginBottom: 10 }}>
      <span>{favorite.planteId}</span>
      <select
        value={selectedDossierId}
        onChange={(e) => handleChangeDossier(e.target.value)}
        style={{ marginLeft: 10 }}
      >
        {dossiers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
