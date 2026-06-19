import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import StyledSelect from "../../components/ui/StyledSelect";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.25rem",
          background: open ? "var(--orange-dim)" : "var(--panel)",
          border: "none",
          cursor: "pointer",
          gap: "1rem",
          textAlign: "left",
        }}
      >
        <span
          style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}
        >
          {item.pertanyaan}
        </span>
        {open ? (
          <ChevronUp
            size={18}
            color="var(--orange)"
            style={{ flexShrink: 0 }}
          />
        ) : (
          <ChevronDown
            size={18}
            color="var(--text-muted)"
            style={{ flexShrink: 0 }}
          />
        )}
      </button>
      {open && (
        <div
          style={{
            padding: "0 1.25rem 1.25rem",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            background: "var(--panel)",
          }}
        >
          {item.jawaban}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ pertanyaan: "", kategori: "Umum" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { token } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    api
      .get("/faq")
      .then((d) => setFaqs(d.data || []))
      .catch(() => setFaqs([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      showToast("Login dulu untuk mengirim pertanyaan", "error");
      return;
    }
    setSending(true);
    try {
      await api.post("/faq-submit", form, token);
      showToast("Pertanyaan terkirim! Admin akan segera membalas.", "success");
      setSent(true);
      setForm({ pertanyaan: "", kategori: "Umum" });
    } catch {
      showToast("Gagal mengirim", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main
        className="container page-main"
        style={{
          paddingTop: "2rem",
          paddingBottom: "3rem",
          display: "grid",
          gap: "2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontWeight: 900,
              fontSize: "clamp(1.5rem,4vw,2.2rem)",
              marginBottom: "0.4rem",
            }}
          >
            Bantuan & FAQ
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Temukan jawaban untuk pertanyaan umum tentang The Village
          </p>
        </div>

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {faqs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-dim)",
              }}
            >
              Belum ada FAQ tersedia
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {faqs.map((f) => (
                <FaqItem key={f.id_faq} item={f} />
              ))}
            </div>
          )}
        </div>

        <div
          className="card"
          style={{
            padding: "1.75rem",
            maxWidth: 600,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h3
            style={{
              fontWeight: 900,
              fontSize: "1.1rem",
              marginBottom: "0.35rem",
            }}
          >
            Punya pertanyaan lain?
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              marginBottom: "1.25rem",
            }}
          >
            Pertanyaanmu akan dijawab oleh tim admin.
          </p>
          {sent ? (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "var(--success)",
              }}
            >
              ✅ Pertanyaan terkirim! Kami akan segera membalas.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "1rem" }}
            >
              <div>
                <label className="input-label">Kategori</label>
                <StyledSelect
                  value={form.kategori}
                  label="Pilih kategori..."
                  options={["Umum", "Tiket", "Pembayaran", "Event", "Akun", "Lainnya"]}
                  onChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
                />
              </div>
              <div>
                <label className="input-label">Pertanyaan</label>
                <textarea
                  className="input"
                  rows={3}
                  required
                  value={form.pertanyaan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pertanyaan: e.target.value }))
                  }
                  placeholder="Tulis pertanyaanmu di sini…"
                  style={{ resize: "vertical" }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
                style={{ justifySelf: "start" }}
              >
                <Send size={15} /> {sending ? "Mengirim…" : "Kirim Pertanyaan"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
