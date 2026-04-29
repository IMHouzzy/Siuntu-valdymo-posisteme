// ─── UserEdit.jsx ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { usersApi } from "../../services/api";
import { validateUser } from "./userValidation";

export function UserEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [live, setLive] = useState({ isClient: false, isEmployee: false });
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        usersApi.getOne(id)
            .then(data => {
                const startDate = data.startDate ? String(data.startDate).slice(0, 10) : null;
                setInitialValues({
                    name: data.name ?? "", surname: data.surname ?? "",
                    email: data.email ?? "", phoneNumber: data.phoneNumber ?? "",
                    isClient: !!data.isClient,
                    deliveryAddress: data.deliveryAddress ?? "", city: data.city ?? "",
                    country: data.country ?? "", vat: data.vat ?? "",
                    bankCode: data.bankCode ?? null,
                    isEmployee: !!data.isEmployee,
                    position: data.position ?? "", startDate,
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

        // ✅ FIXED: Use visible property to conditionally show/hide fields
        // This way required validation only applies when fields are visible
        const client = [
            { type: "section", title: "Kliento duomenys", visible: (v) => v.isClient },
            {
                name: "deliveryAddress",
                label: "Pristatymo adresas",
                required: true,
                colSpan: 2,
                visible: (v) => v.isClient
            },
            {
                name: "city",
                label: "Miestas",
                required: true,
                colSpan: 1,
                visible: (v) => v.isClient
            },
            {
                name: "country",
                label: "Šalis",
                required: true,
                colSpan: 1,
                visible: (v) => v.isClient
            },
            {
                name: "vat",
                label: "PVM kodas",
                colSpan: 1,
                visible: (v) => v.isClient
            },
            {
                name: "bankCode",
                label: "Banko kodas",
                type: "number",
                colSpan: 1,
                visible: (v) => v.isClient
            },
        ];

        const employee = [
            { type: "section", title: "Darbuotojo duomenys", visible: (v) => v.isEmployee },
            {
                name: "position",
                label: "Pareigos",
                type: "select",
                required: true,
                colSpan: 1,
                visible: (v) => v.isEmployee,
                options: [
                    { value: "ADMIN", label: "Administratorius" },
                    { value: "STAFF", label: "Darbuotojas" },
                    { value: "COURIER", label: "Kurjeris" },
                ]
            },
            {
                name: "startDate",
                label: "Įdarbinimo data",
                type: "date",
                required: true,
                colSpan: 1,
                visible: (v) => v.isEmployee
            },
            {
                name: "active",
                label: "Aktyvus",
                type: "checkbox",
                help: "Ar darbuotojas aktyvus?",
                colSpan: 1,
                visible: (v) => v.isEmployee
            },
        ];

        return [...base, ...client, ...employee];
    }, []);

    if (!initialValues) return null;

    return (
        <FormPageLayout title="Redaguoti naudotoją" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
            <SmartForm
                fields={fields}
                initialValues={initialValues}
                submitLabel="Išsaugoti"
                cancelLabel="Atšaukti"
                onCancel={() => navigate("/usersList")}
                onValuesChange={(v) =>
                    setLive({ isClient: !!v.isClient, isEmployee: !!v.isEmployee })
                }
                onSubmit={async (values) => {
                    const payload = {
                        ...values,
                        bankCode:
                            values.bankCode === "" || values.bankCode == null
                                ? null
                                : Number(values.bankCode),
                        startDate:
                            values.startDate === "" || values.startDate == null
                                ? null
                                : values.startDate,
                    };

                    await usersApi.update(id, payload);
                    navigate("/usersList");
                }}
                validate={validateUser}
            />
        </FormPageLayout>
    );
}

export default UserEditPage;