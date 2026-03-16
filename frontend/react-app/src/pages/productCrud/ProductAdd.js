import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
export default function ProductFormPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

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
    { name: "images", label: "Nuotraukos", type: "images", colSpan: 2 },
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
          fd.append("price", String(values.price ?? ""));
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

          await fetch("http://localhost:5065/api/products/createProduct", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: fd,
          });

          navigate("/productList");
        }}
      />
    </FormPageLayout>
  );
}