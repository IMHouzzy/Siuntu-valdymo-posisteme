// pages/Companies/CompanyEdit.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { useAuth } from "../../services/AuthContext";
import { FiArrowLeft } from "react-icons/fi";

const API = "http://localhost:5065";

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  const txt = await res.text();
  if (!txt) return null;
  return JSON.parse(txt);
}

const COUNTRY_OPTIONS = [
  { value: "LT", label: "Lietuva (LT)" },
  { value: "LV", label: "Latvija (LV)" },
  { value: "EE", label: "Estija (EE)" },
  { value: "PL", label: "Lenkija (PL)" },
  { value: "DE", label: "Vokietija (DE)" },
];

export default function CompanyEdit() {
  const { id }    = useParams();
  const companyId = id ? Number(id) : null;
  const isCreate  = !companyId;
  const navigate  = useNavigate();

  const { token, user, activeCompanyId, switchCompany, setCompanySwitchLocked } = useAuth();
  const isMaster = !!user?.isMasterAdmin;

  const [initialValues, setInitialValues] = useState(null);
  // Holds the logo file when company doesn't exist yet (upload after create)
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  // Lock company switch while editing an existing company
  useEffect(() => {
    if (!token || isCreate) return;
    setCompanySwitchLocked(true);
    if (companyId && activeCompanyId !== companyId)
      switchCompany(companyId).catch(console.error);
    return () => setCompanySwitchLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, isCreate]);

  // Load existing company data, mapping every DB column to a form field
  useEffect(() => {
    if (!token) return;

    if (isCreate) {
      setInitialValues({
        // General
        name: "", companyCode: "", active: true,
        documentCode: "",
        // Contact
        email: "", phoneNumber: "", address: "",
        // Structured shipping address
        shippingStreet: "", shippingCity: "", shippingPostalCode: "", shippingCountry: "LT",
        // Structured return address
        returnStreet: "", returnCity: "", returnPostalCode: "", returnCountry: "LT",
        // Logo
        image: "",
      });
      return;
    }

    apiFetch(`${API}/api/companies/${companyId}`, token)
      .then((c) => {
        setInitialValues({
          name:               c?.name             ?? "",
          companyCode:        c?.code             ?? "",
          active:             !!c?.active,
          documentCode:       c?.documentCode     ?? "",
          email:              c?.email            ?? "",
          phoneNumber:        c?.phoneNumber      ?? "",
          address:            c?.address          ?? "",
          shippingStreet:     c?.shippingStreet     ?? "",
          shippingCity:       c?.shippingCity       ?? "",
          shippingPostalCode: c?.shippingPostalCode ?? "",
          shippingCountry:    c?.shippingCountry    ?? "LT",
          returnStreet:       c?.returnStreet       ?? "",
          returnCity:         c?.returnCity         ?? "",
          returnPostalCode:   c?.returnPostalCode   ?? "",
          returnCountry:      c?.returnCountry      ?? "LT",
          image:              c?.image             ?? "",
        });
      })
      .catch((e) => {
        console.error(e);
        alert("Nepavyko užkrauti įmonės");
        navigate("/companiesList");
      });
  }, [token, companyId, isCreate, navigate]);

  const fields = useMemo(() => [

    // ── Logo ────────────────────────────────────────────────────────────
    { type: "section", title: "Logotipas" },
    {
      name:      "image",
      label:     null,
      type:      "logo-uploader",
      colSpan:   2,
      companyId,
      // called by SmartForm's logo-uploader renderer with (file, isCreate)
      onPendingFile: (file) => setPendingLogoFile(file),
    },

    // ── General ─────────────────────────────────────────────────────────
    { type: "section", title: "Bendra informacija" },
    { name: "name",         label: "Pavadinimas",    required: true, colSpan: 2 },
    {
      name:     "companyCode",
      label:    "Įmonės kodas",
      required: true,
      disabled: () => !isMaster && !isCreate,
    },
    { name: "documentCode", label: "Dokumento kodas" },
    {
      name:     "active",
      label:    "Aktyvi",
      type:     "checkbox",
      disabled: () => !isMaster,
      help:     "Ar įmonė aktyvi sistemos?",
    },

    // ── Contact ──────────────────────────────────────────────────────────
    { type: "section", title: "Kontaktai" },
    { name: "email",       label: "El. paštas", type: "email", colSpan: 2 },
    { name: "phoneNumber", label: "Telefonas" },
    { name: "address",     label: "Juridinis adresas" },

    // ── Shipping address ─────────────────────────────────────────────────
    { type: "section", title: "Siuntimo adresas", subtitle: "Siuntėjo adresas spausdinamas ant etiketės" },
    { name: "shippingStreet",     label: "Gatvė",       placeholder: "pvz. Studentų g. 50" },
    { name: "shippingCity",       label: "Miestas",     placeholder: "pvz. Kaunas" },
    { name: "shippingPostalCode", label: "Pašto kodas", placeholder: "pvz. 51368" },
    { name: "shippingCountry",    label: "Šalis",       type: "select", options: COUNTRY_OPTIONS },

    // ── Return address ───────────────────────────────────────────────────
    { type: "section", title: "Grąžinimo adresas" },
    { name: "returnStreet",     label: "Gatvė",       placeholder: "pvz. Laisvės al. 1" },
    { name: "returnCity",       label: "Miestas",     placeholder: "pvz. Vilnius" },
    { name: "returnPostalCode", label: "Pašto kodas", placeholder: "pvz. 01100" },
    { name: "returnCountry",    label: "Šalis",       type: "select", options: COUNTRY_OPTIONS },

  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isMaster, isCreate, companyId]);

  if (!initialValues) return null;

  const handleSubmit = async (values) => {
    const body = {
      name:               values.name?.trim(),
      companyCode:        values.companyCode?.trim(),
      active:             !!values.active,
      documentCode:       values.documentCode?.trim() || "",
      email:              values.email?.trim()        || "",
      phoneNumber:        values.phoneNumber?.trim()  || "",
      address:            values.address?.trim()      || "",
      // Structured shipping
      shippingStreet:     values.shippingStreet?.trim()     || null,
      shippingCity:       values.shippingCity?.trim()       || null,
      shippingPostalCode: values.shippingPostalCode?.trim() || null,
      shippingCountry:    values.shippingCountry            || "LT",
      // Structured return
      returnStreet:       values.returnStreet?.trim()       || null,
      returnCity:         values.returnCity?.trim()         || null,
      returnPostalCode:   values.returnPostalCode?.trim()   || null,
      returnCountry:      values.returnCountry              || "LT",
      // Nullify legacy free-text fields — structured fields are source of truth
      shippingAddress: null,
      returnAddress:   null,
      // image is managed by the logo uploader endpoint directly
      image:           values.image || "",
    };

    if (isCreate) {
      const result = await apiFetch(`${API}/api/companies`, token, {
        method: "POST", body: JSON.stringify(body),
      });
      // Upload pending logo now that we have the company ID
      if (pendingLogoFile && result?.id_Company) {
        const form = new FormData();
        form.append("file", pendingLogoFile);
        await apiFetch(`${API}/api/companies/${result.id_Company}/logo`, token, {
          method: "POST", body: form,
        }).catch(console.error);
      }
    } else {
      await apiFetch(`${API}/api/companies/${companyId}`, token, {
        method: "PUT", body: JSON.stringify(body),
      });
    }

    navigate("/companiesList");
  };

  return (
    <FormPageLayout
      title={isCreate ? "Kurti įmonę" : "Redaguoti įmonę"}
      actions={
        <button className="od-back-btn" type="button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Grįžti
        </button>
      }
    >
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel={isCreate ? "Sukurti įmonę" : "Išsaugoti"}
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/companiesList")}
        onSubmit={handleSubmit}
        // pass token + isCreate so the logo uploader inside SmartForm can upload
        logoUploaderContext={{ token, isCreate, companyId }}
      />
    </FormPageLayout>
  );
}