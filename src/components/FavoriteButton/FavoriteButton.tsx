import React, { useEffect, useState } from "react"; 
import { useAuth } from "../../context/AuthContext";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteDocId,
  getUserDossiers
} from "../../services/favorites-plants";
import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  plantId: string;
};

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ plantId }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [favoriteDocId, setFavoriteDocId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [dossier, setDossier] = useState('');
  const [dossiersList, setDossiersList] = useState<{id: string; nom: string}[]>([]);
  const [useNewDossier, setUseNewDossier] = useState(false);
  const [selectedDossierId, setSelectedDossierId] = useState<string>("");

  const cacheKeyFav = user ? `favCache_${user.uid}` : '';
  const cacheKeyDossiers = user ? `dossierCache_${user.uid}` : '';

  // Utilitaires cache local
  const loadFavCache = (): Record<string, string | null> => {
    try {
      return JSON.parse(localStorage.getItem(cacheKeyFav) || '{}');
    } catch {
      return {};
    }
  };

  const saveFavCache = (cache: Record<string, string | null>) => {
    localStorage.setItem(cacheKeyFav, JSON.stringify(cache));
  };

  const loadDossierCache = (): {id: string; nom: string}[] => {
    try {
      return JSON.parse(localStorage.getItem(cacheKeyDossiers) || '[]');
    } catch {
      return [];
    }
  };

  const saveDossierCache = (dossiers: {id: string; nom: string}[]) => {
    localStorage.setItem(cacheKeyDossiers, JSON.stringify(dossiers));
  };

  useEffect(() => {
    const checkFavoriteAndDossiers = async () => {
      if (!user) return;

      const favCache = loadFavCache();
      const favId = favCache[plantId];

      if (favId !== undefined) {
        setFavoriteDocId(favId);
        setIsFav(!!favId);
      } else {
        const freshId = await getFavoriteDocId(user.uid, plantId);
        favCache[plantId] = freshId;
        saveFavCache(favCache);
        setFavoriteDocId(freshId);
        setIsFav(!!freshId);
      }

      const cachedDossiers = loadDossierCache();
      if (cachedDossiers.length > 0) {
        setDossiersList(cachedDossiers);
        return;
      }

      const freshDossiers = await getUserDossiers(user.uid);
      setDossiersList(freshDossiers);
      saveDossierCache(freshDossiers);

      if (freshDossiers.length === 0) {
        setUseNewDossier(true);
      }
    };

    checkFavoriteAndDossiers();
  }, [user, plantId]);

  const handleConfirm = async () => {
    const isUsingNew = useNewDossier || dossiersList.length === 0;
    let dossierNom = "";

    if (isUsingNew) {
      if (!dossier.trim()) {
        alert("Veuillez saisir un nom de dossier valide.");
        return;
      }
      dossierNom = dossier.trim();
    } else {
      const dossierObj = dossiersList.find(d => d.id === selectedDossierId);
      if (!dossierObj) {
        alert("Veuillez choisir un dossier ou créer un nouveau.");
        return;
      }
      dossierNom = dossierObj.nom;
    }

    if (!user) return;

    await addToFavorites(user.uid, plantId, dossierNom);

    const favId = await getFavoriteDocId(user.uid, plantId);
    setFavoriteDocId(favId);
    setIsFav(true);

    const favCache = loadFavCache();
    favCache[plantId] = favId;
    saveFavCache(favCache);

    const updatedDossiers = await getUserDossiers(user.uid);
    setDossiersList(updatedDossiers);
    saveDossierCache(updatedDossiers);

    setDossier('');
    setSelectedDossierId('');
    setUseNewDossier(false);
    setShowPopup(false);
  };

  const handleToggleFavorite = async () => {
    if (!user) return;

    const favCache = loadFavCache();

    if (isFav && favoriteDocId) {
      await removeFromFavorites(user.uid, favoriteDocId);
      setIsFav(false);
      setFavoriteDocId(null);
      favCache[plantId] = null;
    } else {
      await addToFavorites(user.uid, plantId);
      const favId = await getFavoriteDocId(user.uid, plantId);
      setFavoriteDocId(favId);
      setIsFav(true);
      favCache[plantId] = favId;
    }

    saveFavCache(favCache);
  };

  const handleButtonClick = () => {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter aux favoris.");
      return;
    }

    if (isFav) {
      handleToggleFavorite();
    } else {
      setShowPopup(true);
      setUseNewDossier(false);
      setDossier('');
      setSelectedDossierId('');
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__new") {
      setUseNewDossier(true);
      setDossier('');
      setSelectedDossierId('');
    } else {
      setUseNewDossier(false);
      setSelectedDossierId(val);
      setDossier('');
    }
  };

  const handleCancel = () => {
    setDossier('');
    setSelectedDossierId('');
    setUseNewDossier(false);
    setShowPopup(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button className={styles.button} onClick={handleButtonClick}>
        {isFav ? "💚 Favori" : "🤍 Ajouter aux favoris"}
      </button>

      {showPopup && (
        <div className={styles.modal}>
          <h3>Ajouter au dossier</h3>

          {dossiersList.length > 0 && (
            <select
              onChange={handleSelectChange}
              value={useNewDossier ? "__new" : selectedDossierId}
            >
              <option value="">-- Choisir un dossier --</option>
              {dossiersList.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
              <option value="__new">+ Créer un nouveau dossier</option>
            </select>
          )}

          {(useNewDossier || dossiersList.length === 0) && (
            <input
              type="text"
              placeholder="Nom du dossier"
              value={dossier}
              onChange={(e) => setDossier(e.target.value)}
              autoFocus
            />
          )}

          <div className={styles.modalButtons}>
            <button onClick={handleConfirm} disabled={useNewDossier && !dossier.trim()}>
              Confirmer
            </button>
            <button onClick={handleCancel}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;
