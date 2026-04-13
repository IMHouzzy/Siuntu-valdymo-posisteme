import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import RightDrawer from "../../components/RightDrawers/RightDrawerSidebar";
import "../../styles/UserPage.css";
import TableToolbar from "../../components/TableToolbar";
import { FiTrash2, FiEdit } from "react-icons/fi";
import NoImage from "../../images/no-camera.png";
import { useAuth } from "../../services/AuthContext";
import { productsApi } from "../../services/api";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5065";
function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [q, setQ] = useState("");
    const [group, setGroup] = useState("all");
    const { activeCompanyId } = useAuth();

    useEffect(() => {
        if (!activeCompanyId) return;  // remove the `token` guard — cookie handles auth
        setProducts([]);
        setSelectedProduct(null);
        productsApi.getAll().then(setProducts).catch(console.error);
    }, [activeCompanyId]);

    // REPLACE deleteProduct:
    const deleteProduct = async (p) => {
        if (!window.confirm(`Ištrinti prekę "${p.name}"?`)) return;
        try {
            await productsApi.remove(p.id_Product);
            setProducts(prev => prev.filter(x => x.id_Product !== p.id_Product));
            setSelectedProduct(null);
        } catch { alert("Ištrinti nepavyko"); }
    };

    const groupFilters = useMemo(() => {
        const map = new Map();
        for (const p of products) {
            const gs = p.groups?.length ? p.groups : [{ name: "Be grupės" }];
            for (const g of gs) {
                const name = g?.name || "Be grupės";
                map.set(name, (map.get(name) || 0) + 1);
            }
        }
        const items = [{ label: "Visi", value: "all", count: products.length }];
        Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0], "lt"))
            .forEach(([name, count]) => items.push({ label: name, value: name, count }));
        return items;
    }, [products]);

    const filtered = useMemo(() => {
        const byGroup = products.filter((p) => {
            if (group === "all") return true;
            const gs = p.groups?.length ? p.groups : [{ name: "Be grupės" }];
            return gs.some((g) => (g?.name || "Be grupės") === group);
        });
        const s = q.trim().toLowerCase();
        if (!s) return byGroup;
        return byGroup.filter((p) =>
            [p.name, p.externalCode, p.id_Product, p.creationDate,
            p.groups?.map(g => g.name).join(" "),
            p.categories?.map(c => c.name).join(" "),
            p.price]
                .some(v => String(v ?? "").toLowerCase().includes(s))
        );
    }, [products, q, group]);

    const columns = useMemo(() => [
        {
            key: "image",
            header: "",
            width: 70,
            sortable: false,
            accessor: (p) => {
                const sorted = (p.images ?? []).slice()
                    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                return sorted[0]?.url ?? null;
            },
            cell: (v, p) => (
                <div className="dt-img-wrap">
                    {v ? (
                        <img className="dt-img" src={`${API}${v}`} alt={p.name ?? "product"} loading="lazy"
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                        <div className="dt-img-placeholder"><img src={NoImage} alt="No image" /></div>
                    )}
                </div>
            ),
        },
        {
            key: "productName",
            header: "Pavadinimas / ID",
            sortable: true,
            accessor: (p) => p.name ?? "",
            cell: (_v, p) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{p.name || "—"}</div>
                    <div className="dt-cell-secondary">#{p.id_Product}</div>
                </div>
            ),
        },
        {
            key: "price",
            header: "Kaina",
            sortable: true,
            accessor: (p) => p.price,
            cell: (_v, p) => (
                <div className="dt-cell-stack">
                    <div className="dt-cell-primary">{p.price != null ? `${p.price} €` : "—"}</div>
                    <div className="dt-cell-secondary">{p.unit || "—"}</div>
                </div>
            ),
        },
        {
            key: "groups",
            header: "Grupės",
            accessor: (p) => p.groups?.map(g => g.name).join(", "),
            cell: (_v, p) => (
                <div className="dt-cell-secondary">
                    {p.groups?.length ? p.groups.map(g => g.name).join(", ") : "—"}
                </div>
            ),
        },
        {
            key: "creationDate",
            header: "Sukūrimo data",
            sortable: true,
            accessor: (p) => p.creationDate ? new Date(p.creationDate) : null,
            cell: (v) => v instanceof Date && !isNaN(v) ? v.toLocaleDateString("lt-LT") : "—",
        },
        {
            key: "actions",
            header: "",
            width: 80,
            align: "right",
            cell: (_v, p) => (
                <div className="dt-actions">
                    <button className="dt-icon-btn" title="Redaguoti" onClick={(e) => { e.stopPropagation(); navigate(`/productEdit/${p.id_Product}`); }}>
                        <FiEdit />
                    </button>
                    <button className="dt-icon-btn danger" title="Ištrinti"
                        onClick={(e) => { e.stopPropagation(); deleteProduct(p); }}>
                        <FiTrash2 />
                    </button>
                </div>
            ),
        },
    ], [products]);

    // ── Hero: image strip ──────────────────────────────────────────────
    const productHero = (product, onEdit, onDelete) => {
        if (!product) return null;

        return (
            <div className="rd-product-hero-simple">
                <div className="rd-product-hero-content">
                    {/* Main Image */}
                    <div className={`rd-product-hero-img ${!product.images?.[0]?.url ? "rd-product-img-placeholder" : ""}`}>
                        {product.images?.[0]?.url ? (
                            <img src={`${API}/${product.images[0].url}`} alt={product.name || "product"} />
                        ) : (
                            <img src={NoImage} alt="No image" />
                        )}
                    </div>

                    {/* Name & Price */}
                    <div className="rd-product-hero-info">
                        <div className="rd-product-hero-name">{product.name || "Prekė"}</div>
                        {product.price != null && (
                            <div className="rd-product-hero-price">
                                <span>{Number(product.price).toFixed(2)} €</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Action Buttons */}
                <div className="rd-product-hero-actions">
                    <button className="rd-action-btn" title="Redaguoti" onClick={() => navigate(`/productEdit/${product.id_Product}`)}>
                        <FiEdit size={18} />
                    </button>
                    <button className="rd-action-btn danger" title="Ištrinti" onClick={() => onDelete(product)}>
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const drawerSections = useMemo(() => {
        if (!selectedProduct) return [];
        const p = selectedProduct;
        return [
            {
                title: "Prekės informacija",
                rows: [
                    { label: "Aprašymas", value: p.description || "—", fullWidth: true },
                    { label: "Vienetai", value: p.unit || "—" },
                    { label: "Siuntimo būdas", value: p.shipping_mode || "—" },
                    { label: "Ar grąžinama?", value: p.canTheProductBeProductReturned ? "Taip" : "Ne" },
                    { label: "Ar skaičiuojama?", value: p.countableItem ? "Taip" : "Ne" },
                    { label: "PVM", value: p.vat ? "Taip" : "Ne" },
                    {
                        label: "Sukurta", value: p.creationDate
                            ? new Date(p.creationDate).toLocaleDateString("lt-LT") : "—"
                    },
                ],
            },
            {
                title: "Grupės ir tipai",
                rows: [
                    { label: "Grupės", value: p.groups?.length ? p.groups.map(g => g.name).join(", ") : "—" },
                    { label: "Tipai", value: p.categories?.length ? p.categories.map(c => c.name).join(", ") : "—" },
                ],
            },
        ];
    }, [selectedProduct]);

    return (
        <div className="user-cointainer">
            <TableToolbar
                title="Prekės"
                searchValue={q}
                onSearchChange={setQ}
                addLabel="Kurti prekę"
                onAdd={() => navigate("/productAdd")}
                filters={groupFilters}
                filterValue={group}
                onFilterChange={setGroup}
                connectBottom
            />
            <DataTable
                columns={columns}
                rows={filtered}
                pageSize={25}
                getRowId={(p) => p.id_Product}
                onRowClick={(p) => setSelectedProduct(p)}
                emptyText="Nėra duomenų"
                initialSort={{ key: "productName", dir: "asc" }}
            />
            <RightDrawer
                variant="product"
                open={!!selectedProduct}
                hero={productHero(selectedProduct)}

                sections={drawerSections}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}

export default ProductList;