export const validators = {
  required: (value) => !!value?.trim(),
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[0-9]{9}$/.test(value),
  minLength: (value, length) => value?.length >= length,
  passwordComplexity: (value) =>
    /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
  fileType: (file, types) => file && types.includes(file?.type),

  minValue: (value, min) => parseFloat(value) >= min,
  maxValue: (value, max) => parseFloat(value) <= max,
  isInteger: (value) => Number.isInteger(parseFloat(value)),
  isPositive: (value) => parseFloat(value) >= 0,
  validUrl: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  validCategory: (value, categories) => {
    if (!categories) return true;
    return categories.includes(value);
  },
};
