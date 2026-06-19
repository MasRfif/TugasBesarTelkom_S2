import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AuthPage({ mode = "login" }) {
  const [form, setForm] = useState({
    nama_awal: "",
    nama_akhir: "",
    email: "",
    password: "",
    id_desa: 1,
    organisasi: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isRegister = mode === "register";
  const roleParam = params.get("role") || "USER";

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.post("/register", { ...form, role: roleParam });
        login(res.data.user, res.data.user.token);
        showToast("Registrasi berhasil! Selamat datang 🎉");
        navigate(roleParam === "PENYELENGGARA" ? "/organizer" : "/home");
      } else {
        const res = await api.post("/login", {
          email: form.email,
          password: form.password,
        });
        login(res.data.user, res.data.user.token);
        showToast("Berhasil masuk!");
        const role = res.data.user.nama_role;
        if (role === "ADMIN_BG" || role === "ADMIN_SYSTEM") navigate("/admin");
        else if (role === "PENYELENGGARA" || res.data.user.can_open_organizer)
          navigate("/organizer");
        else navigate("/home");
      }
    } catch (err) {
      showToast(err.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "min(460px,100%)" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--orange)",
                marginBottom: "0.25rem",
              }}
            >
              The Village
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "1.4rem", margin: 0 }}>
              {isRegister ? "Daftar Akun" : "Masuk"}
            </h2>
            {isRegister && roleParam === "PENYELENGGARA" && (
              <span className="badge" style={{ marginTop: "0.5rem" }}>
                Penyelenggara
              </span>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "1rem" }}
          >
            {isRegister && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <label className="input-label">Nama Depan</label>
                  <input
                    className="input"
                    required
                    value={form.nama_awal}
                    onChange={(e) => set("nama_awal", e.target.value)}
                    placeholder="Budi"
                  />
                </div>
                <div>
                  <label className="input-label">Nama Belakang</label>
                  <input
                    className="input"
                    value={form.nama_akhir}
                    onChange={(e) => set("nama_akhir", e.target.value)}
                    placeholder="Santoso"
                  />
                </div>
              </div>
            )}
            {isRegister && roleParam === "PENYELENGGARA" && (
              <div>
                <label className="input-label">Nama Organisasi</label>
                <input
                  className="input"
                  value={form.organisasi}
                  onChange={(e) => set("organisasi", e.target.value)}
                  placeholder="Karang Taruna Maju Bersama"
                />
              </div>
            )}
            <div>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="kamu@email.com"
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-dim)",
                    cursor: "pointer",
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "0.25rem", minHeight: 48, fontSize: "1rem" }}
            >
              {loading ? "Proses…" : isRegister ? "Buat Akun" : "Masuk"}
            </button>
          </form>
          <p
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontSize: "0.85rem",
              color: "var(--text-dim)",
            }}
          >
            {isRegister ? (
              <>
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  style={{ color: "var(--orange)", fontWeight: 700 }}
                >
                  Masuk
                </Link>
              </>
            ) : (
              <>
                Belum punya akun?{" "}
                <Link
                  to="/role"
                  style={{ color: "var(--orange)", fontWeight: 700 }}
                >
                  Daftar
                </Link>
              </>
            )}
          </p>
          {!isRegister && (
            <div
              style={{
                marginTop: "1rem",
                background: "var(--panel2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.85rem",
                fontSize: "0.78rem",
                color: "var(--text-dim)",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Akun Demo:
              </div>
              <div>admin@village.test / password</div>
              <div>organizer@village.test / password</div>
              <div>user@village.test / password</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
