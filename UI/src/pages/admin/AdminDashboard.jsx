import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
  Video,
  BarChart2,
} from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardShell from "../../components/layout/DashboardShell";
import StatCard from "../../components/ui/StatCard";
import Empty from "../../components/ui/Empty";
import StyledSelect from "../../components/ui/StyledSelect";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const MENU = [
  { key: "overview", label: "Dasbor", icon: <BarChart2 size={16} /> },
  { key: "events", label: "Manajemen Acara", icon: <Calendar size={16} /> },
  { key: "users", label: "User & Role", icon: <Users size={16} /> },
  { key: "finance", label: "Keuangan & Tiket", icon: <DollarSign size={16} /> },
  { key: "faq", label: "FAQ Pending", icon: <HelpCircle size={16} /> },
  { key: "cctv", label: "CCTV / Laporan", icon: <Video size={16} /> },
];

function statusBadge(s) {
  if (s === "PUBLISHED" || s === "APPROVED" || s === "AUTO_APPROVED")
    return "green";
  if (s === "PENDING") return "orange";
  if (s === "REJECTED") return "red";
  return "gray";
}

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [faqPending, setFaqPending] = useState([]);
  const [cctv, setCctv] = useState([]);
  const [faqAns, setFaqAns] = useState({});
  const { token } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    api
      .get("/admin/dashboard-stats", token)
      .then((d) => setStats(d.data || {}))
      .catch(() => {});
    api
      .get("/admin/pending-events", token)
      .then((d) => setPending(d.data || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (active === "events")
      api
        .get("/admin/events", token)
        .then((d) => setEvents(d.data || []))
        .catch(() => {});
    if (active === "users")
      api
        .get("/admin/users", token)
        .then((d) => setUsers(d.data || []))
        .catch(() => {});
    if (active === "faq")
      api
        .get("/admin/faq-pending", token)
        .then((d) => setFaqPending(d.data || []))
        .catch(() => {});
    if (active === "cctv")
      api
        .get("/admin/cctv", token)
        .then((d) => setCctv(d.data || []))
        .catch(() => {});
  }, [active, token]);

  async function verifyEvent(id, status) {
    try {
      await api.post(
        "/admin/verify-event",
        { id_event: id, status_verif: status },
        token,
      );
      showToast(
        status === "APPROVED" ? "Event disetujui!" : "Event ditolak",
        status === "APPROVED" ? "success" : "error",
      );
      setPending((p) => p.filter((e) => e.id_event !== id));
      setStats((s) => ({
        ...s,
        pending_events: Math.max(0, (s.pending_events || 1) - 1),
      }));
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function publishFaq(id) {
    const ans = faqAns[id]?.jawaban || "";
    if (!ans.trim()) {
      showToast("Isi jawaban dulu", "error");
      return;
    }
    try {
      await api.post(
        "/admin/faq-answer",
        { id_faq: id, jawaban: ans, kategori: faqAns[id]?.kategori || "Umum" },
        token,
      );
      showToast("FAQ dipublish!", "success");
      setFaqPending((f) => f.filter((x) => x.id_faq !== id));
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };
  const eventChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        data: [3, 5, 8, 6, 10, 12],
        backgroundColor: "#c85c00",
        borderRadius: 8,
      },
    ],
  };
  const ticketChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        data: [20, 45, 38, 60, 72, 90],
        borderColor: "#c85c00",
        backgroundColor: "rgba(200,92,0,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const titles = {
    overview: "Dasbor Admin",
    events: "Manajemen Acara",
    users: "User & Role",
    finance: "Keuangan & Tiket",
    faq: "FAQ Pending",
    cctv: "CCTV / Laporan",
  };

  return (
    <DashboardShell
      title={titles[active]}
      menuItems={MENU}
      activeKey={active}
      onMenuChange={setActive}
    >
      {active === "overview" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "1rem",
            }}
          >
            <StatCard
              label="Total User"
              value={stats.total_users || 0}
              icon={<Users size={20} />}
              color="#1d4ed8"
            />
            <StatCard
              label="Total Acara"
              value={stats.total_events || 0}
              icon={<Calendar size={20} />}
              color="#c85c00"
            />
            <StatCard
              label="Menunggu Approval"
              value={stats.pending_events || 0}
              icon={<Clock size={20} />}
              color="#d97706"
            />
            <StatCard
              label="Penyelenggara"
              value={stats.organizers || 0}
              icon={<Users size={20} />}
              color="#16a34a"
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
              gap: "1rem",
            }}
          >
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">
                  Pertumbuhan Acara (6 Bulan)
                </span>
              </div>
              <div style={{ padding: "1rem", height: 220 }}>
                <Bar data={eventChartData} options={chartOpts} />
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Tiket Terjual</span>
              </div>
              <div style={{ padding: "1rem", height: 220 }}>
                <Line data={ticketChartData} options={chartOpts} />
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                Acara Menunggu Persetujuan ({pending.length})
              </span>
            </div>
            {pending.length === 0 ? (
              <Empty icon="✅" title="Tidak ada acara menunggu persetujuan" />
            ) : (
              <div className="responsive-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Kategori</th>
                      <th>Lokasi</th>
                      <th>Dibuat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((e) => (
                      <tr key={e.id_event}>
                        <td style={{ fontWeight: 700 }}>{e.nama_event}</td>
                        <td>
                          <span className="admin-badge gray">
                            {e.nama_category}
                          </span>
                        </td>
                        <td>{e.nama_tempat}</td>
                        <td>
                          {new Date(
                            e.created_at || Date.now(),
                          ).toLocaleDateString("id-ID")}
                        </td>
                        <td style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => verifyEvent(e.id_event, "APPROVED")}
                          >
                            <CheckCircle size={13} /> Setujui
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => verifyEvent(e.id_event, "REJECTED")}
                          >
                            <XCircle size={13} /> Tolak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {active === "events" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">
              Semua Acara ({events.length})
            </span>
          </div>
          {events.length === 0 ? (
            <Empty />
          ) : (
            <div className="responsive-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                    <th>Jenis</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id_event}>
                      <td style={{ fontWeight: 700 }}>{e.nama_event}</td>
                      <td>{e.nama_category}</td>
                      <td>{e.nama_tempat}</td>
                      <td>
                        <span
                          className={`admin-badge ${statusBadge(e.status_event)}`}
                        >
                          {e.status_event}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge blue">
                          {e.jenis_event}
                        </span>
                      </td>
                      <td>
                        {e.status_event === "PENDING" && (
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                verifyEvent(e.id_event, "APPROVED")
                              }
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                verifyEvent(e.id_event, "REJECTED")
                              }
                            >
                              ✗
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === "users" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">
              Semua User ({users.length})
            </span>
          </div>
          {users.length === 0 ? (
            <Empty />
          ) : (
            <div className="responsive-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Desa</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id_user}>
                      <td style={{ color: "var(--admin-muted)" }}>
                        {u.id_user}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {u.nama_awal} {u.nama_akhir}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`admin-badge ${u.nama_role === "ADMIN_BG" ? "red" : u.nama_role === "PENYELENGGARA" ? "orange" : "blue"}`}
                        >
                          {u.nama_role}
                        </span>
                      </td>
                      <td>{u.nama_desa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === "finance" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "1rem",
            }}
          >
            <StatCard
              label="Total Revenue"
              value="Rp 12.5 Jt"
              icon={<DollarSign size={20} />}
            />
            <StatCard
              label="Tiket Terjual"
              value="245"
              icon={<Calendar size={20} />}
              color="#1d4ed8"
            />
            <StatCard
              label="Pending Pembayaran"
              value="18"
              icon={<Clock size={20} />}
              color="#d97706"
            />
          </div>
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Info Keuangan</span>
            </div>
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--admin-muted)",
                fontSize: "0.9rem",
              }}
            >
              Data transaksi real-time tersedia setelah pengguna melakukan
              checkout.
            </div>
          </div>
        </div>
      )}

      {active === "faq" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {faqPending.length === 0 ? (
            <Empty icon="✅" title="Tidak ada FAQ pending" />
          ) : (
            faqPending.map((f) => (
              <div
                key={f.id_faq}
                className="admin-card"
                style={{ padding: "1.25rem" }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    color: "var(--admin-text)",
                  }}
                >
                  {f.pertanyaan}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--admin-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  dari {f.nama_awal} · {f.kategori}
                </div>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  <StyledSelect
                    className="admin-select-card admin-select-compact"
                    value={faqAns[f.id_faq]?.kategori || "Umum"}
                    options={["Umum", "Tiket", "Pembayaran", "Event", "Akun"]}
                    onChange={(v) =>
                      setFaqAns((a) => ({
                        ...a,
                        [f.id_faq]: {
                          ...a[f.id_faq],
                          kategori: v,
                        },
                      }))
                    }
                  />
                  <input
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: "0.45rem 0.85rem",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: "0.88rem",
                      color: "var(--admin-text)",
                    }}
                    placeholder="Tulis jawaban…"
                    value={faqAns[f.id_faq]?.jawaban || ""}
                    onChange={(e) =>
                      setFaqAns((a) => ({
                        ...a,
                        [f.id_faq]: { ...a[f.id_faq], jawaban: e.target.value },
                      }))
                    }
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => publishFaq(f.id_faq)}
                  >
                    Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {active === "cctv" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {cctv.length === 0 ? (
            <Empty
              icon="📹"
              title="Belum ada data CCTV/Report"
              desc="Data CCTV event akan muncul di sini"
            />
          ) : (
            cctv.map((c) => (
              <div
                key={c.id_cctv}
                className="admin-card"
                style={{
                  padding: "1.1rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Video size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>
                    {c.nama_cctv || "Kamera"}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}
                  >
                    {c.nama_event}
                  </div>
                </div>
                <span
                  className={`admin-badge ${c.status_cctv === "AKTIF" ? "green" : "gray"}`}
                >
                  {c.status_cctv}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardShell>
  );
}
