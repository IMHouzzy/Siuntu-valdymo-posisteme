import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartForm from "../../components/SmartForm";
import FormPageLayout from "../../components/FormPageLayout";
import { FiArrowLeft } from "react-icons/fi";
export default function UserCreatePage() {
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

    const initialValues = useMemo(
        () => ({
            name: "",
            surname: "",
            email: "",
            phoneNumber: "",

            isClient: false,
            isEmployee: false,

            // client
            deliveryAddress: "",
            city: "",
            country: "",
            vat: "",
            bankCode: null,

            // employee
            position: "",
            startDate: null,
            active: false,
        }),
        []
    );

    return (
        <FormPageLayout title="Kurti naudotoją" actions={<button className="od-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Grįžti</button>}>
            <SmartForm
                fields={fields}
                initialValues={initialValues}
                submitLabel="Sukurti"
                cancelLabel="Atšaukti"
                onCancel={() => navigate("/usersList")}
                onValuesChange={(v) => setLive({ isClient: !!v.isClient, isEmployee: !!v.isEmployee })}
                onSubmit={async (values) => {
                    await fetch("http://localhost:5065/api/users/createUser", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(values),
                    });
                    navigate("/usersList");
                }}
            />
        </FormPageLayout>
    );
}
