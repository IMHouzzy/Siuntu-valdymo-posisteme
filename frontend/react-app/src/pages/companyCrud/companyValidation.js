// validations/companyValidation.js

export function validateCompany(values) {
  const errors = {};

  const isEmpty = (v) =>
    v == null || v === "" || (typeof v === "string" && !v.trim());

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+ ]{6,20}$/;

  // ── BASIC INFO ─────────────────────────
  if (isEmpty(values.name)) {
    errors.name = "Įmonės pavadinimas privalomas";
  } else if (values.name.trim().length < 2) {
    errors.name = "Pavadinimas per trumpas";
  }

  if (isEmpty(values.companyCode)) {
    errors.companyCode = "Įmonės kodas privalomas";
  } else if (!/^[0-9]{7,15}$/.test(values.companyCode.trim())) {
    errors.companyCode = "Neteisingas įmonės kodo formatas (7-15 skaitmenų)";
  }

  // ── CONTACT INFO ───────────────────────
  if (!isEmpty(values.email)) {
    if (!emailRegex.test(values.email)) {
      errors.email = "Neteisingas el. pašto formatas";
    }
  }

  if (!isEmpty(values.phoneNumber)) {
    if (!phoneRegex.test(values.phoneNumber)) {
      errors.phoneNumber = "Neteisingas telefono formatas";
    }
  }

  // ── SHIPPING ADDRESS ───────────────────
  // Optional, but if one field is filled, others should be too
  const hasAnyShipping = 
    !isEmpty(values.shippingStreet) ||
    !isEmpty(values.shippingCity) ||
    !isEmpty(values.shippingPostalCode);

  if (hasAnyShipping) {
    if (isEmpty(values.shippingStreet)) {
      errors.shippingStreet = "Užpildykite visus siuntimo adreso laukus";
    }
    if (isEmpty(values.shippingCity)) {
      errors.shippingCity = "Užpildykite visus siuntimo adreso laukus";
    }
    if (isEmpty(values.shippingPostalCode)) {
      errors.shippingPostalCode = "Užpildykite visus siuntimo adreso laukus";
    } else if (!/^[A-Z0-9 -]{3,10}$/i.test(values.shippingPostalCode.trim())) {
      errors.shippingPostalCode = "Neteisingas pašto kodo formatas";
    }
  }

  // ── RETURN ADDRESS ─────────────────────
  // Optional, but if one field is filled, others should be too
  const hasAnyReturn = 
    !isEmpty(values.returnStreet) ||
    !isEmpty(values.returnCity) ||
    !isEmpty(values.returnPostalCode);

  if (hasAnyReturn) {
    if (isEmpty(values.returnStreet)) {
      errors.returnStreet = "Užpildykite visus grąžinimo adreso laukus";
    }
    if (isEmpty(values.returnCity)) {
      errors.returnCity = "Užpildykite visus grąžinimo adreso laukus";
    }
    if (isEmpty(values.returnPostalCode)) {
      errors.returnPostalCode = "Užpildykite visus grąžinimo adreso laukus";
    } else if (!/^[A-Z0-9 -]{3,10}$/i.test(values.returnPostalCode.trim())) {
      errors.returnPostalCode = "Neteisingas pašto kodo formatas";
    }
  }

  return errors;
}