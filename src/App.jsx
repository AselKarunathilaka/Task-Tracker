import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import AuthForm from "./AuthForm";
import TaskPanel from "./TaskPanel";
import AdminPanel from "./AdminPanel";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setClaims(null);
        setLoading(false);
        return;
      }

      const tokenResult = await getIdTokenResult(currentUser, true);
      setClaims(tokenResult.claims);

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      setProfile(userSnap.exists() ? userSnap.data() : null);

      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return <div className="center-message">Loading...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <TaskPanel user={user} profile={profile} />
      {claims?.admin === true && <AdminPanel />}
    </>
  );
}

export default App;