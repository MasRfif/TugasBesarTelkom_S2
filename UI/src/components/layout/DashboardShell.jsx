import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardShell({
  title,
  menuItems,
  activeKey,
  onMenuChange,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="sidebar-logo">The Village</div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1.5rem",
            }}
          >
            {user?.nama_awal} ·{" "}
            <span style={{ color: "var(--orange)" }}>{user?.nama_role}</span>
          </div>
          <nav style={{ flex: 1 }}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`sidebar-item ${activeKey === item.key ? "active" : ""}`}
                onClick={() => onMenuChange(item.key)}
                style={{
                  width: "100%",
                  border: "none",
                  cursor: "pointer",
                  background: "none",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button
            className="sidebar-item"
            onClick={handleLogout}
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: "none",
              marginTop: "auto",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <LogOut size={16} /> <span>Keluar</span>
          </button>
        </aside>

        <div className="dash-main">
          <div className="dash-mobile-bar">
            <span
              style={{
                fontFamily: "Georgia, serif",
                color: "var(--orange)",
                fontWeight: 800,
                fontSize: "1.1rem",
              }}
            >
              The Village
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {mobileOpen && (
            <div
              style={{
                background: "var(--admin-sidebar)",
                padding: "0.75rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="mobile-menu-grid">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    className={`mobile-menu-item ${activeKey === item.key ? "active" : ""}`}
                    onClick={() => {
                      onMenuChange(item.key);
                      setMobileOpen(false);
                    }}
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                <button
                  className="mobile-menu-item"
                  onClick={handleLogout}
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            </div>
          )}

          <div className="dash-topbar">
            <h1 className="dash-title">{title}</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: "var(--admin-muted)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: "0.8rem",
                }}
              >
                {(user?.nama_awal || "U")[0].toUpperCase()}
              </div>
              <span style={{ color: "var(--admin-text)", fontWeight: 700 }}>
                {user?.nama_awal}
              </span>
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
