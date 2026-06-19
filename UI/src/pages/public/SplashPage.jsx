import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";

export default function SplashPage() {
  const navigate = useNavigate();
  return (
    <div className="splash-page">
      <div>
        <div className="splash-bg" />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              background: "var(--panel2)",
              padding: "0.35rem 1rem",
              borderRadius: 999,
              border: "1px solid var(--border)",
            }}
          >
            Platform Acara Desa
          </span>
          <h1 className="splash-title">The Village</h1>
          <p className="splash-tagline">
            Jembatan Informasi Acara Desa.
            <br />
            Satu Desa, Ribuan Cerita.
          </p>
          <p className="splash-copy">
            Temukan, daftar, dan nikmati event desa terbaik di sekitarmu.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <button
              className="btn btn-primary"
              style={{
                minWidth: 220,
                fontSize: "1rem",
                minHeight: 50,
                borderRadius: 12,
              }}
              onClick={() => navigate("/home")}
            >
              Mulai Jelajahi <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-dim)",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <LogIn size={15} /> Sudah punya akun? Masuk
            </button>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {["100+ Event", "50+ Desa", "10K+ Pengguna"].map((s) => (
            <div key={s} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontWeight: 900,
                  color: "var(--orange)",
                  fontSize: "1rem",
                }}
              >
                {s.split(" ")[0]}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                {s.split(" ").slice(1).join(" ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
