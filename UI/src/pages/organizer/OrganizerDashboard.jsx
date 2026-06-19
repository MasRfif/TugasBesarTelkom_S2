import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  BarChart2,
  Ticket,
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  UploadCloud,
  Image as ImageIcon,
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
  { key: "overview", label: "Dasbor Saya", icon: <BarChart2 size={16} /> },
  { key: "events", label: "Manajemen Acara", icon: <Calendar size={16} /> },
  {
    key: "payments",
    label: "Monitoring Transaksi",
    icon: <DollarSign size={16} />,
  },
  { key: "team", label: "Tim Pengelola", icon: <Users size={16} /> },
  { key: "tickets", label: "Ticketing / Peserta", icon: <Ticket size={16} /> },
  {
    key: "reports",
    label: "Laporan / Lalu Lintas",
    icon: <FileText size={16} />,
  },
];

const ROLES = [
  "TICKET_ADMIN",
  "PAYMENT_ADMIN",
  "TRAFFIC_ADMIN",
  "CONTENT_ADMIN",
  "VIEWER",
];
const ROLE_LABEL = {
  OWNER: "Pemilik",
  TICKET_ADMIN: "Tim Tiket",
  PAYMENT_ADMIN: "Tim Pembayaran",
  TRAFFIC_ADMIN: "Tim Traffic",
  CONTENT_ADMIN: "Tim Konten",
  VIEWER: "Pengamat",
};

const BLANK_EVENT = {
  nama_event: "",
  id_category: 1,
  deskripsi: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  id_lokasi: 1,
  id_desa: 1,
  jenis_event: "GRATIS",
  max_peserta: 100,
  url_image: "/assets/17 agus.jpg",
  nama_tiket: "Reguler",
  harga_tiket: 0,
  qty: 100,
};

function ImageUploadPicker({ value, file, onChange }) {
  const [preview, setPreview] = useState(value || "");

  useEffect(() => {
    if (!file) {
      setPreview(value || "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, value]);

  function handlePick(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("File harus berupa JPG, PNG, WEBP, atau AVIF");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB");
      e.target.value = "";
      return;
    }

    onChange(selectedFile);
  }

  return (
    <div className="upload-picker">
      <div className="upload-picker-preview">
        {preview ? (
          <img src={preview} alt="Preview event" />
        ) : (
          <div className="upload-picker-empty">
            <ImageIcon size={34} />
            <span>Belum ada gambar</span>
          </div>
        )}
      </div>

      <div className="upload-picker-content">
        <div>
          <p className="upload-picker-title">Gambar Event</p>
          <p className="upload-picker-desc">
            Ambil gambar langsung dari folder komputer kamu. File akan otomatis
            disimpan ke server.
          </p>
          {file ? (
            <p className="upload-picker-file">{file.name}</p>
          ) : value ? (
            <p className="upload-picker-file">{value}</p>
          ) : (
            <p className="upload-picker-file">Belum memilih gambar</p>
          )}
        </div>

        <label className="upload-picker-btn">
          <UploadCloud size={17} />
          Pilih Gambar
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handlePick}
            hidden
          />
        </label>
      </div>
    </div>
  );
}

function EventForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ ...BLANK_EVENT, ...initial });
  const [tickets, setTickets] = useState(initial?.extra_tickets || []);
  const [imageFile, setImageFile] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function addTicket() {
    setTickets((t) => [
      ...t,
      { nama_tiket: "", harga_tiket: 0, qty: 50, perks: "" },
    ]);
  }
  function setTicket(i, k, v) {
    setTickets((t) => t.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  }
  function removeTicket(i) {
    setTickets((t) => t.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "0.75rem",
        }}
      >
        <div style={{ gridColumn: "1/-1" }}>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Nama Event *
          </label>
          <input
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              color: "var(--admin-text)",
            }}
            value={form.nama_event}
            onChange={(e) => set("nama_event", e.target.value)}
            placeholder="Nama event…"
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Kategori
          </label>
          <StyledSelect
            className="admin-select-card"
            value={form.id_category}
            label="Pilih kategori..."
            options={(categories || []).map((c) => ({
              value: c.id_category,
              label: c.nama_category,
            }))}
            onChange={(v) => set("id_category", Number(v))}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Jenis Event
          </label>
          <StyledSelect
            className="admin-select-card"
            value={form.jenis_event}
            label="Pilih jenis..."
            options={[
              { value: "GRATIS", label: "Gratis" },
              { value: "BERBAYAR", label: "Berbayar" },
            ]}
            onChange={(v) => set("jenis_event", v)}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Tanggal Mulai
          </label>
          <input
            type="date"
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              color: "var(--admin-text)",
            }}
            value={form.tanggal_mulai}
            onChange={(e) => set("tanggal_mulai", e.target.value)}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Tanggal Selesai
          </label>
          <input
            type="date"
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              color: "var(--admin-text)",
            }}
            value={form.tanggal_selesai}
            onChange={(e) => set("tanggal_selesai", e.target.value)}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Maks. Peserta
          </label>
          <input
            type="number"
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              color: "var(--admin-text)",
            }}
            value={form.max_peserta}
            onChange={(e) => set("max_peserta", Number(e.target.value))}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.45rem",
            }}
          >
            Gambar Event
          </label>

          <ImageUploadPicker
            value={form.url_image}
            file={imageFile}
            onChange={(file) => setImageFile(file)}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--admin-muted)",
              display: "block",
              marginBottom: "0.3rem",
            }}
          >
            Deskripsi
          </label>
          <textarea
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              color: "var(--admin-text)",
              resize: "vertical",
            }}
            rows={3}
            value={form.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
            placeholder="Deskripsi acara…"
          />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: "0.9rem",
              color: "var(--admin-text)",
            }}
          >
            Tiket Tambahan (opsional)
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addTicket}
          >
            <Plus size={14} /> Tambah Tiket
          </button>
        </div>
        {tickets.map((t, i) => (
          <div
            key={i}
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              padding: "0.85rem",
              marginBottom: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: "0.5rem",
              position: "relative",
            }}
          >
            <input
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
              }}
              placeholder="Nama tiket"
              value={t.nama_tiket}
              onChange={(e) => setTicket(i, "nama_tiket", e.target.value)}
            />
            <input
              type="number"
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
              }}
              placeholder="Harga"
              value={t.harga_tiket}
              onChange={(e) =>
                setTicket(i, "harga_tiket", Number(e.target.value))
              }
            />
            <input
              type="number"
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
              }}
              placeholder="Kuota"
              value={t.qty}
              onChange={(e) => setTicket(i, "qty", Number(e.target.value))}
            />
            <input
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
              }}
              placeholder="Perks/benefit…"
              value={t.perks}
              onChange={(e) => setTicket(i, "perks", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeTicket(i)}
              style={{
                background: "#fee2e2",
                border: "none",
                borderRadius: 8,
                color: "#dc2626",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "flex-end",
          paddingTop: "0.5rem",
        }}
      >
        <button className="btn btn-ghost" onClick={onCancel}>
          Batal
        </button>
        <button
          className="btn btn-primary"
          onClick={() =>
            onSave({
              ...form,
              image_file: imageFile,
              extra_tickets: tickets,
            })
          }
        >
          <CheckCircle size={15} /> Simpan Event
        </button>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [team, setTeam] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [teamForm, setTeamForm] = useState({
    email: "",
    id_event: "",
    role_event: "VIEWER",
  });
  const { token, user } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    api
      .get("/organizer/dashboard-stats", token)
      .then((d) => setStats(d.data || {}))
      .catch(() => {});
    api
      .get("/categories")
      .then((d) => setCategories(d.data || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (active === "events" || active === "overview")
      api
        .get("/organizer/events", token)
        .then((d) => setEvents(d.data || []))
        .catch(() => {});
    if (active === "payments")
      api
        .get("/organizer/payments", token)
        .then((d) => setPayments(d.data || []))
        .catch(() => {});
    if (active === "team")
      api
        .get("/organizer/team", token)
        .then((d) => setTeam(d.data || []))
        .catch(() => {});
    if (active === "tickets")
      api
        .get("/organizer/tickets", token)
        .then((d) => setTickets(d.data || []))
        .catch(() => {});
    if (active === "reports")
      api
        .get("/organizer/reports", token)
        .then((d) => setReports(d.data || []))
        .catch(() => {});
  }, [active, token]);

  async function saveEvent(form) {
    try {
      const formData = new FormData();

      formData.append("nama_event", form.nama_event || "");
      formData.append("id_category", form.id_category || 1);
      formData.append("deskripsi", form.deskripsi || "");
      formData.append("tanggal_mulai", form.tanggal_mulai || "");
      formData.append(
        "tanggal_selesai",
        form.tanggal_selesai || form.tanggal_mulai || "",
      );
      formData.append("id_lokasi", form.id_lokasi || 1);
      formData.append("id_desa", form.id_desa || 1);
      formData.append("jenis_event", form.jenis_event || "GRATIS");
      formData.append("max_peserta", form.max_peserta || 100);
      formData.append("nama_tiket", form.nama_tiket || "Reguler");
      formData.append("harga_tiket", form.harga_tiket || 0);
      formData.append("qty", form.qty || 100);
      formData.append("url_image", form.url_image || "/assets/17 agus.jpg");
      formData.append(
        "extra_tickets",
        JSON.stringify(form.extra_tickets || []),
      );

      if (form.image_file) {
        formData.append("event_image", form.image_file);
      }

      if (editEvent?.id_event) {
        await api.postForm(
          `/organizer/events/${editEvent.id_event}`,
          formData,
          token,
        );
        showToast("Acara berhasil diperbarui!", "success");
      } else {
        await api.postForm("/organizer/events", formData, token);
        showToast(
          "Acara berhasil dibuat! Menunggu persetujuan admin.",
          "success",
        );
      }

      setShowForm(false);
      setEditEvent(null);
      api.get("/organizer/events", token).then((d) => setEvents(d.data || []));
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function addTeam() {
    try {
      await api.post(
        "/organizer/team",
        { ...teamForm, id_event: Number(teamForm.id_event) },
        token,
      );
      showToast("Tim Pengelola berhasil ditambahkan!", "success");
      setTeamForm({ email: "", id_event: "", role_event: "VIEWER" });
      api.get("/organizer/team", token).then((d) => setTeam(d.data || []));
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
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        data: [15, 28, 22, 45, 38, 60],
        backgroundColor: "#c85c00",
        borderRadius: 8,
      },
    ],
  };
  const incomeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        data: [1.2, 2.5, 1.8, 4.2, 3.5, 5.8],
        borderColor: "#c85c00",
        backgroundColor: "rgba(200,92,0,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const titles = {
    overview: "Dasbor Penyelenggara",
    events: "Manajemen Acara",
    payments: "Monitoring Transaksi",
    team: "Tim Pengelola",
    tickets: "Ticketing & Peserta",
    reports: "Laporan / Lalu Lintas",
  };

  const ROLE_ACCESS = {
    OWNER: ["overview", "events", "payments", "team", "tickets", "reports"],
    TICKET_ADMIN: ["overview", "tickets"],
    PAYMENT_ADMIN: ["overview", "payments"],
    TRAFFIC_ADMIN: ["overview", "reports"],
    CONTENT_ADMIN: ["overview", "events"],
    VIEWER: ["overview"],
  };

  const isMainOrganizer = [
    "PENYELENGGARA",
    "ADMIN_BG",
    "ADMIN_SYSTEM",
  ].includes(user?.nama_role);
  const teamRole = user?.team_role || (isMainOrganizer ? "OWNER" : "VIEWER");
  const allowedMenuKeys = useMemo(() => {
    if (isMainOrganizer) return ROLE_ACCESS.OWNER;
    return ROLE_ACCESS[teamRole] || ROLE_ACCESS.VIEWER;
  }, [isMainOrganizer, teamRole]);
  const visibleMenu = useMemo(
    () => MENU.filter((item) => allowedMenuKeys.includes(item.key)),
    [allowedMenuKeys],
  );
  const canCreateEvent = isMainOrganizer || teamRole === "OWNER";
  const canEditEvent = canCreateEvent || teamRole === "CONTENT_ADMIN";

  useEffect(() => {
    if (!allowedMenuKeys.includes(active)) {
      setActive(allowedMenuKeys[0] || "overview");
    }
  }, [active, allowedMenuKeys]);

  return (
    <DashboardShell
      title={titles[active]}
      menuItems={visibleMenu}
      activeKey={active}
      onMenuChange={setActive}
    >
      {active === "overview" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {!isMainOrganizer && (
            <div className="admin-card" style={{ padding: "1rem 1.25rem" }}>
              <div
                style={{
                  fontWeight: 900,
                  color: "var(--admin-text)",
                  marginBottom: "0.25rem",
                }}
              >
                Akses Tim: {ROLE_LABEL[teamRole] || teamRole}
              </div>
              <div style={{ color: "var(--admin-muted)", fontSize: "0.88rem" }}>
                Tab yang tampil sudah dibatasi sesuai jobdesk kamu di acara{" "}
                {user?.team_event_name || "yang ditugaskan"}.
              </div>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "1rem",
            }}
          >
            <StatCard
              label="Total Acara"
              value={stats.total_events || 0}
              icon={<Calendar size={20} />}
            />
            <StatCard
              label="Acara Aktif"
              value={stats.published_events || 0}
              icon={<CheckCircle size={20} />}
              color="#16a34a"
            />
            <StatCard
              label="Anggota Tim"
              value={stats.team_members || 0}
              icon={<Users size={20} />}
              color="#1d4ed8"
            />
            <StatCard
              label="Total Pendapatan"
              value={`Rp ${(stats.total_income || 0).toLocaleString("id-ID")}`}
              icon={<DollarSign size={20} />}
              color="#d97706"
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: "1rem",
            }}
          >
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">
                  Tiket Terjual (6 Bulan)
                </span>
              </div>
              <div style={{ padding: "1rem", height: 200 }}>
                <Bar data={salesData} options={chartOpts} />
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Pendapatan (Juta Rp)</span>
              </div>
              <div style={{ padding: "1rem", height: 200 }}>
                <Line data={incomeData} options={chartOpts} />
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                Acara Saya ({events.length})
              </span>
              {canCreateEvent && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setActive("events");
                    setShowForm(true);
                  }}
                >
                  <Plus size={14} /> Buat Acara
                </button>
              )}
            </div>
            {events.length === 0 ? (
              <Empty
                icon="📅"
                title="Belum ada acara"
                desc="Buat event pertamamu!"
              />
            ) : (
              <div className="responsive-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 5).map((e) => (
                      <tr key={e.id_event}>
                        <td style={{ fontWeight: 700 }}>{e.nama_event}</td>
                        <td>{e.nama_category}</td>
                        <td>
                          <span
                            className={`admin-badge ${e.status_event === "PUBLISHED" ? "green" : e.status_event === "PENDING" ? "orange" : "gray"}`}
                          >
                            {e.status_event}
                          </span>
                        </td>
                        <td>
                          {new Date(e.tanggal_mulai).toLocaleDateString(
                            "id-ID",
                          )}
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
        <div style={{ display: "grid", gap: "1rem" }}>
          {canCreateEvent && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditEvent(null);
                }}
              >
                <Plus size={16} /> Buat Acara Baru
              </button>
            </div>
          )}
          {showForm && canEditEvent && (
            <div className="admin-card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "1rem",
                    color: "var(--admin-text)",
                  }}
                >
                  {editEvent ? "Edit Acara" : "Buat Acara Baru"}
                </span>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--admin-muted)",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <EventForm
                initial={editEvent}
                categories={categories}
                onSave={saveEvent}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                Daftar Event ({events.length})
              </span>
            </div>
            {events.length === 0 ? (
              <Empty icon="📅" title="Belum ada acara" />
            ) : (
              <div className="responsive-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Kategori</th>
                      <th>Jenis</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id_event}>
                        <td style={{ fontWeight: 700 }}>{e.nama_event}</td>
                        <td>{e.nama_category}</td>
                        <td>
                          <span className="admin-badge blue">
                            {e.jenis_event}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${e.status_event === "PUBLISHED" ? "green" : e.status_event === "PENDING" ? "orange" : "gray"}`}
                          >
                            {e.status_event}
                          </span>
                        </td>
                        <td>
                          {new Date(e.tanggal_mulai).toLocaleDateString(
                            "id-ID",
                          )}
                        </td>
                        <td>
                          {canEditEvent ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setEditEvent(e);
                                setShowForm(true);
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "var(--admin-muted)",
                                fontSize: "0.8rem",
                              }}
                            >
                              Lihat
                            </span>
                          )}
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

      {active === "payments" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "1rem",
            }}
          >
            <StatCard
              label="Total Transaksi"
              value={payments.length}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              label="Lunas"
              value={
                payments.filter(
                  (p) =>
                    p.status_payment === "PAID" ||
                    p.status_payment === "COD_PAID",
                ).length
              }
              icon={<CheckCircle size={20} />}
              color="#16a34a"
            />
          </div>
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Riwayat Transaksi</span>
            </div>
            {payments.length === 0 ? (
              <Empty icon="💳" title="Belum ada transaksi" />
            ) : (
              <div className="responsive-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pembeli</th>
                      <th>Event</th>
                      <th>Metode</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id_payment}>
                        <td style={{ fontWeight: 700 }}>{p.nama_awal}</td>
                        <td>{p.nama_event}</td>
                        <td>{p.nama_metode}</td>
                        <td style={{ fontWeight: 700 }}>
                          Rp {Number(p.jumlah_bayar).toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${p.status_payment === "PAID" || p.status_payment === "COD_PAID" ? "green" : p.status_payment === "PENDING" || p.status_payment === "COD_PENDING" ? "orange" : "red"}`}
                          >
                            {p.status_payment}
                          </span>
                        </td>
                        <td>
                          {new Date(p.tanggal_payment).toLocaleDateString(
                            "id-ID",
                          )}
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

      {active === "team" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div
            className="admin-card team-add-card"
            style={{ padding: "1.25rem", overflow: "visible" }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: "0.95rem",
                color: "var(--admin-text)",
                marginBottom: "1rem",
              }}
            >
              Tambah Anggota Tim Pengelola
            </div>
            <div
              className="team-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: "0.75rem",
                alignItems: "end",
                overflow: "visible",
              }}
            >
              <div className="team-form-field">
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--admin-muted)",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Email Anggota
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: "0.88rem",
                  }}
                  placeholder="email@contoh.com"
                  value={teamForm.email}
                  onChange={(e) =>
                    setTeamForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="team-form-field">
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--admin-muted)",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Event
                </label>
                <StyledSelect
                  className="admin-select-card"
                  value={teamForm.id_event}
                  label="Pilih event..."
                  options={[
                    { value: "", label: "Pilih event..." },
                    ...events.map((e) => ({
                      value: e.id_event,
                      label: e.nama_event,
                    })),
                  ]}
                  onChange={(v) => setTeamForm((f) => ({ ...f, id_event: v }))}
                />
              </div>
              <div className="team-form-field">
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--admin-muted)",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Jobdesk / Permission
                </label>
                <StyledSelect
                  className="admin-select-card"
                  value={teamForm.role_event}
                  label="Pilih jobdesk..."
                  options={ROLES.map((r) => ({
                    value: r,
                    label: ROLE_LABEL[r] || r,
                  }))}
                  onChange={(v) =>
                    setTeamForm((f) => ({ ...f, role_event: v }))
                  }
                />
              </div>
              <button className="btn btn-primary" onClick={addTeam}>
                <Plus size={15} /> Tambah
              </button>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                Anggota Tim ({team.length})
              </span>
            </div>
            {team.length === 0 ? (
              <Empty
                icon="👥"
                title="Belum ada tim pengelola"
                desc="Tambah anggota tim untuk membantu mengelola event"
              />
            ) : (
              <div className="responsive-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Jobdesk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((t) => (
                      <tr key={t.id_event_organizer}>
                        <td style={{ fontWeight: 700 }}>
                          {t.nama_awal} {t.nama_akhir}
                        </td>
                        <td>{t.email}</td>
                        <td>{t.nama_event}</td>
                        <td>
                          <span className="admin-badge blue">
                            {ROLE_LABEL[t.role_event] || t.role_event}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${t.status_member === "ACTIVE" ? "green" : "gray"}`}
                          >
                            {t.status_member}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="admin-card" style={{ padding: "1.25rem" }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: "0.9rem",
                color: "var(--admin-text)",
                marginBottom: "0.75rem",
              }}
            >
              Keterangan Jobdesk
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: "0.5rem",
              }}
            >
              {[
                ["TICKET_ADMIN", "Lihat & kelola tiket peserta"],
                ["PAYMENT_ADMIN", "Lihat & kelola pembayaran"],
                ["TRAFFIC_ADMIN", "Lihat traffic & CCTV"],
                ["CONTENT_ADMIN", "Bantu kelola konten event"],
                ["VIEWER", "Hanya melihat overview"],
              ].map(([r, d]) => (
                <div
                  key={r}
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      color: "var(--admin-text)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {ROLE_LABEL[r]}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--admin-muted)" }}
                  >
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === "tickets" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">
              Data Peserta ({tickets.length})
            </span>
          </div>
          {tickets.length === 0 ? (
            <Empty icon="🎫" title="Belum ada peserta" />
          ) : (
            <div className="responsive-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Tiket</th>
                    <th>Kode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id_tiket_user}>
                      <td style={{ fontWeight: 700 }}>
                        {t.nama_awal} {t.nama_akhir}
                      </td>
                      <td>{t.email || "—"}</td>
                      <td>{t.nama_event}</td>
                      <td>{t.nama_tiket}</td>
                      <td
                        style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {t.kode_tiket}
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${t.status_tiket === "VALID" ? "green" : t.status_tiket === "USED" ? "gray" : "orange"}`}
                        >
                          {t.status_tiket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === "reports" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {reports.length === 0 ? (
            <Empty
              icon="📊"
              title="Belum ada report"
              desc="Laporan acara akan muncul di sini setelah acara berjalan"
            />
          ) : (
            reports.map((r) => (
              <div
                key={r.id_laporan}
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
                    background: "#f0fdf4",
                    color: "#16a34a",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{r.nama_event}</div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}
                  >
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardShell>
  );
}
