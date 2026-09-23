export const validators = {
  email: (value: string): string | undefined => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required";
    return !pattern.test(value) ? "Invalid email address" : undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain a number";
    return undefined;
  },

  required: (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === "") return "This field is required";
    return undefined;
  },
};
