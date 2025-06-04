import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css";
import googleIcon from "../../../public/images/google-icon-logo.svg"; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { initializeUserSeriesProgression } from "../../context/AuthContext"


export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || "",
          createdAt: new Date(),
        }, { merge: true });
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        infos: {
          email: user.email,
          createdAt: new Date(),
        },
      }, { merge: true });

        await initializeUserSeriesProgression(user.uid);

        setSuccessMessage("Compte créé avec succès !");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Connexion réussie !");
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className={styles["auth-container"]}>
      <h2>{isRegister ? "Créer un compte" : "Se connecter"}</h2>
      {successMessage && <p className={styles["auth-success"]}>{successMessage}</p>}
      {error && <p className={styles["auth-error"]}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles["auth-form"]}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? "S'inscrire" : "Se connecter"}</button>
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "J'ai déjà un compte" : "Créer un compte"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleSignIn} className={styles["google-button"]}>
        <img src={googleIcon} alt="Google" className={styles["google-icon"]} />
        Se connecter avec Google
      </button>
    </div>
  );
}