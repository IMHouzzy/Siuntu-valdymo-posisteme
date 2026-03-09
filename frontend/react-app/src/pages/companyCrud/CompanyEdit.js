import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { useAuth } from "../../services/AuthContext";

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

  // ✅ kai backend grąžina Ok() be body – išvengiam JSON error
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  const txt = await res.text();
  if (!txt) return null;
  return JSON.parse(txt);
}

export default function CompanyEdit() {
  const { id } = useParams();
  const companyId = id ? Number(id) : 0;

  const isCreate = !id;
  const navigate = useNavigate();

  const {
    token,
    user,
    activeCompanyId,
    switchCompany,
    setCompanySwitchLocked,
  } = useAuth();

  const isMaster = !!user?.isMasterAdmin;
  const [initialValues, setInitialValues] = useState(null);

  // ✅ lock + auto switch pagal redaguojamą įmonę
  useEffect(() => {
    if (!token) return;

    // kurimo atveju: tu dar neturi companyId -> nelockinam (nebent nori)
    if (isCreate) return;

    let cancelled = false;

    (async () => {
      try {
        setCompanySwitchLocked(true);

        if (companyId && activeCompanyId !== companyId) {
          await switchCompany(companyId);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      setCompanySwitchLocked(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, isCreate]);

  useEffect(() => {
    if (!token) return;

    if (isCreate) {
      setInitialValues({
        name: "",
        companyCode: "",
        active: true,
        email: "",
        phoneNumber: "",
        address: "",
        shippingAddress: "",
        returnAddress: "",
        documentCode: "",
        image: "",
      });
      return;
    }

    apiFetch(`${API}/api/companies/${companyId}`, token)
      .then((c) => {
        setInitialValues({
          name: c?.name ?? "",
          companyCode: c?.code ?? "",
          active: !!c?.active,
          email: c?.email ?? "",
          phoneNumber: c?.phoneNumber ?? "",
          address: c?.address ?? "",
          shippingAddress: c?.shippingAddress ?? "",
          returnAddress: c?.returnAddress ?? "",
          documentCode: c?.documentCode ?? "",
          image: c?.image ?? "",
        });
      })
      .catch((e) => {
        console.error(e);
        alert("Nepavyko užkrauti įmonės");
        navigate("/companiesList");
      });
  }, [token, companyId, isCreate, navigate]);

  const fields = useMemo(() => {
    return [
      { type: "section", title: isCreate ? "Nauja įmonė" : "Įmonės redagavimas" },

      { name: "name", label: "Pavadinimas", required: true, colSpan: 2 },

      {
        name: "companyCode",
        label: "Įmonės kodas",
        required: true,
        colSpan: 1,
        disabled: () => !isMaster && !isCreate,
      },

      {
        name: "active",
        label: "Aktyvi",
        type: "checkbox",
        colSpan: 1,
        disabled: () => !isMaster,
        help: "Ar įmonė aktyvi?",
      },

      { type: "section", title: "Kontaktai" },
      { name: "email", label: "El. paštas", type: "email", colSpan: 2 },
      { name: "phoneNumber", label: "Telefonas", colSpan: 1 },
      { name: "address", label: "Adresas", colSpan: 1 },

      { type: "section", title: "Logistika" },
      { name: "shippingAddress", label: "Siuntimo adresas", colSpan: 2 },
      { name: "returnAddress", label: "Grąžinimo adresas", colSpan: 2 },

      { type: "section", title: "Dokumentai" },
      { name: "documentCode", label: "Dokumento kodas", colSpan: 1 },
      { name: "image", label: "Logotipo URL/kelias", colSpan: 1 },
    ];
  }, [isCreate, isMaster]);

  if (!initialValues) return null;

  return (
    <FormPageLayout title={isCreate ? "Kurti įmonę" : "Redaguoti įmonę"}>
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel={isCreate ? "Sukurti" : "Išsaugoti"}
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/companiesList")}
        onSubmit={async (values) => {
          try {
            const body = {
              name: values.name,
              companyCode: values.companyCode,
              active: !!values.active,
              shippingAddress: values.shippingAddress || null,
              returnAddress: values.returnAddress || null,
              documentCode: values.documentCode || "",
              phoneNumber: values.phoneNumber || "",
              address: values.address || "",
              email: values.email || "",
              image: values.image || "",
            };

            if (isCreate) {
              await apiFetch(`${API}/api/companies`, token, {
                method: "POST",
                body: JSON.stringify(body),
              });
            } else {
              await apiFetch(`${API}/api/companies/${companyId}`, token, {
                method: "PUT",
                body: JSON.stringify(body),
              });
            }

            navigate("/companiesList");
          } catch (e) {
            console.error(e);
            alert("Nepavyko išsaugoti");
          }
        }}
      />
    </FormPageLayout>
  );
}