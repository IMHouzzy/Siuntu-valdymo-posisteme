import { useEffect, useMemo, useState, } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import RightDrawer from "../components/RightDrawerSidebar";
import "../styles/UserPage.css";
import TableToolbar from "../components/TableToolbar";
import { FiTrash2, FiEdit } from "react-icons/fi";
import NoImage from "../images/no-camera.png";
function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch("http://localhost:5065/api/products/allProductsFullInfo")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();

            })
            .then((data) => setProducts(data))
            .catch((err) => console.error(err));

    }, []);
    const deleteProduct = async (p) => {
        const ok = window.confirm(`Delete product "${p.name}"?`);
        if (!ok) return;

        const res = await fetch(`http://localhost:5065/api/products/deleteProduct/${p.id_Product}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            alert("Delete failed");
            return;
        }

        setProducts((prev) => prev.filter((x) => x.id_Product !== p.id_Product));
        setSelectedProduct(null);
    };
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return products;

        return products.filter((p) => {
            const name = (p.name || "").toLowerCase();
            const code = String(p.externalCode ?? "").toLowerCase();
            const id = String(p.id_Product ?? "").toLowerCase();
            const date = String(p.creationDate ?? "").toLowerCase();
            const group = (p.groups ?? [])
                .map(g => g.name?.toLowerCase() || "")
                .join(" ");
            const type = (p.categories ?? [])
                .map(c => c.name?.toLowerCase() || "")
                .join(" ");

            const price = String(p.price ?? "").toLowerCase();
            return name.includes(s) || code.includes(s) || id.includes(s) || date.includes(s) || group.includes(s) || type.includes(s) || price.includes(s);
        });
    }, [products, q]);
    const columns = useMemo(
        () => [

            {
                key: "image",
                header: "",
                width: 70,
                align: "left",
                sortable: false,
                accessor: (p) => {
                    const first = (p.images ?? [])
                        .slice()
                        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
                    return first?.url ?? null;
                },
                cell: (v, p) => (
                    <div className="dt-img-wrap">
                        {v ? (
                            <img
                                className="dt-img"
                                src={`http://localhost:5065${v}`}  // ✅ svarbu, jei url yra "/uploads/..."
                                alt={p.name ?? "product"}
                                loading="lazy"
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                        ) : (
                            <div className="dt-img-placeholder">
                                <img src={NoImage} alt="No image" />
                            </div>
                        )}
                    </div>
                ),
            },
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
            {
                key: "actions",
                header: "",
                width: 80,
                align: "right",
                cell: (_v, p) => (
                    <div className="dt-actions">
                        <button
                            className="dt-icon-btn"
                            title="Edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/productEdit/${p.id_Product}`);
                            }}
                        >
                            <FiEdit />
                        </button>

                        <button
                            className="dt-icon-btn danger"
                            title="Delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(p);
                            }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ),
            }

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
                title: "Nuotraukos",
                rows: [
                    {
                        label: "",
                        value: (
                            
                            <div className="rd-img-grid">
                                {(selectedProduct.images ?? [])
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) ||
                                            (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                                    )
                                    .map((img) => (
                                        <a
                                            key={img.id_ProductImage}
                                            className="rd-img-tile"
                                            href={`http://localhost:5065${img.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            title={img.isPrimary ? "Pagrindinė" : ""}
                                        >
                                            <img
                                                src={`http://localhost:5065${img.url}`}
                                                alt="product"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                            {img.isPrimary ? <div className="rd-img-badge">Pagrindinė</div> : null}
                                        </a>
                                    ))}

                                {(!selectedProduct.images || selectedProduct.images.length === 0) ? (
                                    <div className="rd-empty">Nėra nuotraukų</div>
                                ) : null}
                            </div>
                        ),
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
            <TableToolbar
                title="Produktai"
                searchValue={q}
                onSearchChange={setQ}
                addLabel="Kurti prekę"
                onAdd={() => navigate("/productAdd")}
            />
            <DataTable
                title={null}
                columns={columns}
                rows={filtered}
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
                actions={
                    selectedProduct ? (
                        <>
                            <button
                                className="rd-action-btn"
                                onClick={() => navigate(`/productEdit/${selectedProduct.id_Product}`)}
                            >
                                <FiEdit /> Redaguoti
                            </button>

                            <button
                                className="rd-action-btn danger"
                                onClick={() => deleteProduct(selectedProduct)}
                            >
                                <FiTrash2 /> Ištrinti
                            </button>
                        </>
                    ) : null
                }

            />
        </div>
    );
}

export default ProductList;
