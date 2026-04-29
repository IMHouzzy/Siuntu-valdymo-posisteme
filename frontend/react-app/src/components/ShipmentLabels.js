// components/ShipmentLabels.jsx

import { useState } from "react";
import "../styles/ShipmentLabels.css";
import { FiBox, FiCheck, FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { shipmentLabelsApi } from "../services/api";
const ASSET_BASE = (process.env.REACT_APP_API_URL || "/api").replace(/\/api\/?$/, "");
/**
 * @param {object}   props
 * @param {number}   props.shipmentId
 * @param {string}   props.trackingNumber
 * @param {Array}    props.packages          [{ id_Package, labelFile, packageIndex }]
 * @param {Function} props.onClose
 */
export default function ShipmentLabels({ shipmentId, trackingNumber, packages, onClose }) {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [loadingMergedPdf, setLoadingMergedPdf] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const labelUrl = (pkg) =>
    pkg.labelFile?.startsWith("http") ? pkg.labelFile : `${ASSET_BASE}${pkg.labelFile}`;
  // ── Single label: download ────────────────────────────────────────────────
  const handleDownload = (pkg) => {
    const link = document.createElement("a");
    link.href = labelUrl(pkg);
    link.download = `label_${trackingNumber}_P${String(pkg.packageIndex ?? pkg.id_Package).padStart(2, "0")}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Single label: print (open in new tab) ────────────────────────────────
  const handlePrintOne = (pkg) => {
    window.open(labelUrl(pkg), "_blank", "noopener,noreferrer");
  };

  // ── Bulk: download all as a single ZIP ───────────────────────────────────
  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const res = await shipmentLabelsApi.downloadZip(shipmentId);
      if (!res.ok) throw new Error(`Klaida: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `labels_${trackingNumber}.zip`;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Nepavyko atsisiųsti ZIP: ${err.message}`);
    } finally { setDownloadingZip(false); }
  };
  // ── Bulk: open merged PDF (all labels in one PDF) for printing ────────────
  const handlePrintAll = async () => {
    setLoadingMergedPdf(true);
    try {
      const res = await shipmentLabelsApi.downloadMerged(shipmentId);
      if (!res.ok) throw new Error(`Klaida: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank", "noopener,noreferrer");
      if (newTab) {
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const link = document.createElement("a");
        link.href = url; link.download = `all_labels_${trackingNumber}.pdf`;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5_000);
      }
    } catch (err) {
      alert(`Nepavyko sukurti bendro PDF: ${err.message}`);
    } finally { setLoadingMergedPdf(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sl-wrap">

      {/* ── Success banner ──────────────────────────────────────────────── */}
      <div className="sl-banner">
        <span className="sl-banner-icon"><FiCheck size={30} /></span>
        <div>
          <div className="sl-banner-title">Siunta sėkmingai užregistruota</div>
          <div className="sl-banner-sub">
            Siuntos numeris: <strong>{trackingNumber}</strong>
            &nbsp;·&nbsp;
            Pakuočių: <strong>{packages?.length ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* ── Bulk actions ────────────────────────────────────────────────── */}
      <div className="sl-bulk-actions">
        <button
          className="sl-btn sl-btn-outline"
          onClick={handleDownloadZip}
          disabled={downloadingZip}
        >
          {downloadingZip ? (
            <>
              <span className="sl-spinner" />
              Ruošiama…
            </>
          ) : (
            <>
              <FiDownload size={15} /> Atsisiųsti visas
            </>
          )}
        </button>

        <button
          className="sl-btn sl-btn-primary"
          onClick={handlePrintAll}
          disabled={loadingMergedPdf}
        >
          {loadingMergedPdf ? (
            <>
              <span className="sl-spinner sl-spinner--white" />
              Ruošiama…
            </>
          ) : (
            <>
              <FiPrinter size={15} /> Spausdinti visas
            </>
          )}
        </button>
      </div>

      {/* ── Package list ────────────────────────────────────────────────── */}
      <div className="sl-list">
        {packages?.map((pkg, idx) => {
          const pkgIndex = pkg.packageIndex ?? idx + 1;
          return (
            <div key={pkg.id_Package ?? idx} className="sl-row">

              {/* PDF preview iframe */}
              <div className="sl-preview-wrap">
                <iframe
                  className="sl-preview"
                  src={labelUrl(pkg)}
                  title={`Etiketė ${pkgIndex}`}
                />
              </div>

              {/* Info + per-package actions */}
              <div className="sl-row-info">
                <div className="sl-row-title">
                  <FiBox size={20} /> Pakuotė {pkgIndex}
                  <span className="sl-row-id">#{pkg.id_Package}</span>
                </div>
                <div className="sl-row-tracking">
                  {trackingNumber}-P{String(pkgIndex).padStart(2, "0")}
                </div>

                <div className="sl-row-actions">
                  <button
                    className="sl-btn sl-btn-sm sl-btn-outline"
                    onClick={() => handleDownload(pkg)}
                  >
                    <FiDownload size={15} /> Atsisiųsti
                  </button>
                  <button
                    className="sl-btn sl-btn-sm sl-btn-primary"
                    onClick={() => handlePrintOne(pkg)}
                  >
                    <FiPrinter size={15} /> Spausdinti
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="sl-footer">
        <button className="sl-btn sl-btn-ghost" onClick={onClose}>
          <FiArrowLeft size={15} /> Grįžti į sąrašą
        </button>
      </div>

    </div>
  );
}
