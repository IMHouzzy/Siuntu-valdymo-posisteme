import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../components/SmartForm";
import FormPageLayout from "../components/FormPageLayout";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5065/api/products/categories").then(r => r.json()),
      fetch("http://localhost:5065/api/products/productgroups").then(r => r.json()),
      fetch(`http://localhost:5065/api/products/product/${id}`).then(r => r.json()),
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
  }), [product]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!product) return <div style={{ padding: 24 }}>Product not found</div>;

  return (
    <FormPageLayout title="Redaguoti prekę" subtitle={`ID: ${id}`}>
      <SmartForm
        key={`edit-${id}`}  /* ensures it mounts once when page loads */
        fields={fields}
        initialValues={initialValues}
        submitLabel="Išsaugoti"
        onCancel={() => navigate("/productList")}
        onSubmit={async (values) => {
          await fetch(`http://localhost:5065/api/products/editProduct/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}