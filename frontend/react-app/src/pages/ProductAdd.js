import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../components/SmartForm";
import FormPageLayout from "../components/FormPageLayout";

export default function ProductFormPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5065/api/products/categories").then(r => r.json()),
      fetch("http://localhost:5065/api/products/productgroups").then(r => r.json()),
    ])
      .then(([cats, grps]) => {
        setCategories(cats);
        setGroups(grps);
      })
      .catch(console.error);
  }, []);

  const fields = useMemo(() => [
    { name: "name", label: "Pavadinimas", required: true, colSpan: 2 },

    {
      name: "categoryId",
      label: "Tipas (kategorija)",
      type: "select",
      required: true,
      options: categories.map(c => ({ value: c.id_Category, label: c.name })),
    },
    {
      name: "groupId",
      label: "Grupė",
      type: "select",
      required: true,
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
    name: "",
    price: "",
    unit: "vnt",
    description: "",
    vat: false,
    canTheProductBeProductReturned: false,
    countableItem: false,

    categoryId: "",
    groupId: "",
  }), []);

  return (
    <FormPageLayout title="Kurti prekę">
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel="Sukurti"
        onCancel={() => navigate("/productList")}
        onSubmit={async (values) => {
          await fetch("http://localhost:5065/api/products/createProduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}