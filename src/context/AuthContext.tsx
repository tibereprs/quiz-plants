import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const initializeUserSeriesProgression = async (uid: string) => {
  const seriesSnapshot = await getDocs(collection(db, 'quiz_series'));
  console.log("je suis ici");
  const initPromises = seriesSnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    const order = data.order || 999; // si jamais y’a pas d’ordre défini
    const status = order === 1 ? 'unlocked' : 'locked';

    return setDoc(doc(db, `users/${uid}/progression_quiz_series`, docSnap.id), {
      status,
      lastAccess: null,
    });
  });

  await Promise.all(initPromises);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });
  return unsubscribe;
}, []);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
