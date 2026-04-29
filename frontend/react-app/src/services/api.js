// services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source for all API calls.
//   • credentials: "include" on every request  →  httpOnly auth cookie is sent
//   • No Authorization headers anywhere         →  cookie handles auth
//   • Multipart (FormData) requests skip the    →  Content-Type header so the
//     browser sets the correct boundary automatically
// ─────────────────────────────────────────────────────────────────────────────

const BASE = (process.env.REACT_APP_API_URL ?? "http://localhost:5065/api")
    .replace(/\/$/, "");

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function req(path, options = {}) {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        headers: isFormData
            ? {}                                      // browser sets Content-Type + boundary
            : { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    if (res.status === 204) return null;

    const text = await res.text();

    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

    try { return JSON.parse(text); }
    catch { return text; }
}

const get = (path) => req(path);
const post = (path, body) => req(path, { method: "POST", body: body instanceof FormData ? body : (body != null ? JSON.stringify(body) : undefined) });
const put = (path, body) => req(path, { method: "PUT", body: body instanceof FormData ? body : (body != null ? JSON.stringify(body) : undefined) });
const del = (path) => req(path, { method: "DELETE" });

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
    login: (email, password) => post("/auth/login", { email, password }),
    register: (dto) => post("/auth/register", dto),
    googleLogin: (idToken) => post("/auth/google", { idToken }),
    logout: () => post("/auth/logout"),
    me: () => get("/auth/me"),
    switchCompany: (companyId) => post(`/auth/switch-company/${companyId}`),
};

// ── Password reset ────────────────────────────────────────────────────────────

export const resetApi = {
    request: (email) => post("/auth/reset-password/request", { email }),
    validate: (token) => get(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`),
    confirm: (token, newPassword) => post("/auth/reset-password/confirm", { token, newPassword }),
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileApi = {
    get: () => get("/profile"),
    updateInfo: (dto) => put("/profile/info", dto),
    updateClient: (companyId, dto) => put(`/profile/client/${companyId}`, dto),
    changePassword: (currentPassword, newPassword) =>
        put("/profile/password", { currentPassword, newPassword }),
    deleteAccount: () => del("/profile"),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
    stats: (period) => get(`/dashboard/stats?period=${period}`),
};

// ── Users (staff CRUD) ────────────────────────────────────────────────────────

export const usersApi = {
    getAll: () => get("/users/allUsers"),
    getAllWithClients: () => get("/users/allUsersWithClients"),
    getOne: (id) => get(`/users/user/${id}`),
    create: (dto) => post("/users/createUser", dto),
    update: (id, dto) => put(`/users/editUser/${id}`, dto),
    remove: (id) => del(`/users/deleteUser/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
    getAll: () => get("/orders/allOrdersFullInfo"),
    getOne: (id) => get(`/orders/order/${id}`),
    getOneFull: (id) => get(`/orders/order/${id}/full`),
    getStatuses: () => get("/orders/order-statuses"),
    getProducts: (q = "") => get(`/orders/products?q=${encodeURIComponent(q)}`),
    create: (dto) => post("/orders/createOrder", dto),
    update: (id, dto) => put(`/orders/editOrder/${id}`, dto),
    remove: (id) => del(`/orders/deleteOrder/${id}`),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
    getAll: () => get("/products/allProductsFullInfo"),
    getOne: (id) => get(`/products/product/${id}`),
    getCategories: () => get("/products/categories"),
    getGroups: () => get("/products/productgroups"),
    // FormData — pass the already-built FormData object
    create: (fd) => post("/products/createProduct", fd),
    update: (id, fd) => put(`/products/editProduct/${id}`, fd),
    remove: (id) => del(`/products/deleteProduct/${id}`),
};

// ── Shipments (staff) ─────────────────────────────────────────────────────────

export const shipmentsApi = {
    getAll: () => get("/shipments/all"),
    getPackages: (id) => get(`/shipments/${id}/packages`),
    getOrderForShipment: (orderId) => get(`/shipments/order-for-shipment/${orderId}`),
    create: (dto) => post("/shipments/create", dto),
    remove: (id) => del(`/shipments/${id}`),
};

// ── Returns (staff) ───────────────────────────────────────────────────────────

export const returnsApi = {
    getAll: () => get("/returns/all"),
    getOne: (id) => get(`/returns/${id}`),
    openEvaluation: (id) => put(`/returns/${id}/evaluate/open`),
    evaluate: (id, dto) => put(`/returns/${id}/evaluate`, dto),
};

// ── Client-facing orders & returns ────────────────────────────────────────────

export const clientApi = {
    getOrders: () => get("/client/orders"),
    getOrderDetail: (orderId) => get(`/client/orders/${orderId}`),
    updateContact: (orderId, dto) => put(`/client/orders/${orderId}/delivery`, dto),
    getReturns: () => get("/client/returns"),
    getCouriers: () => get("/client/couriers"),
};

// ── Tracking (client & staff) ─────────────────────────────────────────────────

export const trackingApi = {
    track: (trackingNumber) => get(`/tracking/${encodeURIComponent(trackingNumber)}`),
};

// ── Courier-facing endpoints ──────────────────────────────────────────────────

export const courierApi = {
    getShipments: () => get("/courier/shipments"),
    getShipment: (id) => get(`/courier/shipments/${id}`),
    getStatusTypes: () => get("/courier/status-types"),
    updateStatus: (id, dto) => post(`/courier/shipments/${id}/status`, dto),
};

// ── Companies ─────────────────────────────────────────────────────────────────

export const companiesApi = {
    getAll: () => get("/companies"),
    getOne: (id) => get(`/companies/${id}`),
    create: (dto) => post("/companies", dto),
    update: (id, dto) => put(`/companies/${id}`, dto),
    remove: (id) => del(`/companies/${id}`),
    uploadLogo: (id, fd) => post(`/companies/${id}/logo`, fd),

    // Members
    getMembers: (id) => get(`/companies/${id}/members`),
    getAssignableUsers: (id) => get(`/companies/${id}/assignable-users`),
    addMember: (id, dto) => post(`/companies/${id}/members`, dto),
    updateMember: (id, userId, dto) => put(`/companies/${id}/members/${userId}`, dto),
    removeMember: (id, userId) => del(`/companies/${id}/members/${userId}`),

    // Couriers
    getCouriers: (id) => get(`/companies/${id}/couriers`),
    createCourier: (id, dto) => post(`/companies/${id}/couriers`, dto),
    updateCourier: (id, cId, dto) => put(`/companies/${id}/couriers/${cId}`, dto),
    removeCourier: (id, cId) => del(`/companies/${id}/couriers/${cId}`),

    // Integrations
    getIntegrations: (id) => get(`/companies/${id}/integrations`),
    upsertIntegration: (id, key, dto) => put(`/companies/${id}/integrations/${key}`, dto),
    deleteIntegration: (id, key) => del(`/companies/${id}/integrations/${key}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
    getUnreadCount: () => get("/notifications/unread-count"),
    getAll: (pageSize = 20) => get(`/notifications?pageSize=${pageSize}`),
    markRead: (id) => put(`/notifications/${id}/read`),
    markAllRead: () => put("/notifications/mark-all-read"),
    remove: (id) => del(`/notifications/${id}`),
};

// ── Shipment labels (blob responses — bypass JSON wrapper) ────────────────────
// Returns the raw Response so callers can call .blob() on it.

export const shipmentLabelsApi = {
    downloadZip: (shipmentId) =>
        fetch(`${BASE}/shipments/${shipmentId}/labels/zip`, { credentials: "include" }),
    downloadMerged: (shipmentId) =>
        fetch(`${BASE}/shipments/${shipmentId}/labels/merged`, { credentials: "include" }),
};

// ── Client returns ────────────────────────────────────────────────────────────

export const clientReturnsApi = {
    uploadImages: (formData) => post("/client/returns/upload-images", formData),
    create: (orderId, dto) => post(`/client/orders/${orderId}/returns`, dto),
};

// ── Locker provider ───────────────────────────────────────────────────────────

export const lockerApi = {
    getLockers: (companyId, courierType) =>
        get(`/companies/${companyId}/courier-provider/${encodeURIComponent(courierType)}/lockers`),
};

export const syncApi = {
    checkIntegration: (companyId) => get(`/sync/check-integration/${companyId}`),
    startSync: (companyId) => post(`/sync/start/${companyId}`),
    applyResolutions: (dto) => post("/sync/resolve", dto),
};
 