// ─── UserCreate.jsx ───────────────────────────────────────────────────────────
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
import { usersApi } from "../../services/api";
import { validateUser } from "./userValidation";

export function UserCreatePage() {
    const navigate = useNavigate();
    const [live, setLive] = useState({ isClient: false, isEmployee: false });

    const fields = useMemo(() => {
        const base = [
            { type: "section", title: "Pagrindinė informacija" },
            { name: "name", label: "Vardas", required: true, colSpan: 1 },
            { name: "surname", label: "Pavardė", required: true, colSpan: 1 },
            { name: "email", label: "El. paštas", type: "email", required: true, colSpan: 2 },
            { name: "phoneNumber", label: "Telefono nr.", type: "tel", required: true, colSpan: 2 },
            { type: "section", title: "Rolės" },
            {
                name: "isClient",
                label: "Klientas",
                type: "checkbox",
                help: "Pridėti kliento duomenis",
                colSpan: 1
            },
            { name: "isEmployee", label: "Darbuotojas", type: "checkbox", help: "Pridėti darbuotojo duomenis", colSpan: 1 },
        ];

        // ✅ FIXED: Use visible property to conditionally show/hide fields
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

    const initialValues = useMemo(() => ({
        name: "", surname: "", email: "", phoneNumber: "",
        isClient: false, isEmployee: false,
        deliveryAddress: "", city: "", country: "", vat: "", bankCode: null,
        position: "", startDate: null, active: false,
    }), []);

    return (
        <FormPageLayout title="Kurti naudotoją" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
            <SmartForm
                fields={fields}
                initialValues={initialValues}
                submitLabel="Sukurti"
                cancelLabel="Atšaukti"
                onCancel={() => navigate("/usersList")}
                onValuesChange={(v) =>
                    setLive({ isClient: !!v.isClient, isEmployee: !!v.isEmployee })
                }
                onSubmit={async (values) => {
                    await usersApi.create(values);
                    navigate("/usersList");
                }}
                validate={validateUser}
            />
        </FormPageLayout>
    );
}

export default UserCreatePage;