import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://apxwbovjgeddqjwuxuaw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdib3ZqZ2VkZHFqd3V4dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjY0NjMsImV4cCI6MjA5NjU0MjQ2M30.48c8ddJrI6i11C00_Ge6MELLcdXYp70BwZG8KYCoaks"
);

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [marks, setMarks] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students").select("*");
    setStudents(data || []);
  }

  async function addStudent() {
    const grade = marks >= 90 ? "A+" : marks >= 75 ? "A" : marks >= 60 ? "B" : marks >= 50 ? "C" : "F";
    await supabase.from("students").insert([
      { name, roll_no: roll, subject: "General", marks: parseInt(marks), grade }
    ]);
    setName(""); setRoll(""); setMarks("");
    fetchStudents();
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🎓 Student Result System</h1>
      <div style={{ marginBottom: "20px" }}>
        <input placeholder="Student Name" value={name} onChange={e => setName(e.target.value)} style={{ margin: "5px", padding: "8px" }} />
        <input placeholder="Roll No" value={roll} onChange={e => setRoll(e.target.value)} style={{ margin: "5px", padding: "8px" }} />
        <input placeholder="Marks (0-100)" value={marks} onChange={e => setMarks(e.target.value)} style={{ margin: "5px", padding: "8px" }} />
        <button onClick={addStudent} style={{ margin: "5px", padding: "8px 16px", background: "blue", color: "white", border: "none", cursor: "pointer" }}>Add Student</button>
      </div>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f0f0f0" }}>
          <tr><th>Name</th><th>Roll No</th><th>Marks</th><th>Grade</th></tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td><td>{s.roll_no}</td><td>{s.marks}</td><td>{s.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;