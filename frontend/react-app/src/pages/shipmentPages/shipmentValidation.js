// validations/shipmentValidation.js

export function validateShipment(values) {
  const errors = {};

  const isEmpty = (v) =>
    v == null || v === "" || (typeof v === "string" && !v.trim());

  // ── COURIER SELECTION ─────────────────────────
  if (!values.courierId) {
    errors.courierId = "Privaloma pasirinkti kurjerį";
  }

  // ── DELIVERY LOCATION ─────────────────────────
  // Check if courier supports lockers (this will be passed from the form)
  const needsLocker = values._needsLocker; // We'll set this in the form

  if (needsLocker) {
    // Locker delivery - require deliveryCoords
    if (!values.deliveryCoords || !values.deliveryCoords.lockerId) {
      errors.deliveryCoords = "Privaloma pasirinkti paštomatą";
    }
  } else {
    // Home delivery - require address fields
    if (isEmpty(values.street)) {
      errors.street = "Privaloma gatvė";
    }

    if (isEmpty(values.city)) {
      errors.city = "Privalomas miestas";
    }

    if (isEmpty(values.country)) {
      errors.country = "Privaloma šalis";
    }

    if (isEmpty(values.postalCode)) {
      errors.postalCode = "Privalomas pašto kodas";
    } else if (!/^[A-Z0-9 -]{3,10}$/i.test(values.postalCode.trim())) {
      errors.postalCode = "Neteisingas pašto kodo formatas";
    }
  }

  // ── DATES ─────────────────────────────────────
  if (isEmpty(values.shippingDate)) {
    errors.shippingDate = "Privaloma siuntimo data";
  } else if (isNaN(Date.parse(values.shippingDate))) {
    errors.shippingDate = "Neteisinga data";
  }

  // ── PACKAGES ──────────────────────────────────
  const packages = Array.isArray(values.packages) ? values.packages : [];
  
  if (packages.length === 0) {
    errors.packages = "Privaloma pridėti bent vieną pakuotę";
  } else {
    // Validate each package weight
    packages.forEach((pkg, idx) => {
      if (isEmpty(pkg.weight)) {
        errors[`packages[${idx}].weight`] = "Privalomas svoris";
      } else {
        const weight = Number(pkg.weight);
        if (isNaN(weight) || weight <= 0) {
          errors[`packages[${idx}].weight`] = "Svoris turi būti teigiamas skaičius";
        } else if (weight > 1000) {
          errors[`packages[${idx}].weight`] = "Svoris per didelis (maks. 1000 kg)";
        }
      }
    });
  }

  return errors;
}