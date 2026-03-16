import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import AuthForm from "./AuthForm";
import TaskPanel from "./TaskPanel";
import AdminPanel from "./AdminPanel";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch the user's document to get their role
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

  // Check if the user's role in Firestore is set to "admin"
  const isAdmin = profile?.role === "admin";

  return (
    <>
      <TaskPanel user={user} profile={profile} />
      {isAdmin && <AdminPanel />}
    </>
  );
}

export default App;