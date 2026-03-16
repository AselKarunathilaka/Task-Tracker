import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";

function TaskPanel({ user, profile }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      items.sort((a, b) => {
        const ad = `${a.dueDate || ""} ${a.dueTime || ""}`;
        const bd = `${b.dueDate || ""} ${b.dueTime || ""}`;
        return ad.localeCompare(bd);
      });

      setTasks(items);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const addTask = async () => {
    if (!title.trim() || !dueDate || !dueTime) {
      alert("Please enter task title, date, and time.");
      return;
    }

    await addDoc(collection(db, "tasks"), {
      uid: user.uid,
      userEmail: user.email,
      title: title.trim(),
      completed: false,
      dueDate,
      dueTime,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDueDate("");
    setDueTime("");
  };

  const toggleTask = async (task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed,
    });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  const isOverdue = (task) => {
    if (!task.dueDate || !task.dueTime || task.completed) return false;
    const taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
    return taskDate < new Date();
  };

  return (
    <div className="app">
      <div className="container">
        <div className="topbar">
          <div>
            <h1>Task Tracker</h1>
            <p>
              Welcome, {profile?.name || user.email}
              {profile?.role === "admin" ? " (Admin)" : ""}
            </p>
          </div>

          <button className="logout-btn" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>

        <section className="stats">
          <div className="stat-card">
            <h3>Total</h3>
            <span>{total}</span>
          </div>
          <div className="stat-card">
            <h3>Active</h3>
            <span>{active}</span>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <span>{completed}</span>
          </div>
        </section>

        <section className="task-input-section multi">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
          <button onClick={addTask}>Add Task</button>
        </section>

        <section className="toolbar">
          <div className="filters">
            <button
              className={filter === "all" ? "active-filter" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={filter === "active" ? "active-filter" : ""}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={filter === "completed" ? "active-filter" : ""}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </section>

        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${isOverdue(task) ? "overdue-task" : ""}`}
            >
              <label className="task-left">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />
                <div>
                  <div className={task.completed ? "done" : ""}>{task.title}</div>
                  <small>
                    {task.dueDate} at {task.dueTime}
                    {isOverdue(task) ? " • Overdue" : ""}
                  </small>
                </div>
              </label>

              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>

        {filteredTasks.length === 0 && (
          <div className="empty-state">No tasks found.</div>
        )}
      </div>
    </div>
  );
}

export default TaskPanel;