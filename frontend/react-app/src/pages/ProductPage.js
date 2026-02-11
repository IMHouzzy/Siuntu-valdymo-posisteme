import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
function ProductList() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5065/api/products/allProductsFullInfo")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setProducts(data))
            .catch((err) => console.error(err));
    }, []);

    const columns = useMemo(
        () => [

            {
                key: "productName",
                header: "Producto pavadinimas / ID",
                sortable: true,
                accessor: (p) => `${p.name ?? ""} ${p.id_Product ?? ""}`.trim(),
                cell: (_value, p) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">{p.name || "-"}</div>
                        <div className="dt-cell-secondary">{p.id_Product || "-"}</div>
                    </div>
                ),
            },
            {
                key: "price",
                header: "Kaina, Eur",
                sortable: true,
                accessor: (p) => p.price,
                cell: (_value, p) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">{p.price || "-"}</div>
                    </div>
                ),
            },
            {
                key: "unit",
                header: "Vienetai",
                sortable: true,
                accessor: (p) => p.unit,
                cell: (_value, p) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-secondary">{p.unit || "-"}</div>
                    </div>
                ),
            },

            {
                key: "creationDate",
                header: "Sukūrimo data",
                sortable: true,
                accessor: (p) => (p.creationDate ? new Date(p.creationDate) : null),
                cell: (v) => (
                    <div className="dt-cell-stack">
                        <div className="dt-cell-primary">
                            {v instanceof Date && !isNaN(v) ? v.toLocaleDateString("lt-LT") : "-"}
                        </div>
                    </div>
                ),
            },

            {
                key: "groups",
                header: "Grupės",
                accessor: (p) => p.groups?.map(g => g.name).join(", "),
                cell: (_v, p) => (
                    <div className="dt-cell-secondary">
                        {p.groups?.length
                            ? p.groups.map(g => g.name).join(", ")
                            : "-"}
                    </div>
                ),
            },

            {
                key: "categories",
                header: "Tipai",
                accessor: (p) => p.categories?.map(c => c.name).join(", "),
                cell: (_v, p) => (
                    <div className="dt-cell-secondary">
                        {p.categories?.length
                            ? p.categories.map(c => c.name).join(", ")
                            : "-"}
                    </div>
                ),
            },

        ],
        []
    );

    const drawerSections = selectedProduct
        ? [
            {
                title: "Prekės informacija",
                rows: [
                    { label: "Pavadinimas", value: selectedProduct.name || "-" },
                    { label: "Aprašymas", value: selectedProduct.description || "-" },
                    { label: "Kaina", value: selectedProduct.price || "-" },
                    { label: "Ar gali būti grąžinama?", value: selectedProduct.canTheProductBeProductReturned ? "Taip" : "Ne" },
                    { label: "Ar skaičiuojama prekė?", value: selectedProduct.countableItem ? "Taip" : "Ne" },
                    { label: "Vientetai", value: selectedProduct.unit || "-" },
                    { label: "Siuntimo būdas", value: selectedProduct.shipping_mode || "-" },
                    { label: "VAT", value: selectedProduct.vat ? "Taip" : "Ne" },
                    {
                        label: "Sukurta",
                        value: selectedProduct.creationDate
                            ? new Date(selectedProduct.creationDate).toLocaleDateString("lt-LT")
                            : "-",
                    },

                ],
            },
            {
                title: "Grupės ir tipai",
                rows: [
                    {
                        label: "Grupės",
                        value: selectedProduct.groups?.length
                            ? selectedProduct.groups.map(g => g.name).join(", ")
                            : "-",
                    },
                    {
                        label: "Tipai",
                        value: selectedProduct.categories?.length
                            ? selectedProduct.categories.map(c => c.name).join(", ")
                            : "-",
                    },
                ],
            },
        ]
        : [];

    return (
        <div className="user-cointainer">

            <DataTable
                title={null}
                columns={columns}
                rows={products}
                pageSize={25}
                getRowId={(p) => p.id_Product}
                onRowClick={(p) => setSelectedProduct(p)}
                emptyText="Nėra duomenų"
                initialSort={{ key: "productName", dir: "asc" }}
            />



            <RightDrawer
                open={!!selectedProduct}
                title={selectedProduct ? `${selectedProduct.name} ` : ""}
                subtitle={selectedProduct ? `Id: ${selectedProduct.id_Product} ` : ""}
                sections={drawerSections}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}

export default ProductList;
