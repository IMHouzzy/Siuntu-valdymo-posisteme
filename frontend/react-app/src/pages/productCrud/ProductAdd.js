import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { productsApi } from "../../services/api";

export default function ProductFormPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    Promise.all([
      productsApi.getCategories(),
      productsApi.getGroups(),
    ])
      .then(([cats, grps]) => { setCategories(cats); setGroups(grps); })
      .catch(console.error);
  }, []);
  const fields = useMemo(() => [
    {
      name: "name",
      label: "Pavadinimas",
      required: true,
      colSpan: 2,
      validate: (v) =>
        !String(v ?? "").trim()
          ? "Pavadinimas privalomas"
          : String(v).trim().length < 2
            ? "Mažiausiai 2 simboliai"
            : null,
    },

    {
      name: "categoryId",
      label: "Tipas (kategorija)",
      type: "select",
      required: true,
      options: categories.map(c => ({ value: c.id_Category, label: c.name })),
      validate: (v) => !v ? "Pasirinkite kategoriją" : null,
    },

    {
      name: "groupId",
      label: "Grupė",
      type: "select",
      required: true,
      options: groups.map(g => ({ value: g.id_ProductGroup, label: g.name })),
      validate: (v) => !v ? "Pasirinkite grupę" : null,
    },

    {
      name: "price",
      label: "Kaina",
      type: "number",
      required: true,
      validate: (v) => {
        const n = Number(v);
        if (v === "" || v === null || v === undefined) return "Kaina privaloma";
        if (!Number.isFinite(n)) return "Neteisinga kaina";
        if (n <= 0) return "Kaina turi būti didesnė už 0";
        return null;
      },
    },

    {
      name: "unit",
      label: "Vienetai",
      required: true,
      validate: (v) =>
        !String(v ?? "").trim() ? "Vienetai privalomi" : null,
    },

    {
      name: "description",
      label: "Aprašymas",
      type: "textarea",
      colSpan: 2,
      validate: (v) =>
        String(v ?? "").length > 1000
          ? "Aprašymas per ilgas (max 1000 simbolių)"
          : null,
    },

    {
      name: "vat",
      label: "VAT",
      type: "checkbox",
      help: "Taikyti VAT",
    },

    {
      name: "canTheProductBeProductReturned",
      label: "Grąžinimas",
      type: "checkbox",
      help: "Galima grąžinti",
    },

    {
      name: "countableItem",
      label: "Ar prekė skaičiuojama?",
      type: "checkbox",
      help: "Prekė skaičiuojama",
    },

    {
      name: "images",
      label: "Nuotraukos",
      type: "images",
      colSpan: 2,
      validate: (v) =>
        !v || v.length === 0 ? "Įkelkite bent vieną nuotrauką" : null,
    },
  ], [categories, groups]);

  const initialValues = useMemo(() => ({
    name: "",
    price: "",
    unit: "vnt",
    description: "",
    vat: false,
    canTheProductBeProductReturned: false,
    countableItem: false,

    categoryId: "",
    groupId: "",

    images: [],
  }), []);

  return (
    <FormPageLayout title="Kurti prekę" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel="Sukurti"
        onCancel={() => navigate("/productList")}
        onSubmit={async (values) => {
          const fd = new FormData();
          fd.append("name", values.name ?? "");
          fd.append("categoryId", String(values.categoryId ?? ""));
          fd.append("groupId", String(values.groupId ?? ""));
          fd.append("price", String(values.price ?? "").toString().replace(".", ","));
          fd.append("unit", values.unit ?? "vnt");
          fd.append("description", values.description ?? "");
          fd.append("vat", String(!!values.vat));
          fd.append("canTheProductBeProductReturned", String(!!values.canTheProductBeProductReturned));
          fd.append("countableItem", String(!!values.countableItem));

          const order = [];
          const newFiles = [];

          (values.images ?? []).forEach((img) => {
            if (img.type === "new") {
              order.push({ type: "new", tempKey: img.tempKey });
              newFiles.push(img);
            }
          });

          fd.append("imageOrderJson", JSON.stringify(order));
          newFiles.forEach((img) => fd.append("images", img.file));

          await productsApi.create(fd);
          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}