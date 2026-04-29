// validations/authValidation.js

export const authValidation = {
  // Email validation
  validateEmail: (email) => {
    if (!email || !email.trim()) {
      return "El. paštas privalomas";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Neteisingas el. pašto formatas";
    }
    return null;
  },

  // Password validation
  validatePassword: (password, fieldName = "Slaptažodis") => {
    if (!password) {
      return `${fieldName} privalomas`;
    }
    if (password.length < 8) {
      return `${fieldName} turi būti bent 8 simbolių`;
    }
    if (!/[A-Z]/.test(password)) {
      return `${fieldName} turi turėti bent vieną didžiąją raidę`;
    }
    if (!/[a-z]/.test(password)) {
      return `${fieldName} turi turėti bent vieną mažąją raidę`;
    }
    if (!/[0-9]/.test(password)) {
      return `${fieldName} turi turėti bent vieną skaičių`;
    }
    return null;
  },

  // Password confirmation validation
  validatePasswordConfirmation: (password, confirmPassword) => {
    if (!confirmPassword) {
      return "Pakartokite slaptažodį";
    }
    if (password !== confirmPassword) {
      return "Slaptažodžiai nesutampa";
    }
    return null;
  },

  // Name validation
  validateName: (name, fieldName = "Vardas") => {
    if (!name || !name.trim()) {
      return `${fieldName} privalomas`;
    }
    if (name.trim().length < 2) {
      return `${fieldName} per trumpas (min. 2 simboliai)`;
    }
    if (name.trim().length > 50) {
      return `${fieldName} per ilgas (maks. 50 simbolių)`;
    }
    if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]+$/.test(name.trim())) {
      return `${fieldName} gali turėti tik raides, tarpus ir brūkšnelius`;
    }
    return null;
  },

  // Register form validation
  validateRegisterForm: ({ name, surname, email, password, confirmPassword }) => {
    const errors = {};

    const nameError = authValidation.validateName(name, "Vardas");
    if (nameError) errors.name = nameError;

    const surnameError = authValidation.validateName(surname, "Pavardė");
    if (surnameError) errors.surname = surnameError;

    const emailError = authValidation.validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = authValidation.validatePassword(password);
    if (passwordError) errors.password = passwordError;

    const confirmError = authValidation.validatePasswordConfirmation(password, confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;

    return errors;
  },

  // Login form validation
  validateLoginForm: ({ email, password }) => {
    const errors = {};

    const emailError = authValidation.validateEmail(email);
    if (emailError) errors.email = emailError;

    if (!password) {
      errors.password = "Slaptažodis privalomas";
    }

    return errors;
  },

  // Change password form validation
  validateChangePasswordForm: ({ currentPassword, newPassword, repeat }) => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Dabartinis slaptažodis privalomas";
    }

    const passwordError = authValidation.validatePassword(newPassword, "Naujas slaptažodis");
    if (passwordError) errors.newPassword = passwordError;

    const confirmError = authValidation.validatePasswordConfirmation(newPassword, repeat);
    if (confirmError) errors.repeat = confirmError;

    return errors;
  },

  // Reset password form validation
  validateResetPasswordForm: ({ newPassword, repeat }) => {
    const errors = {};

    const passwordError = authValidation.validatePassword(newPassword, "Naujas slaptažodis");
    if (passwordError) errors.newPassword = passwordError;

    const confirmError = authValidation.validatePasswordConfirmation(newPassword, repeat);
    if (confirmError) errors.repeat = confirmError;

    return errors;
  },

  // Forgot password form validation
  validateForgotPasswordForm: ({ email }) => {
    const errors = {};

    const emailError = authValidation.validateEmail(email);
    if (emailError) errors.email = emailError;

    return errors;
  },
};