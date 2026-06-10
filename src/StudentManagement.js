import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function StudentManagement({ user }) {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({
    name: "", roll_no: "", department: "CSE", semester: 1,
    dob: "", phone: "", email: "", address: "", status: "active"
  });

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students_master").select("*").order("id", { ascending: false });
    setStudents(data || []);
  }

  async function saveStudent() {
    if (!form.name || !form.roll_no) return alert("Name & Roll No கட்டாயம்!");
    if (editStudent) {
      await supabase.from("students_master").update(form).eq("id", editStudent.id);
    } else {
      await supabase.from("students_master").insert([form]);
    }
    setForm({ name: "", roll_no: "", department: "CSE", semester: 1, dob: "", phone: "", email: "", address: "", status: "active" });
    setShowForm(false);
    setEditStudent(null);
    fetchStudents();
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete பண்ணணுமா?")) return;
    await supabase.from("students_master").delete().eq("id", id);
    fetchStudents();
  }

  function editClick(s) {
    setEditStudent(s);
    setForm({ name: s.name, roll_no: s.roll_no, department: s.department, semester: s.semester, dob: s.dob || "", phone: s.phone || "", email: s.email || "", address: s.address || "", status: s.status });
    setShowForm(true);
  }

  const depts = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "MBA", "MCA"];
  const semesters = [1,2,3,4,5,6,7,8];

  const filtered = students
    .filter(s => filterDept === "all" ? true : s.department === filterDept)
    .filter(s => filterSem === "all" ? true : s.semester === parseInt(filterSem))
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.roll_no?.includes(search));

  const canEdit = ["admin", "hod", "advisor"].includes(user.role);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: "0", color: "#2c3e50" }}>👨‍🎓 Student Management</h2>
          <p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>Total: {students.length} students</p>
        </div>
        {canEdit && (
          <button onClick={() => { setShowForm(!showForm); setEditStudent(null); setForm({ name: "", roll_no: "", department: "CSE", semester: 1, dob: "", phone: "", email: "", address: "", status: "active" }); }}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
            {showForm ? "✕ Cancel" : "➕ Add Student"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {depts.map(d => {
          const count = students.filter(s => s.department === d).length;
          if (count === 0) return null;
          return (
            <div key={d} onClick={() => setFilterDept(filterDept === d ? "all" : d)}
              style={{ background: filterDept === d ? "#8B0000" : "white", color: filterDept === d ? "white" : "#2c3e50", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{count}</div>
              <div style={{ fontSize: "12px", marginTop: "2px" }}>{d}</div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px", border: "2px solid #8B0000" }}>
          <h3 style={{ margin: "0 0 16px", color: "#8B0000" }}>{editStudent ? "✏️ Edit Student" : "➕ Add New Student"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Student Name" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Roll No *</label>
              <input value={form.roll_no} onChange={e => setForm({...form, roll_no: e.target.value})} placeholder="Roll Number" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }}>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Semester</label>
              <select value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }}>
                {semesters.map(s => <option key={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Address" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Address</label>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" rows={2} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box", resize: "vertical" }} />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button onClick={saveStudent} style={{ padding: "10px 28px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              {editStudent ? "✅ Update" : "✅ Save"}
            </button>
            <button onClick={() => { setShowForm(false); setEditStudent(null); }} style={{ padding: "10px 20px", background: "#f0f2f5", color: "#666", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input placeholder="🔍 Search name or roll no..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", flex: 1, minWidth: "150px" }} />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
            <option value="all">All Departments</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
            <option value="all">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["#", "Name", "Roll No", "Dept", "Sem", "Phone", "Email", "Status", canEdit ? "Actions" : ""].filter(Boolean).map(h => (
                <th key={h} style={{ padding: "12px", textAlign: "left", color: "#555", borderBottom: "2px solid #eee", fontSize: "13px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f2f5" }}>
                <td style={{ padding: "12px", color: "#999", fontSize: "13px" }}>{i + 1}</td>
                <td style={{ padding: "12px", fontWeight: "600" }}>{s.name}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{s.roll_no}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: "#e8f4fd", color: "#2980b9", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>{s.department}</span>
                </td>
                <td style={{ padding: "12px", fontSize: "13px" }}>Sem {s.semester}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{s.phone || "-"}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{s.email || "-"}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: s.status === "active" ? "#e8f8f0" : s.status === "graduated" ? "#e8f4fd" : "#fef0f0", color: s.status === "active" ? "#27ae60" : s.status === "graduated" ? "#2980b9" : "#e74c3c", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
                    {s.status}
                  </span>
                </td>
                {canEdit && (
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => editClick(s)} style={{ background: "#e8f4fd", color: "#2980b9", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginRight: "6px" }}>✏️</button>
                    <button onClick={() => deleteStudent(s.id)} style={{ background: "#fee", color: "#e74c3c", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="9" style={{ padding: "30px", textAlign: "center", color: "#999" }}>No students found</td></tr>}
          </tbody>
        </table>
        <p style={{ color: "#999", fontSize: "12px", marginTop: "10px" }}>{filtered.length} students showing</p>
      </div>
    </div>
  );
}

export default StudentManagement;