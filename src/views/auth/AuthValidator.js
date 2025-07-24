export class AuthValidator {
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validateEmail(email) {
    if (!email.trim()) {
      return { isValid: false, message: "L'email est requis" };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return { isValid: false, message: "Format d'email invalide" };
    }

    return { isValid: true };
  }

  static validatePassword(password) {
    if (!password.trim()) {
      return { isValid: false, message: "Le mot de passe est requis" };
    }

    if (password.length < 6) {
      return { isValid: false, message: "6 caractères minimum" };
    }

    return { isValid: true };
  }
}
