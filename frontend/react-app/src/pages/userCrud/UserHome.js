// pages/userCrud/UserHome.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import "../../styles/UserHome.css";

function TruckIllustration() {
  return (
    <div className="uhome-hero-illustration" aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="uhome-truck-svg">
        {/* Road */}
        <rect x="0" y="230" width="420" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
        <rect x="30" y="232" width="60" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
        <rect x="120" y="232" width="60" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
        <rect x="210" y="232" width="60" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
        <rect x="300" y="232" width="60" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
        {/* Truck cargo body */}
        <rect x="40" y="120" width="220" height="110" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="150" y1="120" x2="150" y2="230" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="40" y1="175" x2="260" y2="175" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Truck cab */}
        <path d="M260 145 L260 230 L360 230 L360 175 L330 145 Z" fill="rgba(29,78,216,0.5)" stroke="rgba(29,78,216,0.8)" strokeWidth="1.5" />
        <path d="M268 150 L268 175 L350 175 L350 170 L325 150 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="300" y1="175" x2="300" y2="230" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="282" y="200" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
        {/* Headlight */}
        <rect x="353" y="178" width="10" height="6" rx="2" fill="#fbbf24" opacity="0.9" />
        <ellipse cx="370" cy="181" rx="14" ry="6" fill="#fbbf24" opacity="0.15" />
        {/* Wheels */}
        <circle cx="100" cy="232" r="22" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <circle cx="100" cy="232" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="100" cy="232" r="4" fill="rgba(255,255,255,0.2)" />
        <circle cx="200" cy="232" r="22" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <circle cx="200" cy="232" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="200" cy="232" r="4" fill="rgba(255,255,255,0.2)" />
        <circle cx="320" cy="232" r="22" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <circle cx="320" cy="232" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="320" cy="232" r="4" fill="rgba(255,255,255,0.2)" />
        {/* Packages stacked */}
        <rect x="60" y="88" width="44" height="36" rx="4" fill="rgba(29,78,216,0.4)" stroke="rgba(29,78,216,0.7)" strokeWidth="1.5" />
        <line x1="82" y1="88" x2="82" y2="124" stroke="rgba(29,78,216,0.6)" strokeWidth="1" />
        <line x1="60" y1="106" x2="104" y2="106" stroke="rgba(29,78,216,0.6)" strokeWidth="1" />
        <rect x="114" y="78" width="52" height="46" rx="4" fill="rgba(22,163,74,0.35)" stroke="rgba(22,163,74,0.6)" strokeWidth="1.5" />
        <line x1="140" y1="78" x2="140" y2="124" stroke="rgba(22,163,74,0.5)" strokeWidth="1" />
        <line x1="114" y1="101" x2="166" y2="101" stroke="rgba(22,163,74,0.5)" strokeWidth="1" />
        <rect x="176" y="92" width="40" height="32" rx="4" fill="rgba(217,119,6,0.3)" stroke="rgba(217,119,6,0.6)" strokeWidth="1.5" />
        <line x1="196" y1="92" x2="196" y2="124" stroke="rgba(217,119,6,0.5)" strokeWidth="1" />
        {/* Location pin */}
        <path d="M310 50 C302 50 296 56 296 63 C296 72 310 86 310 86 C310 86 324 72 324 63 C324 56 318 50 310 50Z" fill="#1d4ed8" />
        <circle cx="310" cy="63" r="5" fill="#fff" />
        <path d="M310 86 Q310 103 310 120" stroke="rgba(29,78,216,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        {/* Speed lines */}
        <line x1="0" y1="168" x2="30" y2="168" stroke="rgba(255,255,255,0.07)" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="180" x2="20" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="192" x2="35" y2="192" stroke="rgba(255,255,255,0.04)" strokeWidth="2" strokeLinecap="round" />
        {/* Sparkles */}
        <circle cx="380" cy="80" r="2" fill="rgba(255,255,255,0.3)" />
        <circle cx="20" cy="100" r="1.5" fill="rgba(255,255,255,0.2)" />
        <circle cx="390" cy="130" r="1.5" fill="rgba(255,255,255,0.15)" />
      </svg>

      <div className="uhome-float-card uhome-float-card--1">
        <div className="uhome-float-dot uhome-float-dot--green" />
        <span>Pristatyta</span>
      </div>
      <div className="uhome-float-card uhome-float-card--2">
        <div className="uhome-float-dot uhome-float-dot--blue" />
        <span>Vežama</span>
      </div>
    </div>
  );
}

export default function UserHome() {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const num = trackingInput.trim();
    if (!num) { setError("Įveskite sekimo numerį."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5065/api/tracking/${encodeURIComponent(num)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.status === 404) {
        setError("Siunta su šiuo numeriu nerasta. Patikrinkite numerį ir bandykite dar kartą.");
        setLoading(false);
        return;
      }
      if (!res.ok) { setError("Įvyko klaida. Bandykite vėliau."); setLoading(false); return; }
      const data = await res.json();
      if (data.type === "dpd") {
        window.open(data.dpdUrl, "_blank", "noopener,noreferrer");
        setLoading(false);
      } else {
        navigate(`/client/track/${encodeURIComponent(num)}`);
      }
    } catch {
      setError("Nepavyko prisijungti prie serverio.");
      setLoading(false);
    }
  };

  return (
    <div className="uhome-page">
      <section className="uhome-hero">
        <div className="uhome-hero-bg">
          <div className="uhome-hero-orb uhome-hero-orb--1" />
          <div className="uhome-hero-orb uhome-hero-orb--2" />
          <div className="uhome-hero-grid" />
        </div>

        <div className="uhome-hero-layout">
          <div className="uhome-hero-content">
            <div className="uhome-hero-badge"><FiTruck size={14} /><span>Siuntų sekimas</span></div>
            <h1 className="uhome-hero-title">
              Sekite savo siuntą<br />
              <span className="uhome-hero-title-accent">realiuoju laiku</span>
            </h1>
            <p className="uhome-hero-subtitle">
              Įveskite sekimo numerį ir sužinokite, kur šiuo metu yra jūsų siunta.
            </p>
            <form className="uhome-search-form" onSubmit={handleTrack}>
              <div className="uhome-search-wrap">
                <FiSearch className="uhome-search-icon" size={20} />
                <input
                  className="uhome-search-input"
                  type="text"               
                  placeholder="pvz. PKG-0-00-0000000000-0000"
                  value={trackingInput}
                  onChange={(e) => { setTrackingInput(e.target.value); setError(""); }}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="uhome-search-btn" type="submit" disabled={loading}>
                  {loading ? <span className="uhome-spinner" /> : <><span>Sekti</span><FiArrowRight size={16} /></>}
                </button>
              </div>
              {error && <p className="uhome-search-error">{error}</p>}
            </form>
          </div>
          <TruckIllustration />
        </div>
      </section>

      <section className="uhome-steps">
        <div className="uhome-steps-inner">
          <Step icon={<FiPackage size={22} />} num="01" title="Įveskite sekimo numerį"
            desc="Sekimo numerį rasite užsakymo patvirtinimo el. laiške arba siuntos etiketėje." />
          <div className="uhome-steps-line" />
          <Step icon={<FiTruck size={22} />} num="02" title="Stebėkite maršrutą"
            desc="Matykite visą siuntos kelionės istoriją — nuo sukūrimo iki pristatymo." />
          <div className="uhome-steps-line" />
          <Step icon={<FiCheckCircle size={22} />} num="03" title="Gaukite siuntą"
            desc="Sužinokite tikslų pristatymo laiką ir adresą." />
        </div>
      </section>

      <section className="uhome-orders-cta">
        <div className="uhome-orders-cta-inner">
          <div>
            <div className="uhome-orders-cta-title">Jūsų užsakymai</div>
            <div className="uhome-orders-cta-sub">Peržiūrėkite visus savo užsakymus ir jų siuntas vienoje vietoje.</div>
          </div>
          <button className="uhome-orders-btn" onClick={() => navigate("/client/orders")}>
            Mano užsakymai <FiArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

function Step({ icon, num, title, desc }) {
  return (
    <div className="uhome-step">
      <div className="uhome-step-num">{num}</div>
      <div className="uhome-step-icon">{icon}</div>
      <div className="uhome-step-title">{title}</div>
      <div className="uhome-step-desc">{desc}</div>
    </div>
  );
}