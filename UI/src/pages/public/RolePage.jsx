import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building2, ArrowLeft } from "lucide-react";

const roles = [
  {
    key: "user",
    icon: <Users size={36} />,
    title: "Pengguna Biasa",
    desc: "Temukan dan daftar event menarik di desamu. Beli tiket dan simpan kenangan.",
    color: "#c85c00",
    to: "/register",
  },
  {
    key: "organizer",
    icon: <Building2 size={36} />,
    title: "Penyelenggara Acara",
    desc: "Buat dan kelola event desa. Pantau tiket, transaksi, dan tim pengelolamu.",
    color: "#1d4ed8",
    to: "/register?role=PENYELENGGARA",
  },
];

export default function RolePage() {
  const navigate = useNavigate();
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
      <div style={{ width: "min(700px,100%)", textAlign: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            marginBottom: "2rem",
            fontSize: "0.88rem",
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1
          style={{
            fontSize: "clamp(1.5rem,5vw,2.5rem)",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Bergabung sebagai apa?
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Pilih peranmu di The Village
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "1rem",
          }}
        >
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => navigate(r.to)}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "2rem 1.5rem",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = r.color;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 16px 40px ${r.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: r.color + "18",
                  color: r.color,
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 1rem",
                }}
              >
                {r.icon}
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  marginBottom: "0.5rem",
                }}
              >
                {r.title}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {r.desc}
              </div>
            </button>
          ))}
        </div>
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "var(--text-dim)",
          }}
        >
          Sudah punya akun?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--orange)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  );
}
