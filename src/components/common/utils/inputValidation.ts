type ValidationContext = {
    value: string;
    validity: ValidityState;
    properties: {
        minLength: number;
        maxLength: number;
        required: boolean;
    };
};

type ValidationResult = {
    state: "weak" | "medium" | "strong" | "";
    code: string;
};

export const validateName = ({ value, validity, properties }: ValidationContext): ValidationResult => {
    const name = value.trim();

    if (!name) return properties.required ? { state: "weak", code: "REQUIRED" } : { state: "", code: "" };

    if (name.length < properties.minLength) return { state: "medium", code: "TOO_SHORT" };

    if (name.length > properties.maxLength) return { state: "medium", code: "TOO_LONG" };

    if (!/^[\p{L}\p{White_Space}'’\-]+$/u.test(name)) return { state: "medium", code: "INVALID_CHARS" };

    if (/\p{White_Space}{2,}/u.test(name)) return { state: "medium", code: "SPACES" };

    if (!validity.valid) return { state: "weak", code: "INVALID" };

    return { state: "strong", code: "" };
};

export const validateUserName = ({ value, validity, properties }: ValidationContext): ValidationResult => {
    const username = value.trim();

    if (!username) return properties.required ? { state: "weak", code: "REQUIRED" } : { state: "", code: "" };

    if (username.length < properties.minLength) return { state: "medium", code: "TOO_SHORT" };

    if (username.length > properties.maxLength) return { state: "medium", code: "TOO_LONG" };

    if (!/^[\p{L}0-9_.]+$/u.test(username)) return { state: "medium", code: "INVALID_CHARS" };

    if (/\p{White_Space}/u.test(username)) return { state: "medium", code: "NO_SPACES" };

    if (/\.{2,}/.test(username)) return { state: "medium", code: "CONSECUTIVE_DOTS" };

    if (/^\.|\.$/.test(username)) return { state: "medium", code: "INVALID_DOTS_POSITION" };

    if (!validity.valid) return { state: "weak", code: "INVALID" };

    return { state: "strong", code: "" };
};

export const validateEmail = ({ value, validity, properties }: ValidationContext): ValidationResult => {
    const email = value.trim();

    if (!email) return properties.required ? { state: "weak", code: "REQUIRED" } : { state: "", code: "" };

    if (email.length < properties.minLength) return { state: "medium", code: "TOO_SHORT" };

    if (email.length > properties.maxLength) return { state: "medium", code: "TOO_LONG" };

    if (!email.includes("@")) return { state: "medium", code: "MISSING_AT" };

    const [username, domain] = email.split("@");

    if (!username) return { state: "medium", code: "MISSING_LOCAL_PART" };

    if (!domain) return { state: "medium", code: "MISSING_DOMAIN" };

    if (!validity.valid) return { state: "weak", code: "INVALID" };

    return  { state: "strong", code: "" };
}

export const validatePassword = ({ value, validity, properties }: ValidationContext): ValidationResult => {
    const password = value.trim();

    if (!password) return properties.required ? { state: "weak", code: "REQUIRED" } : { state: "", code: "" };

    if (password.includes(" ")) return { state: "medium", code: "NO_SPACES" };
    if (password.length < properties.minLength) return { state: "medium", code: "TOO_SHORT" };
    if (password.length > properties.maxLength) return { state: "medium", code: "TOO_LONG" };
    if (!/[A-Z]/.test(password)) return { state: "medium", code: "MISSING_UPPERCASE" };
    if (!/[a-z]/.test(password)) return { state: "medium", code: "MISSING_LOWERCASE" };
    if (!/[0-9]/.test(password)) return { state: "medium", code: "MISSING_NUMBER" };
    if (!/[^A-Za-z0-9]/.test(password)) return { state: "medium", code: "MISSING_SPECIAL_CHAR" };

    if (!validity.valid) return { state: "weak", code: "INVALID" };

    return { state: "strong", code: "Excelente, contraseña fuerte" };
};