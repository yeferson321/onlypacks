import type { ValidationContext, ValidationResult, Validator, NameCode, EmailCode, CurrentPasswordCode, NewPasswordCode } from "./types";

const makeResult = <Code extends string>(result: ValidationResult<Code>) => result;

const normalize = (value: string) => value.normalize("NFC").trim();

export const validateName = ({ value, properties, validity }: ValidationContext): ValidationResult<NameCode> => {
    const name = normalize(value);

    if (!name) {
        return properties.required 
            ? makeResult({ code: "REQUIRED", state: "invalid" })
            : makeResult({ code: "", state: "" });
    }

    if (!/^[\p{L} '’-]+$/u.test(name)) return makeResult({ code: "INVALID_CHARS", state: "invalid" });
    if (/ {2,}/.test(name)) return makeResult({ code: "SPACES", state: "invalid" });

    if (name.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid" });
    if (name.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateEmail = ({ value, properties, validity }: ValidationContext): ValidationResult<EmailCode> => {
    const email = normalize(value);

    if (!email) {
        return properties.required 
            ? makeResult({ code: "REQUIRED", state: "invalid" }) 
            : makeResult({ code: "", state: "" });
    }

    if (/\p{White_Space}/u.test(email)) return makeResult({ code: "NO_SPACES", state: "invalid" });
    if (!email.includes("@")) return makeResult({ code: "MISSING_AT", state: "invalid" });

    const [username, domain] = email.split("@");

    if (!username) return makeResult({ code: "MISSING_LOCAL_PART", state: "invalid" });
    if (!domain) return makeResult({ code: "MISSING_DOMAIN", state: "invalid" });
    if (email.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid" });
    if (email.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
}

export const validateCurrentPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<CurrentPasswordCode> => {
    const password = normalize(value);

    if (!password) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid" })
            : makeResult({ code: "", state: "" });
    }

    if (/\p{White_Space}/u.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid" });

    if (password.length < properties.minLength) return makeResult({ code: "", state: "" });
    if (password.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<NewPasswordCode> => {
    const password = normalize(value);

    if (!password) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid", strength: "", requirements: { length: false, letter: false, number: false, special: false }})
            : makeResult({ code: "", state: "", strength: "", requirements: {} });
    }

    const requirements = {
        letter: /\p{L}/u.test(password),
        number: /\p{Nd}/u.test(password),
        special: /[\p{P}$+=]/u.test(password),
        length: password.length >= properties.minLength,
    };

    const metCount = Number(requirements.length) + Number(requirements.letter) + Number(requirements.number) + Number(requirements.special);
    const strength: NonNullable<ValidationResult["strength"]> = metCount <= 1 ? "weak" : metCount === 2 ? "fair" : metCount === 3 ? "good" : "strong";

    if (/\p{White_Space}/u.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid", strength, requirements });
    if (/(.)\1{2,}/u.test(password)) return makeResult({ code: "REPEATED_CHARACTERS", state: "invalid", strength, requirements });
    if (!requirements.letter) return makeResult({ code: "", state: "", strength, requirements });
    if (!requirements.number) return makeResult({ code: "", state: "", strength, requirements });
    if (!requirements.special) return makeResult({ code: "", state: "", strength, requirements });
    if (!requirements.length) return makeResult({ code: "", state: "", strength, requirements });
    if (password.length > properties.maxLength) return makeResult({ code: "", state: "", strength, requirements });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid", strength, requirements });

    return makeResult({ code: "", state: "valid", strength, requirements });
};

// export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<NewPasswordCode> => {
//     const password = normalize(value);

//     // const length = [...new Intl.Segmenter(undefined, {granularity: "grapheme"}).segment(password)].length;
//     // console.log("value", value.length, "password", password.length, "granularity", length )

//     if (!password) {
//         return properties.required
//             ? makeResult({ code: "REQUIRED", state: "invalid", strength, requirements: { length: false, case: false, number: false, special: false } })
//             : makeResult({ code: "", state: "", strength: "", requirements: {} });
//     }

//     if (/\p{White_Space}/u.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid", strength, requirements: { length: false, case: false, number: false, special: false } });

//     if (!/\p{L}/u.test(password)) return makeResult({ code: "MISSING_LETTER", state: "invalid", strength, requirements: { length: false, case: false, number: false, special: false } });

//     if (!/\p{Nd}/u.test(password)) return makeResult({ code: "MISSING_NUMBER", state: "invalid", strength: "medium", requirements: { length: false, case: true, number: false, special: false } });

//     if (!/[\p{P}$+=]/u.test(password)) return makeResult({ code: "MISSING_SPECIAL_CHAR", state: "invalid", strength: "medium", requirements: { length: false, case: true, number: true, special: false } });

//     if (password.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid", strength: "medium", requirements: { length: false, case: true, number: true, special: true } });
//     if (password.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid", strength: "medium", requirements: { length: true, case: true, number: true, special: true } });

//     if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid", strength, requirements: { length: false, case: false, number: false, special: false } });

//     return makeResult({ code: "", state: "valid", strength: "strong", requirements: { length: true, case: true, number: true, special: true } });
// };

export const validators: Record<string, Validator> = {
    "text:name": validateName,
    "email:email": validateEmail,
    "password:current-password": validateCurrentPassword,
    "password:new-password": validateNewPassword,
};


// export const validateUserName = ({ value, validity, properties }: ValidationContext): ValidationResult => {
//     const username = normalize(value)

//     const result = validateLengt(username, properties);
//     if (result) return result;

//     if (!/^[\p{L}0-9_.]+$/u.test(username)) return { state: "invalid", code: "INVALID_CHARS" };

//     if (/\p{White_Space}/u.test(username)) return { state: "invalid", code: "NO_SPACES" };

//     if (!validity.valid) return { state: "invalid", code: "INVALID" };

//     if (/\.{2,}/.test(username)) return { state: "invalid", code: "CONSECUTIVE_DOTS" };
//     if (/^\.|\.$/.test(username)) return { state: "invalid", code: "INVALID_DOTS_POSITION" };

//     return { state: "valid", code: "" };
// };
    // if (!/^[\p{L}\p{White_Space}'’\-]+$/u.test(name)) return makeResult({ code: "INVALID_CHARS", state: "invalid" });
