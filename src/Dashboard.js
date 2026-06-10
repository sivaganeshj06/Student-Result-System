import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import StudentManagement from "./StudentManagement";

const ROLE_CONFIG = {
  student:   { label: "Student",       icon: "👨‍🎓", color: "#3498db" },
  advisor:   { label: "Advisor",       icon: "👨‍🏫", color: "#2ecc71" },
  hod:       { label: "HOD",           icon: "👨‍💼", color: "#9b59b6" },
  vp:        { label: "Vice Principal",icon: "🏛️",  color: "#e67e22" },
  principal: { label: "Principal",     icon: "🎓",  color: "#c0392b" },
  admin:     { label: "Admin",         icon: "⚙️",  color: "#1a1a2e" },
};

const TABS = {
  student:   ["dashboard", "students"],
  advisor:   ["dashboard", "students", "results"],
  hod:       ["dashboard", "students", "results"],
  vp:        ["dashboard", "students", "results"],
  principal: ["dashboard", "students", "results"],
  admin:     ["dashboard", "students", "results", "add", "users"],
};

const TAB_LABELS = {
  dashboard: "📊 Dashboard",
  students:  "👨‍🎓 Students",
  results:   "📋 Results",
  add:       "➕ Add Student",
  users:     "👥 Manage Users",
};

function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "student", department: "" });

  const role = user.role;
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const myTabs = TABS[role] || ["dashboard"];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let q = supabase.from("students").select("*").order("id", { ascending: false });
    if (role === "student") q = q.eq("roll_no", user.id?.toString() || "");
    if (role === "advisor") q = q.eq("department", user.department);
    const { data } = await q;
    setStudents(data || []);

    if (["admin", "principal", "vp", "hod"].includes(role)) {
      const { data: udata } = await supabase.from("users").select("*");
      setUsers(udata || []);
    }
  }

  async function addStudent() {
    if (!name || !roll || !marks) return alert("எல்லா fields பண்ணுங்க!");
    const m = parseInt(marks);
    const grade = m >= 90 ? "A+" : m >= 75 ? "A" : m >= 60 ? "B" : m >= 50 ? "C" : "F";
    await supabase.from("students").insert([{ name, roll_no: roll, subject: subject || "General", marks: m, grade, department: user.department || "CSE" }]);
    setName(""); setRoll(""); setSubject(""); setMarks("");
    fetchData();
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete பண்ணணுமா?")) return;
    await supabase.from("students").delete().eq("id", id);
    fetchData();
  }

  async function addUser() {
    if (!newUser.name || !newUser.username || !newUser.password) return alert("எல்லா fields பண்ணுங்க!");
    await supabase.from("users").insert([newUser]);
    setNewUser({ name: "", username: "", password: "", role: "student", department: "" });
    fetchData();
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete பண்ணணுமா?")) return;
    await supabase.from("users").delete().eq("id", id);
    fetchData();
  }

  const filtered = students
    .filter(s => filter === "all" ? true : filter === "pass" ? s.marks >= 50 : s.marks < 50)
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.roll_no?.includes(search));

  const total = students.length;
  const pass = students.filter(s => s.marks >= 50).length;
  const fail = total - pass;
  const avg = total ? Math.round(students.reduce((a, s) => a + s.marks, 0) / total) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>

      {/* Navbar */}
      <div style={{ background: "linear-gradient(135deg, #8B0000, #1a1a2e)", padding: "0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🎓</span>
          <div>
            <div style={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>VSB Engineering College</div>
            <div style={{ color: "#ffd700", fontSize: "11px" }}>College Management System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{config.icon} {user.name}</div>
            <div style={{ color: "#ffd700", fontSize: "11px" }}>{config.label}{user.department ? ` | ${user.department}` : ""}</div>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", padding: "0 30px", borderBottom: "1px solid #eee", display: "flex", overflowX: "auto" }}>
        {myTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontWeight: tab === t ? "bold" : "normal", color: tab === t ? "#8B0000" : "#666", borderBottom: tab === t ? "3px solid #8B0000" : "3px solid transparent", fontSize: "13px", whiteSpace: "nowrap" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${config.color}, #1a1a2e)`, borderRadius: "12px", padding: "24px", marginBottom: "24px", color: "white" }}>
              <h2 style={{ margin: "0 0 4px" }}>{config.icon} Welcome, {user.name}!</h2>
              <p style={{ margin: 0, opacity: 0.8, fontSize: "14px" }}>{config.label} Dashboard — VSB Engineering College</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Students", value: total, color: "#3498db", icon: "👨‍🎓" },
                { label: "Passed", value: pass, color: "#2ecc71", icon: "✅" },
                { label: "Failed", value: fail, color: "#e74c3c", icon: "❌" },
                { label: "Average Marks", value: avg, color: "#9b59b6", icon: "📊" },
              ].map(s => (
                <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontSize: "26px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ color: "#999", fontSize: "13px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 20px", color: "#2c3e50" }}>📈 Grade Distribution</h3>
              {["A+", "A", "B", "C", "F"].map(g => {
                const count = students.filter(s => s.grade === g).length;
                const pct = total ? Math.round((count / total) * 100) : 0;
                const colors = { "A+": "#2ecc71", "A": "#27ae60", "B": "#3498db", "C": "#f39c12", "F": "#e74c3c" };
                return (
                  <div key={g} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ width: "30px", fontWeight: "bold", color: colors[g] }}>{g}</span>
                    <div style={{ flex: 1, background: "#f0f2f5", borderRadius: "6px", height: "20px" }}>
                      <div style={{ width: `${pct}%`, background: colors[g], height: "100%", borderRadius: "6px", transition: "width 0.5s" }} />
                    </div>
                    <span style={{ width: "70px", fontSize: "13px", color: "#666" }}>{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Students Tab */}
        {tab === "students" && <StudentManagement user={user} />}

        {/* Results Tab */}
        {tab === "results" && (
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#2c3e50" }}>📋 {role === "student" ? "My Results" : "Student Results"}</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", flex: 1, minWidth: "150px" }} />
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                <option value="all">All</option>
                <option value="pass">✅ Pass</option>
                <option value="fail">❌ Fail</option>
              </select>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Name", "Roll No", "Subject", "Marks", "Grade", "Status", ["admin","advisor"].includes(role) ? "Action" : ""].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: "12px", textAlign: "left", color: "#555", borderBottom: "2px solid #eee", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f2f5" }}>
                    <td style={{ padding: "12px" }}>{s.name}</td>
                    <td style={{ padding: "12px" }}>{s.roll_no}</td>
                    <td style={{ padding: "12px" }}>{s.subject}</td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{s.marks}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: {"A+":"#2ecc71","A":"#27ae60","B":"#3498db","C":"#f39c12","F":"#e74c3c"}[s.grade], color:"white", padding:"3px 10px", borderRadius:"12px", fontSize:"12px" }}>{s.grade}</span>
                    </td>
                    <td style={{ padding: "12px", color: s.marks >= 50 ? "#2ecc71" : "#e74c3c", fontWeight: "bold" }}>{s.marks >= 50 ? "✅ Pass" : "❌ Fail"}</td>
                    {["admin","advisor"].includes(role) && (
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => deleteStudent(s.id)} style={{ background: "#fee", color: "#e74c3c", border: "1px solid #fcc", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑</button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#999" }}>No data found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Student Tab */}
        {tab === "add" && role === "admin" && (
          <div style={{ background: "white", borderRadius: "12px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 20px", color: "#2c3e50" }}>➕ Add Student Result</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[["Student Name", name, setName], ["Roll No", roll, setRoll], ["Subject", subject, setSubject], ["Marks (0-100)", marks, setMarks]].map(([ph, val, fn]) => (
                <input key={ph} placeholder={ph} value={val} onChange={e => fn(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
              ))}
            </div>
            <button onClick={addStudent} style={{ marginTop: "20px", padding: "12px 30px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>
              ✅ Add
            </button>
          </div>
        )}

        {/* Manage Users Tab */}
        {tab === "users" && role === "admin" && (
          <div>
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 16px", color: "#2c3e50" }}>➕ Add User</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                <input placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }}>
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="hod">HOD</option>
                  <option value="vp">VP</option>
                  <option value="principal">Principal</option>
                </select>
                <input placeholder="Department" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }} />
              </div>
              <button onClick={addUser} style={{ marginTop: "14px", padding: "10px 24px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
                ✅ Add User
              </button>
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#2c3e50" }}>👥 All Users ({users.length})</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["Name", "Username", "Role", "Department", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px", textAlign: "left", color: "#555", borderBottom: "2px solid #eee", fontSize: "13px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f0f2f5" }}>
                      <td style={{ padding: "12px" }}>{u.name}</td>
                      <td style={{ padding: "12px" }}>{u.username}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: ROLE_CONFIG[u.role]?.color || "#999", color: "white", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>
                          {ROLE_CONFIG[u.role]?.icon} {ROLE_CONFIG[u.role]?.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{u.department}</td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => deleteUser(u.id)} style={{ background: "#fee", color: "#e74c3c", border: "1px solid #fcc", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;