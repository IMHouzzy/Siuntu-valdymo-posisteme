// userValidation.js
export function validateUser(values) {
  const errors = {};

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+ ]{6,20}$/;

  const isEmpty = (v) =>
    v == null || v === "" || (typeof v === "string" && !v.trim());

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // ── BASIC INFO ─────────────────────────
  if (isEmpty(values.name)) {
    errors.name = "Vardas privalomas";
  } else if (values.name.trim().length < 2) {
    errors.name = "Vardas per trumpas";
  }

  if (isEmpty(values.surname)) {
    errors.surname = "Pavardė privaloma";
  } else if (values.surname.trim().length < 2) {
    errors.surname = "Pavardė per trumpa";
  }

  if (isEmpty(values.email)) {
    errors.email = "El. paštas privalomas";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Neteisingas el. pašto formatas";
  }

  if (isEmpty(values.phoneNumber)) {
    errors.phoneNumber = "Telefono numeris privalomas";
  } else if (!phoneRegex.test(values.phoneNumber)) {
    errors.phoneNumber = "Neteisingas telefono formatas";
  }

  // ── CLIENT VALIDATION (ONLY IF SELECTED) ─────────────
  if (values.isClient) {
    if (isEmpty(values.deliveryAddress)) {
      errors.deliveryAddress = "Pristatymo adresas privalomas";
    }

    if (isEmpty(values.city)) {
      errors.city = "Miestas privalomas";
    }

    if (isEmpty(values.country)) {
      errors.country = "Šalis privaloma";
    }

    if (!isEmpty(values.bankCode)) {
      const bank = toNum(values.bankCode);
      if (bank == null || bank <= 0) {
        errors.bankCode = "Neteisingas banko kodas";
      }
    }
  }

  // ── EMPLOYEE VALIDATION (ONLY IF SELECTED) ──────────
  if (values.isEmployee) {
    if (!values.position) {
      errors.position = "Pasirinkite pareigas";
    }

    if (!isEmpty(values.startDate)) {
      if (isNaN(Date.parse(values.startDate))) {
        errors.startDate = "Neteisinga data";
      }
    }
  }



  return errors;
}