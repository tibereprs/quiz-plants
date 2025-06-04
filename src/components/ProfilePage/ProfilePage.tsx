import React, { useEffect, useState } from "react";
import { useAuth } from "./../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "../../firebase/firebase-config";
import styles from './ProfilePage.module.css';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

interface Dossier {
  id: string;
  nom: string;
}

// Fonction utilitaire pour mettre à jour le cache localStorage
const updateDossierCache = (dossiers: Dossier[], uid: string) => {
  localStorage.setItem(`dossierCache_${uid}`, JSON.stringify(dossiers));
  localStorage.setItem(`dossierCacheVersion_${uid}`, Date.now().toString());
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [newDossierName, setNewDossierName] = useState("");

  // Modale renommer
  const [modalVisible, setModalVisible] = useState(false);
  const [dossierToEdit, setDossierToEdit] = useState<Dossier | null>(null);
  const [editingDossierName, setEditingDossierName] = useState("");

  // changer mdp
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);



  const handlePasswordChange = async () => {
    if (!auth.currentUser) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Erreur : Tous les champs doivent être remplis.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Erreur : Les mots de passe ne correspondent pas.");
      return;
    }

    setLoadingPassword(true);
    setPasswordMessage("");

    try {
      // Ré-authentification avec le mot de passe actuel
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Mise à jour du mot de passe
      await updatePassword(auth.currentUser, newPassword);

      setPasswordMessage("Mot de passe mis à jour avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Fermer la modale après 2 secondes
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 2000);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setPasswordMessage("Erreur : Mot de passe actuel incorrect.");
      } else {
        setPasswordMessage("Erreur : " + error.message);
      }
    } finally {
      setLoadingPassword(false);
    }
  };




  // Charger les dossiers user + mise à jour cache localStorage
  const fetchDossiers = async () => {
    if (!user) return;
    const dossiersRef = collection(db, "users", user.uid, "dossiers");
    const snapshot = await getDocs(dossiersRef);
    const dossiersList: Dossier[] = [];
    snapshot.forEach((doc) => {
      dossiersList.push({ id: doc.id, nom: doc.data().nom });
    });
    setDossiers(dossiersList);

    updateDossierCache(dossiersList, user.uid);
  };

  useEffect(() => {
    if (!user) return;
    fetchDossiers();
  }, [user]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Créer un nouveau dossier + mise à jour cache
  const createDossier = async () => {
    if (!newDossierName.trim()) return alert("Nom du dossier vide");
    if (!user) return;

    const dossiersRef = collection(db, "users", user.uid, "dossiers");
    await addDoc(dossiersRef, {
      nom: newDossierName.trim(),
      dateCreation: new Date(),
    });
    setNewDossierName("");
    await fetchDossiers();
  };

  // Ouvrir modale renommage
  const openRenameModal = (dossier: Dossier) => {
    setDossierToEdit(dossier);
    setEditingDossierName(dossier.nom);
    setModalVisible(true);
  };

  // Fermer modale
  const closeModal = () => {
    setModalVisible(false);
    setDossierToEdit(null);
    setEditingDossierName("");
  };

  // Renommer dossier + mise à jour favoris + cache
  const renameDossier = async () => {
    if (!dossierToEdit || !editingDossierName.trim() || !user) return;

    const dossierRef = doc(db, "users", user.uid, "dossiers", dossierToEdit.id);
    await updateDoc(dossierRef, { nom: editingDossierName.trim() });

    // Mettre à jour le champ dossierNom dans favorites-plants liés
    const favsRef = collection(db, "users", user.uid, "favorites-plants");
    const q = query(favsRef, where("dossierId", "==", dossierToEdit.id));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((favDoc) => {
      batch.update(favDoc.ref, { dossierNom: editingDossierName.trim() });
    });

    await batch.commit();
    closeModal();
    await fetchDossiers();
  };

  // Supprimer dossier + ses favoris + mise à jour cache
  const deleteDossier = async (dossierId: string) => {
    if (!user) return;
    if (
      !window.confirm(
        "Supprimer ce dossier supprimera aussi toutes les plantes favorites dedans. Confirmez ?"
      )
    )
      return;

    const dossierRef = doc(db, "users", user.uid, "dossiers", dossierId);
    await deleteDoc(dossierRef);

    const favsRef = collection(db, "users", user.uid, "favorites-plants");
    const q = query(favsRef, where("dossierId", "==", dossierId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.forEach((favDoc) => {
      batch.delete(favDoc.ref);
    });

    await batch.commit();
    await fetchDossiers();
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20, backgroundColor: "#f5f9f7", borderRadius: 8 }}>
      <h1>Profil de {user.displayName || "Utilisateur"}</h1>
      <p>{user.email}</p>

      <button onClick={handleLogout} style={{ marginBottom: 20, padding: "10px 20px" }}>
        Se déconnecter
      </button>
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: 20, padding: "10px 20px" }}
      >
        Retour à l'accueil
      </button>
      <h2>Mes dossiers</h2>

      {/* Création nouveau dossier */}
      <div className={styles.addFolderContainer}>
        <input
          type="text"
          placeholder="Nom du nouveau dossier"
          value={newDossierName}
          onChange={(e) => setNewDossierName(e.target.value)}
          className={styles.addFolderInput}
        />
        <button onClick={createDossier} className={styles.addFolderButton}>
          Ajouter
        </button>
      </div>

      {dossiers.length === 0 ? (
        <p>Aucun dossier trouvé.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {dossiers.map((dossier) => (
            <li key={dossier.id} className={styles.dossierItem}>
              <div className={styles.dossierName}>{dossier.nom}</div>

              <button
                className={styles.playButton}
                onClick={() => navigate(`/quiz/dossier?dossierId=${dossier.id}`)}
              >
                Jouer à ce dossier
              </button>

              <div className={styles.folderActions}>
                <button
                  className={styles.smallButton}
                  onClick={() => openRenameModal(dossier)}
                >
                  Modifier le nom
                </button>
                <button
                  className={`${styles.smallButton} ${styles.dangerButton}`}
                  onClick={() => deleteDossier(dossier.id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* --- MODALE RENOMMAGE --- */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Modifier le nom du dossier</h3>
            <input
              type="text"
              value={editingDossierName}
              onChange={(e) => setEditingDossierName(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
            <button onClick={renameDossier} style={{ marginRight: 10 }}>
              Valider
            </button>
            <button onClick={closeModal}>Annuler</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowPasswordModal(true)}
        style={{ marginBottom: 20, padding: "10px 20px" }}
      >
        Changer mon mot de passe
      </button>
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Changer mon mot de passe</h3>

            {passwordMessage && (
              <p
                className={
                  passwordMessage.startsWith("Erreur") ? styles.errorMessage : styles.successMessage
                }
              >
                {passwordMessage}
              </p>
            )}

            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.modalInput}
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.modalInput}
            />
            <input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.modalInput}
            />

            <button
              onClick={handlePasswordChange}
              disabled={loadingPassword}
              className={styles.modalButton}
            >
              {loadingPassword ? "Patientez..." : "Valider"}
            </button>

            <button onClick={() => setShowPasswordModal(false)} className={styles.modalCancelButton}>
              Annuler
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
