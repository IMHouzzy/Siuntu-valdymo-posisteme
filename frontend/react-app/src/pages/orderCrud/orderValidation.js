// utils/orderValidation.js

export function validateOrder(values) {
    const errors = {};

    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // ── CLIENT ─────────────────────────────
    if (!values.clientUserId) {
        errors.clientUserId = "Pasirinkite klientą";
    }

    // ── DATE ───────────────────────────────
    if (!values.ordersDate) {
        errors.ordersDate = "Pasirinkite datą";
    }

    // ── STATUS ─────────────────────────────
    if (!values.status) {
        errors.status = "Pasirinkite būseną";
    }

    // ── ITEMS ──────────────────────────────
    const items = Array.isArray(values.items) ? values.items : [];

    if (items.length === 0) {
        errors.items = "Privalote pridėti bent vieną prekę";
        return errors;
    }

    items.forEach((it, i) => {
        if (!it.productId) {
            errors[`items[${i}].productId`] = "Pasirinkite prekę";
        }

        const qty = toNum(it.quantity);
        if (qty <= 0) {
            errors[`items[${i}].quantity`] = "Kiekis turi būti > 0";
        }

        const price = toNum(it.price);
        if (price <= 0) {
            errors[`items[${i}].price`] = "Kaina turi būti > 0";
        }
    });

    // ── TOTAL VALIDATION ───────────────────
    const VAT = 0.21;

    const total = items.reduce((sum, it) => {
        const net = toNum(it.quantity) * toNum(it.price);
        return sum + net + net * VAT;
    }, 0);

    if (total <= 0) {
        errors.totalAmount = "Suma negali būti 0";
    }

    // optional safety: mismatch detection
    if (
        values.totalAmount &&
        Math.abs(Number(values.totalAmount) - total) > 0.05
    ) {
        errors.totalAmount = "Suma nesutampa - perkalkuliuokite";
    }

    return errors;
}