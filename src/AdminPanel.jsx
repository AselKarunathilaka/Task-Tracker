import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebase";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUsers();
      unsubTasks();
    };
  }, []);

  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  const tasksPerUser = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      map[t.uid] = (map[t.uid] || 0) + 1;
    });
    return map;
  }, [tasks]);

  return (
    <div className="admin-card">
      <h2>Admin Panel</h2>

      <div className="stats admin-stats">
        <div className="stat-card">
          <h3>Users</h3>
          <span>{totalUsers}</span>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <span>{totalTasks}</span>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <span>{completedTasks}</span>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <span>{activeTasks}</span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>User ID</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid}>
                <td>{u.name || "-"}</td>
                <td>{u.email}</td>
                <td>{u.role || "user"}</td>
                <td className="uid-cell">{u.uid}</td>
                <td>{tasksPerUser[u.uid] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;