import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function Attendance({ user }) {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [form, setForm] = useState({
    student_name: "", roll_no: "", department: "CSE",
    subject: "", date: new Date().toISOString().split("T")[0], status: "Present"
  });

  useEffect(() => { fetchRecords(); fetchStudents(); }, []);

  async function fetchRecords() {
    let q = supabase.from("attendance").select("*").order("id", { ascending: false });
    if (user.role === "student") q = q.eq("roll_no", user.id?.toString() || "");
    if (user.role === "advisor") q = q.eq("department", user.department);
    const { data } = await q;
    setRecords(data || []);
  }

  async function fetchStudents() {
    const { data } = await supabase.from("students_master").select("name, roll_no, department");
    setStudents(data || []);
  }

  function selectStudent(e) {
    const s = students.find(s => s.roll_no === e.target.value);
    if (s) setForm({ ...form, student_name: s.name, roll_no: s.roll_no, department: s.department });
  }

  async function saveAttendance() {
    if (!form.roll_no || !form.subject || !form.date) return alert("Please fill all required fields!");
    await supabase.from("attendance").insert([form]);
    setForm({ student_name: "", roll_no: "", department: "CSE", subject: "", date: new Date().toISOString().split("T")[0], status: "Present" });
    setShowForm(false);
    fetchRecords();
  }

  async function deleteRecord(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    await supabase.from("attendance").delete().eq("id", id);
    fetchRecords();
  }

  const canEdit = ["admin", "advisor", "hod"].includes(user.role);
  const depts = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "MBA", "MCA"];

  const filtered = records
    .filter(r => filterDept === "all" ? true : r.department === filterDept)
    .filter(r => filterDate ? r.date === filterDate : true)
    .filter(r => r.student_name?.toLowerCase().includes(search.toLowerCase()) || r.roll_no?.includes(search));

  const present = filtered.filter(r => r.status === "Present").length;
  const absent = filtered.filter(r => r.status === "Absent").length;
  const total = filtered.length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#2c3e50" }}>Attendance Management</h2>
          <p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>Total Records: {records.length}</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            {showForm ? "Cancel" : "+ Mark Attendance"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Records", value: total, color: "#3498db" },
          { label: "Present", value: present, color: "#2ecc71" },
          { label: "Absent", value: absent, color: "#e74c3c" },
          { label: "Attendance %", value: `${pct}%`, color: pct >= 75 ? "#2ecc71" : "#e74c3c" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ color: "#999", fontSize: "12px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px", border: "2px solid #8B0000" }}>
          <h3 style={{ margin: "0 0 16px", color: "#8B0000" }}>Mark Attendance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Select Student</label>
              <select onChange={selectStudent} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }}>
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.roll_no} value={s.roll_no}>{s.name} ({s.roll_no})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject Name" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "4px", boxSizing: "border-box" }}>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
                <option>Leave</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button onClick={saveAttendance} style={{ padding: "10px 28px", background: "linear-gradient(135deg, #8B0000, #c41e3a)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "#f0f2f5", color: "#666", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input placeholder="Search name or roll no..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", flex: 1, minWidth: "150px" }} />
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
            <option value="all">All Departments</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          {filterDate && <button onClick={() => setFilterDate("")} style={{ padding: "8px 12px", background: "#fee", color: "#e74c3c", border: "none", borderRadius: "6px", cursor: "pointer" }}>Clear</button>}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["#", "Name", "Roll No", "Department", "Subject", "Date", "Status", canEdit ? "Action" : ""].filter(Boolean).map(h => (
                <th key={h} style={{ padding: "12px", textAlign: "left", color: "#555", borderBottom: "2px solid #eee", fontSize: "13px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f2f5" }}>
                <td style={{ padding: "12px", color: "#999", fontSize: "13px" }}>{i + 1}</td>
                <td style={{ padding: "12px", fontWeight: "600" }}>{r.student_name}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{r.roll_no}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: "#e8f4fd", color: "#2980b9", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>{r.department}</span>
                </td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{r.subject}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{r.date}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: r.status === "Present" ? "#e8f8f0" : r.status === "Late" ? "#fef9e7" : "#fef0f0", color: r.status === "Present" ? "#27ae60" : r.status === "Late" ? "#f39c12" : "#e74c3c", padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
                    {r.status}
                  </span>
                </td>
                {canEdit && (
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => deleteRecord(r.id)} style={{ background: "#fee", color: "#e74c3c", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#999" }}>No records found</td></tr>}
          </tbody>
        </table>
        <p style={{ color: "#999", fontSize: "12px", marginTop: "10px" }}>{filtered.length} records showing</p>
      </div>
    </div>
  );
}

export default Attendance;