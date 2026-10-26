
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [feedback, setFeedback] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    courseName: "",
    courseDuration: "",
    comments: "",
    rating: 5,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadFeedback() {
    try {
      const response = await axios.get(API);
      setFeedback(response.data);
      setError("");
    } catch {
      setError("Cannot load feedback. Check that your backend is running.");
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  function openAddForm() {
    setForm({
      courseId: "",
      courseName: "",
      courseDuration: "",
      comments: "",
      rating: 5,
    });
    setEditingId(null);
    setError("");
    setPage("add");
  }

  function openEditForm(item) {
    setForm({
      courseId: item.courseId,
      courseName: item.courseName,
      courseDuration: item.courseDuration,
      comments: item.comments,
      rating: item.rating,
    });
    setEditingId(item._id);
    setError("");
    setPage("add");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
      } else {
        await axios.post(API, form);
      }
      await loadFeedback();
      setPage("dashboard");
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save feedback.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      await loadFeedback();
    } catch {
      setError("Could not delete feedback.");
    }
  }

  const average = feedback.length
    ? (feedback.reduce((sum, item) => sum + Number(item.rating), 0) /
        feedback.length).toFixed(1)
    : "0.0";

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>✦ FeedbackHub</h2>
        <p className="side-label">WORKSPACE</p>
        <button
          className={page === "dashboard" ? "nav active" : "nav"}
          onClick={() => setPage("dashboard")}
        >
          ▦ Dashboard
        </button>
        <button className={page === "add" ? "nav active" : "nav"}
          onClick={openAddForm}>
          ＋ Add Feedback
        </button>
        <div className="side-footer">Admin Panel · MERN Stack</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">ADMINISTRATION</span>
            <h1>{page === "dashboard" ? "Feedback Dashboard" :
              editingId ? "Update Feedback" : "Add Feedback"}</h1>
          </div>
          <span className="admin-chip">● Admin</span>
        </header>

        {error && <div className="error">{error}</div>}

        {page === "dashboard" ? (
          <>
            <section className="welcome">
              <div>
                <span className="eyebrow">OVERVIEW</span>
                <h2>Course feedback, at a glance.</h2>
                <p>Manage submissions and understand learner experiences.</p>
              </div>
              <button className="primary" onClick={openAddForm}>
                + Add Feedback
              </button>
            </section>

            <section className="stats">
              <div className="stat-card"><span>Total feedback</span>
                <strong>{feedback.length}</strong><small>All submissions</small>
              </div>
              <div className="stat-card"><span>Average rating</span>
                <strong>★ {average}</strong><small>Out of 5.0</small>
              </div>
              <div className="stat-card"><span>Courses covered</span>
                <strong>{new Set(feedback.map(x => x.courseId)).size}</strong>
                <small>Unique course IDs</small>
              </div>
            </section>

            <section className="table-panel">
              <div className="panel-heading"><div><h2>Course Feedback</h2>
                <p>Review and manage submitted feedback.</p></div>
                <span className="count">{feedback.length} records</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>COURSE ID</th><th>COURSE NAME</th>
                    <th>DURATION</th><th>RATING</th><th>COMMENTS</th>
                    <th>ACTIONS</th></tr></thead>
                  <tbody>
                    {feedback.map(item => (
                      <tr key={item._id}>
                        <td><span className="course-id">{item.courseId}</span></td>
                        <td><strong>{item.courseName}</strong></td>
                        <td>{item.courseDuration}</td>
                        <td><span className="rating">★ {item.rating}/5</span></td>
                        <td className="comments">{item.comments}</td>
                        <td><div className="actions">
                          <button className="edit" onClick={() => openEditForm(item)}>Edit</button>
                          <button className="delete" onClick={() => handleDelete(item._id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))}
                    {!feedback.length && <tr><td colSpan="6" className="empty">
                      No feedback yet. Click “Add Feedback” to create your first entry.
                    </td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="form-panel">
            <span className="eyebrow">FEEDBACK MANAGEMENT</span>
            <h2>{editingId ? "Edit submission" : "Share course feedback"}</h2>
            <p className="form-intro">Complete the details below and save your feedback.</p>
            <form onSubmit={handleSubmit}>
              <label>Course ID<input required value={form.courseId}
                onChange={e => setForm({...form, courseId:e.target.value})}
                placeholder="e.g. MERN-101" /></label>
              <label>Course Name<input required value={form.courseName}
                onChange={e => setForm({...form, courseName:e.target.value})}
                placeholder="e.g. Full Stack Development" /></label>
              <label>Course Duration<input required value={form.courseDuration}
                onChange={e => setForm({...form, courseDuration:e.target.value})}
                placeholder="e.g. 3 months" /></label>
              <label>Feedback Comments<textarea required rows="4"
                value={form.comments}
                onChange={e => setForm({...form, comments:e.target.value})}
                placeholder="Tell us about your learning experience..." /></label>
              <label>Feedback Rating</label>
              <div className="stars">
                {[1,2,3,4,5].map(n => <button type="button" key={n}
                  className={n <= form.rating ? "star selected" : "star"}
                  onClick={() => setForm({...form, rating:n})}
                  aria-label={`${n} stars`}>★</button>)}
                <span>{form.rating} out of 5</span>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary"
                  onClick={() => {setPage("dashboard");setEditingId(null);}}>
                  Cancel
                </button>
                <button className="primary" type="submit">
                  {editingId ? "Save Changes" : "Submit Feedback"}
                </button>
              </div>
            </form>
          </section>
        )}
        <footer>FeedbackHub · Course Feedback Administration</footer>
      </main>
    </div>
  );
}
