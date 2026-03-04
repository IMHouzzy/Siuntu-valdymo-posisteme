import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [live, setLive] = useState({ isClient: false, isEmployee: false });
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5065/api/users/user/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(r => r.json())
      .then(data => {

        const startDate = data.startDate ? String(data.startDate).slice(0, 10) : null;

        setInitialValues({
          name: data.name ?? "",
          surname: data.surname ?? "",
          email: data.email ?? "",
          phoneNumber: data.phoneNumber ?? "",

          isClient: !!data.isClient,
          deliveryAddress: data.deliveryAddress ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
          vat: data.vat ?? "",
          bankCode: data.bankCode ?? null,

          isEmployee: !!data.isEmployee,
          position: data.position ?? "",
          startDate,
          active: !!data.active,
        });

        setLive({ isClient: !!data.isClient, isEmployee: !!data.isEmployee });
      })
      .catch(console.error);
  }, [id]);

  const fields = useMemo(() => {
    const base = [
      { type: "section", title: "Pagrindinė informacija" },
      { name: "name", label: "Vardas", required: true, colSpan: 1 },
      { name: "surname", label: "Pavardė", required: true, colSpan: 1 },
      { name: "email", label: "El. paštas", type: "email", required: true, colSpan: 2 },
      { name: "phoneNumber", label: "Telefono nr.", type: "tel", required: true, colSpan: 2 },

      { type: "section", title: "Rolės" },
      { name: "isClient", label: "Klientas", type: "checkbox", help: "Pridėti kliento duomenis", colSpan: 1 },
      { name: "isEmployee", label: "Darbuotojas", type: "checkbox", help: "Pridėti darbuotojo duomenis", colSpan: 1 },
    ];

    const client = live.isClient
      ? [
        { type: "section", title: "Kliento duomenys" },
        { name: "deliveryAddress", label: "Pristatymo adresas", colSpan: 2 },
        { name: "city", label: "Miestas", colSpan: 1 },
        { name: "country", label: "Šalis", colSpan: 1 },
        { name: "vat", label: "PVM kodas", colSpan: 1 },
        { name: "bankCode", label: "Banko kodas", type: "number", colSpan: 1 },
      ]
      : [];

    const employee = live.isEmployee
      ? [
        { type: "section", title: "Darbuotojo duomenys" },
        {
          name: "position",
          label: "Pareigos",
          type: "select",
          required: true,
          colSpan: 1,
          options: [
            { value: "ADMIN", label: "Administratorius" },
            { value: "STAFF", label: "Darbuotojas" },
          ],
        },
        { name: "startDate", label: "Įdarbinimo data", type: "date", colSpan: 1 },
        { name: "active", label: "Aktyvus", type: "checkbox", help: "Ar darbuotojas aktyvus?", colSpan: 1 },
      ]
      : [];

    return [...base, ...client, ...employee];
  }, [live.isClient, live.isEmployee]);

  if (!initialValues) return null;

  return (
    <FormPageLayout title="Redaguoti naudotoją">
      <SmartForm
        fields={fields}
        initialValues={initialValues}
        submitLabel="Išsaugoti"
        cancelLabel="Atšaukti"
        onCancel={() => navigate("/usersList")}
        onValuesChange={(v) => setLive({ isClient: !!v.isClient, isEmployee: !!v.isEmployee })}
        onSubmit={async (values) => {
          const payload = {
            ...values,
            bankCode: values.bankCode === "" || values.bankCode == null ? null : Number(values.bankCode),
            startDate: values.startDate === "" || values.startDate == null ? null : values.startDate,
          };

          await fetch(`http://localhost:5065/api/users/editUser/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          navigate("/usersList");
        }}
      />
    </FormPageLayout>
  );
}
