import { useState } from "react";
import { supabase } from "./supabase";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    // Admin hardcoded
    if (username === "admin" && password === "admin123") {
      setUser({ role: "admin", name: "Admin", department: "All" });
      setLoading(false);
      return;
    }

    // Role auto detect from users table
    const { data, error: err } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (data) {
      setUser({
        role: data.role,
        name: data.name,
        id: data.id,
        department: data.department
      });
    } else {
      setError("❌ Invalid username or password!");
    }
    setLoading(false);
  }

  if (user) return <Dashboard user={user} onLogout={() => setUser(null)} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #8B0000 0%, #1a1a2e 50%, #8B0000 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,215,0,0.05)", top: "-100px", left: "-100px" }} />
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,215,0,0.05)", bottom: "-50px", right: "-50px" }} />

      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.97)",
        padding: "40px", borderRadius: "20px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        margin: "20px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #8B0000, #ffd700)",
            margin: "0 auto 12px", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "32px"
          }}>🎓</div>
          <h2 style={{ margin: "0", color: "#8B0000", fontSize: "18px", fontWeight: "bold" }}>
            V.S.B. Engineering College
          </h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "12px" }}>Karur — 639 111</p>
          <p style={{ margin: "2px 0 0", color: "#999", fontSize: "11px" }}>"Hardwork is the Key to Success"</p>
          <div style={{ height: "3px", background: "linear-gradient(90deg, #8B0000, #ffd700, #8B0000)", margin: "14px 0 0", borderRadius: "2px" }} />
        </div>

        <h3 style={{ textAlign: "center", color: "#333", margin: "0 0 20px", fontSize: "15px" }}>
          🏛️ College Management System
        </h3>

        {error && (
          <div style={{ background: "#fee", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Username</label>
        <input
          placeholder="Enter your username"
          value={username}
          onChange={e => { setUsername(e.target.value); setError(""); }}
          style={{ width: "100%", padding: "12px", margin: "6px 0 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
        />

        <label style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", padding: "12px", margin: "6px 0 20px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            background: loading ? "#999" : "linear-gradient(135deg, #8B0000, #c41e3a)",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "15px", fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "⏳ Logging in..." : "🔐 Login"}
        </button>

        <p style={{ textAlign: "center", color: "#bbb", fontSize: "11px", marginTop: "16px", marginBottom: "0" }}>
          🔒 Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}

export default App;