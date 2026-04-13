import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { useAuth } from "../../services/AuthContext";
import { FiArrowLeft } from "react-icons/fi";
import { companiesApi } from "../../services/api";

const COUNTRY_OPTIONS = [
  { value: "LT", label: "Lietuva (LT)" },
  { value: "LV", label: "Latvija (LV)" },
  { value: "EE", label: "Estija (EE)" },
  { value: "PL", label: "Lenkija (PL)" },
  { value: "DE", label: "Vokietija (DE)" },
];

export default function CompanyEdit() {
  const { id } = useParams();
  const companyId = id ? Number(id) : null;
  const isCreate = !companyId;
  const navigate = useNavigate();

  // token removed — use user + cookie
  const { user, activeCompanyId, switchCompany, setCompanySwitchLocked } = useAuth();
  const isMaster = !!user?.isMasterAdmin;

  const [initialValues, setInitialValues] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  // Lock company switch while editing
  useEffect(() => {
    if (isCreate) return;
    setCompanySwitchLocked(true);
    if (companyId && activeCompanyId !== companyId)
      switchCompany(companyId).catch(console.error);
    return () => setCompanySwitchLocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isCreate]);

  // Load data — no token guard needed, cookie is sent automatically
  useEffect(() => {
    if (isCreate) {
      setInitialValues({
        name: "", companyCode: "", active: true, documentCode: "",
        email: "", phoneNumber: "", address: "",
        shippingStreet: "", shippingCity: "", shippingPostalCode: "", shippingCountry: "LT",
        returnStreet: "", returnCity: "", returnPostalCode: "", returnCountry: "LT",
        image: "",
      });
      return;
    }
    companiesApi.getOne(companyId)
      .then(c => setInitialValues({
        name: c?.name ?? "",
        companyCode: c?.code ?? "",
        active: !!c?.active,
        documentCode: c?.documentCode ?? "",
        email: c?.email ?? "",
        phoneNumber: c?.phoneNumber ?? "",
        address: c?.address ?? "",
        shippingStreet: c?.shippingStreet ?? "",
        shippingCity: c?.shippingCity ?? "",
        shippingPostalCode: c?.shippingPostalCode ?? "",
        shippingCountry: c?.shippingCountry ?? "LT",
        returnStreet: c?.returnStreet ?? "",
        returnCity: c?.returnCity ?? "",
        returnPostalCode: c?.returnPostalCode ?? "",
        returnCountry: c?.returnCountry ?? "LT",
        image: c?.image ?? "",
      }))
      .catch(e => { console.error(e); alert("Nepavyko užkrauti įmonės"); navigate("/companiesList"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isCreate]);

  const fields = useMemo(() => [
    { type: "section", title: "Logotipas" },
    { name: "image", label: null, type: "logo-uploader", colSpan: 2, companyId, onPendingFile: file => setPendingLogoFile(file) },

    { type: "section", title: "Bendra informacija" },
    { name: "name", label: "Pavadinimas", required: true, colSpan: 2 },
    { name: "companyCode", label: "Įmonės kodas", required: true, disabled: () => !isMaster && !isCreate },
    { name: "documentCode", label: "Dokumento kodas" },
    { name: "active", label: "Aktyvi", type: "checkbox", disabled: () => !isMaster, help: "Ar įmonė aktyvi sistemos?" },

    { type: "section", title: "Kontaktai" },
    { name: "email", label: "El. paštas", type: "email", colSpan: 2 },
    { name: "phoneNumber", label: "Telefonas" },
    { name: "address", label: "Juridinis adresas" },

    { type: "section", title: "Siuntimo adresas", subtitle: "Siuntėjo adresas spausdinamas ant etiketės" },
    { name: "shippingStreet", label: "Gatvė", placeholder: "pvz. Studentų g. 50" },
    { name: "shippingCity", label: "Miestas", placeholder: "pvz. Kaunas" },
    { name: "shippingPostalCode", label: "Pašto kodas", placeholder: "pvz. 51368" },
    { name: "shippingCountry", label: "Šalis", type: "select", options: COUNTRY_OPTIONS },

    { type: "section", title: "Grąžinimo adresas" },
    { name: "returnStreet", label: "Gatvė", placeholder: "pvz. Laisvės al. 1" },
    { name: "returnCity", label: "Miestas", placeholder: "pvz. Vilnius" },
    { name: "returnPostalCode", label: "Pašto kodas", placeholder: "pvz. 01100" },
    { name: "returnCountry", label: "Šalis", type: "select", options: COUNTRY_OPTIONS },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isMaster, isCreate, companyId]);

  if (!initialValues) return null;

  const handleSubmit = async values => {
    const body = {
      name: values.name?.trim(),
      companyCode: values.companyCode?.trim(),
      active: !!values.active,
      documentCode: values.documentCode?.trim() || "",
      email: values.email?.trim() || "",
      phoneNumber: values.phoneNumber?.trim() || "",
      address: values.address?.trim() || "",
      shippingStreet: values.shippingStreet?.trim() || null,
      shippingCity: values.shippingCity?.trim() || null,
      shippingPostalCode: values.shippingPostalCode?.trim() || null,
      shippingCountry: values.shippingCountry || "LT",
      returnStreet: values.returnStreet?.trim() || null,
      returnCity: values.returnCity?.trim() || null,
      returnPostalCode: values.returnPostalCode?.trim() || null,
      returnCountry: values.returnCountry || "LT",
      shippingAddress: null,
      returnAddress: null,
      image: values.image || "",
    };

    if (isCreate) {
      const result = await companiesApi.create(body);
      if (pendingLogoFile && result?.id_Company) {
        const form = new FormData();
        form.append("file", pendingLogoFile);
        await companiesApi.uploadLogo(result.id_Company, form).catch(console.error);
      }
    } else {
      await companiesApi.update(companyId, body);
    }
    navigate("/companiesList");
  };

  return (
    <FormPageLayout
      title={isCreate ? "Kurti įmonę" : "Redaguoti įmonę"}
      actions={<button className="od-back-btn" type="button" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}
    >
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel={isCreate ? "Sukurti įmonę" : "Išsaugoti"}
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/companiesList")}
        onSubmit={handleSubmit}
        logoUploaderContext={{ isCreate, companyId }}
      />
    </FormPageLayout>
  );
}