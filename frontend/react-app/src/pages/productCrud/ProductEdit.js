import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5065/api/products/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then(r => r.json()),
      fetch("http://localhost:5065/api/products/productgroups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then(r => r.json()),
      fetch(`http://localhost:5065/api/products/product/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then(r => r.json()),
    ])
      .then(([cats, grps, p]) => {
        setCategories(cats);
        setGroups(grps);
        setProduct(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const fields = useMemo(() => [
    { name: "name", label: "Pavadinimas", required: true, colSpan: 2 },
    {
      name: "categoryId", label: "Tipas (kategorija)", type: "select", required: true,
      options: categories.map(c => ({ value: c.id_Category, label: c.name })),
    },
    {
      name: "groupId", label: "Grupė", type: "select", required: true,
      options: groups.map(g => ({ value: g.id_ProductGroup, label: g.name })),
    },
    { name: "price", label: "Kaina", type: "number" },
    { name: "unit", label: "Vienetai" },
    { name: "description", label: "Aprašymas", type: "textarea", colSpan: 2 },
    { name: "vat", label: "VAT", type: "checkbox", help: "Taikyti VAT" },
    { name: "canTheProductBeProductReturned", label: "Grąžinimas", type: "checkbox", help: "Galima grąžinti" },
    { name: "countableItem", label: "Ar prekė skaičiuojama?", type: "checkbox", help: "Prekė skaičiuojama" },
    { name: "images", label: "Nuotraukos", type: "images", colSpan: 2 },
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
          fd.append("price", String(values.price ?? ""));
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
          await fetch(`http://localhost:5065/api/products/editProduct/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: fd,
          });

          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}