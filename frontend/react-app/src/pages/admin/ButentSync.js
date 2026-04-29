import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDatabase,
  FiCloudLightning,
} from "react-icons/fi";
import "../../styles/ButentSync.css";
import { syncApi } from "../../services/api";

export default function ButentSync() {
  const { companyId } = useParams();
  const [phase, setPhase] = useState("check"); // check | loading | conflicts | report
  const [integration, setIntegration] = useState(null);
  const [session, setSession] = useState(null);
  const [resolutions, setResolutions] = useState({
    clients: {},
    products: {},
    orders: {},
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    checkIntegration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const checkIntegration = async () => {
    try {
      const data = await syncApi.checkIntegration(companyId);
      setIntegration(data);
      if (!data.isConfigured || !data.isEnabled) {
        setPhase("check");
      }
    } catch (err) {
      setError(err.message || "Nepavyko patikrinti integracijos");
    }
  };

  const startSync = async () => {
    setPhase("loading");
    setError(null);
    try {
      const data = await syncApi.startSync(companyId);
      setSession(data);

      // Initialize resolutions with all "local" by default
      const clientRes = {};
      data.clientConflicts.forEach((c) => {
        clientRes[c.externalClientId] = {};
        c.fields.forEach((f) => {
          clientRes[c.externalClientId][f.fieldName] = "local";
        });
      });

      const productRes = {};
      data.productConflicts.forEach((p) => {
        productRes[p.externalCode] = {};
        p.fields.forEach((f) => {
          productRes[p.externalCode][f.fieldName] = "local";
        });
      });

      const orderRes = {};
      data.orderConflicts.forEach((o) => {
        orderRes[o.externalDocumentId] = {};
        o.fields.forEach((f) => {
          orderRes[o.externalDocumentId][f.fieldName] = "local";
        });
      });

      setResolutions({ clients: clientRes, products: productRes, orders: orderRes });
      setPhase("conflicts");
    } catch (err) {
      setError(err.message || "Sinchronizacijos pradėti nepavyko");
      setPhase("check");
    }
  };

  const applyResolutions = async () => {
    setApplying(true);
    setError(null);

    try {
      const payload = {
        companyId: parseInt(companyId, 10),
        clientResolutions: Object.entries(resolutions.clients).map(([id, fields]) => ({
          externalClientId: parseInt(id, 10),
          fieldChoices: fields,
        })),
        productResolutions: Object.entries(resolutions.products).map(([id, fields]) => ({
          externalCode: parseInt(id, 10),
          fieldChoices: fields,
        })),
        orderResolutions: Object.entries(resolutions.orders).map(([id, fields]) => ({
          externalDocumentId: parseInt(id, 10),
          fieldChoices: fields,
        })),
      };

      const reportData = await syncApi.applyResolutions(payload);
      setReport(reportData);
      setPhase("report");
    } catch (err) {
      setError(err.message || "Pakeitimų įrašyti nepavyko");
    } finally {
      setApplying(false);
    }
  };

  const setClientField = (extId, fieldName, choice) => {
    setResolutions((prev) => ({
      ...prev,
      clients: {
        ...prev.clients,
        [extId]: {
          ...prev.clients[extId],
          [fieldName]: choice,
        },
      },
    }));
  };

  const setProductField = (extCode, fieldName, choice) => {
    setResolutions((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [extCode]: {
          ...prev.products[extCode],
          [fieldName]: choice,
        },
      },
    }));
  };

  const setOrderField = (extDocId, fieldName, choice) => {
    setResolutions((prev) => ({
      ...prev,
      orders: {
        ...prev.orders,
        [extDocId]: {
          ...prev.orders[extDocId],
          [fieldName]: choice,
        },
      },
    }));
  };

  const reset = () => {
    setPhase("check");
    setSession(null);
    setResolutions({ clients: {}, products: {}, orders: {} });
    setReport(null);
    setError(null);
  };

  if (phase === "check") {
    return (
      <div className="butent-sync">
        <div className="bs-header">
          <h1 className="bs-title">Būtent sinchronizacija</h1>
          <p className="bs-subtitle">
            Patikrinkite ir išspręskite duomenų nesutapimus tarp Būtent API ir vietinės duomenų bazės
          </p>
        </div>

        {error && (
          <div className="bs-alert bs-alert--error">
            <FiXCircle />
            <span>{error}</span>
          </div>
        )}

        {integration && (
          <div className="bs-card">
            <div className="bs-card-header">
              <FiDatabase />
              <span>Integracijos būsena</span>
            </div>
            <div className="bs-card-body">
              {!integration.isConfigured ? (
                <div className="bs-status bs-status--error">
                  <FiXCircle size={24} />
                  <div>
                    <div className="bs-status-title">Integracija nesukonfigūruota</div>
                    <div className="bs-status-text">{integration.message}</div>
                  </div>
                </div>
              ) : !integration.isEnabled ? (
                <div className="bs-status bs-status--warning">
                  <FiAlertCircle size={24} />
                  <div>
                    <div className="bs-status-title">Integracija išjungta</div>
                    <div className="bs-status-text">{integration.message}</div>
                  </div>
                </div>
              ) : (
                <div className="bs-status bs-status--success">
                  <FiCheckCircle size={24} />
                  <div>
                    <div className="bs-status-title">Integracija aktyvi</div>
                    <div className="bs-status-text">{integration.message}</div>
                    <div className="bs-status-url">{integration.baseUrl}</div>
                  </div>
                </div>
              )}
            </div>

            {integration.isConfigured && integration.isEnabled && (
              <div className="bs-card-footer">
                <button className="bs-btn bs-btn-primary" onClick={startSync}>
                  <FiRefreshCw />
                  Pradėti sinchronizaciją
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="butent-sync">
        <div className="bs-loading">
          <div className="bs-spinner" />
          <h2>Lyginami duomenys...</h2>
          <p>Užklausiame Būtent API ir lygina su vietiniais duomenimis</p>
        </div>
      </div>
    );
  }

  if (phase === "conflicts" && session) {
    const hasConflicts =
      session.stats.clientConflicts > 0 ||
      session.stats.productConflicts > 0 ||
      session.stats.orderConflicts > 0;

    return (
      <div className="butent-sync">
        <div className="bs-header">
          <h1 className="bs-title">Duomenų nesutapimai</h1>
          <p className="bs-subtitle">
            Pasirinkite kuriuos duomenis išsaugoti: vietinius ar iš Būtent
          </p>
        </div>

        {error && (
          <div className="bs-alert bs-alert--error">
            <FiXCircle />
            <span>{error}</span>
          </div>
        )}

        <div className="bs-stats">
          <div className="bs-stat">
            <div className="bs-stat-value">{session.stats.totalClients}</div>
            <div className="bs-stat-label">Klientai</div>
            <div className="bs-stat-conflicts">{session.stats.clientConflicts} konfliktų</div>
          </div>
          <div className="bs-stat">
            <div className="bs-stat-value">{session.stats.totalProducts}</div>
            <div className="bs-stat-label">Prekės</div>
            <div className="bs-stat-conflicts">{session.stats.productConflicts} konfliktų</div>
          </div>
          <div className="bs-stat">
            <div className="bs-stat-value">{session.stats.totalOrders}</div>
            <div className="bs-stat-label">Užsakymai</div>
            <div className="bs-stat-conflicts">{session.stats.orderConflicts} konfliktų</div>
          </div>
        </div>

        {!hasConflicts ? (
          <div className="bs-card">
            <div className="bs-card-body">
              <div className="bs-status bs-status--success">
                <FiCheckCircle size={32} />
                <div>
                  <div className="bs-status-title">Nesutapimų nerasta</div>
                  <div className="bs-status-text">
                    Visi duomenys sutampa tarp Būtent ir vietinės duomenų bazės
                  </div>
                </div>
              </div>
            </div>
            <div className="bs-card-footer">
              <button className="bs-btn" onClick={reset}>
                Grįžti
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Clients */}
            {session.clientConflicts.length > 0 && (
              <div className="bs-section">
                <h2 className="bs-section-title">Klientai ({session.clientConflicts.length})</h2>
                <div className="bs-conflicts">
                  {session.clientConflicts.map((client) => (
                    <ConflictCard
                      key={`client-${client.externalClientId}`}
                      title={client.name || `Klientas #${client.externalClientId}`}
                      fields={client.fields}
                      resolutions={resolutions.clients[client.externalClientId] || {}}
                      onFieldChange={(fieldName, choice) =>
                        setClientField(client.externalClientId, fieldName, choice)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {session.productConflicts.length > 0 && (
              <div className="bs-section">
                <h2 className="bs-section-title">Prekės ({session.productConflicts.length})</h2>
                <div className="bs-conflicts">
                  {session.productConflicts.map((product) => (
                    <ConflictCard
                      key={`product-${product.externalCode}`}
                      title={product.name || `Prekė #${product.externalCode}`}
                      fields={product.fields}
                      resolutions={resolutions.products[product.externalCode] || {}}
                      onFieldChange={(fieldName, choice) =>
                        setProductField(product.externalCode, fieldName, choice)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Orders */}
            {session.orderConflicts.length > 0 && (
              <div className="bs-section">
                <h2 className="bs-section-title">Užsakymai ({session.orderConflicts.length})</h2>
                <div className="bs-conflicts">
                  {session.orderConflicts.map((order) => (
                    <ConflictCard
                      key={`order-${order.externalDocumentId}`}
                      title={order.orderNumber || `Užsakymas #${order.externalDocumentId}`}
                      fields={order.fields}
                      resolutions={resolutions.orders[order.externalDocumentId] || {}}
                      onFieldChange={(fieldName, choice) =>
                        setOrderField(order.externalDocumentId, fieldName, choice)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bs-actions">
              <button className="bs-btn" onClick={reset}>
                Atšaukti
              </button>
              <button
                className="bs-btn bs-btn-primary"
                onClick={applyResolutions}
                disabled={applying}
              >
                {applying ? (
                  <>
                    <div className="bs-btn-spinner" />
                    Taikoma...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Taikyti pakeitimus
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === "report" && report) {
    return (
      <div className="butent-sync">
        <div className="bs-header">
          <h1 className="bs-title">Sinchronizacijos ataskaita</h1>
          <p className="bs-subtitle">
            <FiClock /> {new Date(report.completedAt).toLocaleString("lt-LT")}
          </p>
        </div>

        {report.errors.length > 0 && (
          <div className="bs-alert bs-alert--error">
            <FiXCircle />
            <div>
              {report.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <div className="bs-card">
          <div className="bs-card-header">
            <FiCheckCircle />
            <span>Pakeitimai</span>
          </div>
          <div className="bs-card-body">
            <div className="bs-report-grid">
              <div className="bs-report-item">
                <div className="bs-report-label">Klientai atnaujinti</div>
                <div className="bs-report-value">{report.clientsUpdated}</div>
              </div>
              <div className="bs-report-item">
                <div className="bs-report-label">Prekės atnaujintos</div>
                <div className="bs-report-value">{report.productsUpdated}</div>
              </div>
              <div className="bs-report-item">
                <div className="bs-report-label">Užsakymai atnaujinti</div>
                <div className="bs-report-value">{report.ordersUpdated}</div>
              </div>
              <div className="bs-report-item bs-report-item--total">
                <div className="bs-report-label">Iš viso pakeitimų</div>
                <div className="bs-report-value">{report.totalChanges}</div>
              </div>
            </div>
          </div>
          <div className="bs-card-footer">
            <button className="bs-btn bs-btn-primary" onClick={reset}>
              Baigti
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────────────────────────────────────────
// ConflictCard Component
// ────────────────────────────────────────────────────────────────────────────────

function ConflictCard({ title, fields, resolutions, onFieldChange }) {
  return (
    <div className="bs-conflict-card">
      <div className="bs-conflict-header">
        <FiAlertCircle />
        <span>{title}</span>
      </div>
      <div className="bs-conflict-body">
        {fields.map((field) => (
          <div key={field.fieldName} className="bs-field-conflict">
            <div className="bs-field-label">{field.label}</div>
            <div className="bs-field-options">
              <button
                type="button"
                className={`bs-choice ${
                  resolutions[field.fieldName] === "local" ? "bs-choice--active" : ""
                }`}
                onClick={() => onFieldChange(field.fieldName, "local")}
              >
                <div className="bs-choice-header">
                  <FiDatabase size={16} />
                  <span>Vietinis</span>
                  {resolutions[field.fieldName] === "local" && <FiCheckCircle className="bs-choice-check" />}
                </div>
                <div className="bs-choice-value">{formatValue(field.localValue)}</div>
              </button>

              <button
                type="button"
                className={`bs-choice ${
                  resolutions[field.fieldName] === "butent" ? "bs-choice--active" : ""
                }`}
                onClick={() => onFieldChange(field.fieldName, "butent")}
              >
                <div className="bs-choice-header">
                  <FiCloudLightning size={16} />
                  <span>Būtent</span>
                  {resolutions[field.fieldName] === "butent" && (
                    <FiCheckCircle className="bs-choice-check" />
                  )}
                </div>
                <div className="bs-choice-value">{formatValue(field.butentValue)}</div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(val) {
  if (val === null || val === undefined || val === "") return <em className="bs-empty">—</em>;
  if (typeof val === "boolean") return val ? "Taip" : "Ne";
  
  // Handle multi-line values (order items, etc.)
  if (typeof val === "string" && val.includes("\n")) {
    const lines = val.split("\n").filter(Boolean);
    if (lines.length > 1) {
      return (
        <div className="bs-multiline-value">
          {lines.map((line, i) => (
            <div key={i} className="bs-value-line">{line}</div>
          ))}
        </div>
      );
    }
  }
  
  // Handle semicolon-separated fallback
  if (typeof val === "string" && val.includes(";")) {
    const items = val.split(";").map(s => s.trim()).filter(Boolean);
    if (items.length > 1) {
      return (
        <div className="bs-multiline-value">
          {items.map((item, i) => (
            <div key={i} className="bs-value-line">{item}</div>
          ))}
        </div>
      );
    }
  }
  
  return String(val);
}