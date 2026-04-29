import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { productsApi } from "../../services/api";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getCategories(),
      productsApi.getGroups(),
      productsApi.getOne(id),
    ])
      .then(([cats, grps, p]) => { setCategories(cats); setGroups(grps); setProduct(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    groupId: product?.groupId ?? "",
    price: product?.price ?? "",
    unit: product?.unit ?? "vnt",
    description: product?.description ?? "",
    vat: product?.vat ?? false,
    canTheProductBeProductReturned: product?.canTheProductBeProductReturned ?? false,
    countableItem: product?.countableItem ?? false,
    images: (product?.images ?? [])
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(i => ({ type: "existing", id: i.id_ProductImage, url: i.url })),
  }), [product]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!product) return <div style={{ padding: 24 }}>Product not found</div>;

  return (
    <FormPageLayout title="Redaguoti prekę" subtitle={`ID: ${id}`} actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
      <SmartForm
        key={`edit-${id}`}
        fields={fields}
        initialValues={initialValues}
        submitLabel="Išsaugoti"
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
          const imgs = values.images ?? [];
          const keepIdsInOrder = imgs.filter(x => x.type === "existing").map(x => x.id);
          const newInOrder = imgs.filter(x => x.type === "new");

          fd.append("keepImageIdsJson", JSON.stringify(keepIdsInOrder));
          fd.append("imageOrderJson", JSON.stringify(
            imgs.map(x => x.type === "existing"
              ? { type: "existing", id: x.id }
              : { type: "new", tempKey: x.tempKey }
            )
          ));
          newInOrder.forEach(x => fd.append("images", x.file));
          await productsApi.update(id, fd);
          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}