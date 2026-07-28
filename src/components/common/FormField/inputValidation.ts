import type { ValidationContext, ValidationResult, Validator, PasswordCode } from "./types";

const makeResult = <Code extends string>(result: ValidationResult<Code>) => result;

const normalize = (value: string) => value.normalize("NFC").trim();

// const validateLengt = (value: string, properties:ValidationContext["properties"]): ValidationResult => {
//     if (!value) return properties.required ? { state: "invalid", code: "REQUIRED" } : { state: "", code: "" };

//     if (value.length < properties.minLeValidatorngth) return { state: "invalid", code: "TOO_SHORT" };

//     if (value.length > properties.maxLength) return { state: "invalid", code: "TOO_LONG" };
// };

// export const validateName = ({ value, validity, properties }: ValidationContext): ValidationResult => {
//     const name = normalize(value);

//     const result = validateLengt(name, properties);
//     if (result) return result;

//     if (!/^[\p{L}\p{White_Space}'’\-]+$/u.test(name)) return { state: "invalid", code: "INVALID_CHARS" };

//     if (!validity.valid) return { state: "invalid", code: "INVALID" };

//     if (/\p{White_Space}{2,}/u.test(name)) return { state: "invalid", code: "SPACES" };

//     return { state: "valid", code: "" };
// };

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

// export const validateEmail = ({ value, validity, properties }: ValidationContext): ValidationResult => {
//     const email = normalize(value);

//     if (!email) return properties.required ? { state: "invalid", code: "REQUIRED" } : { state: "", code: "" };

//     if (!email.includes("@")) return { state: "invalid", code: "MISSING_AT" };

//     const [username, domain] = email.split("@");

//     if (!username) return { state: "invalid", code: "MISSING_LOCAL_PART" };

//     if (!domain) return { state: "invalid", code: "MISSING_DOMAIN" };

//     const lengthError = validateLength(email.length, properties.minLength, properties.maxLength);
//     if (lengthError) return lengthError;

//     if (!validity.valid) return { state: "invalid", code: "INVALID" };

//     return  { state: "valid", code: "" };
// }

// const validateLength = (valueLength: number, minLength: number, maxLength: number): ValidationResult | null => {
//     if (valueLength < minLength) return { state: "invalid", code: "TOO_SHORT" };
//     if (valueLength > maxLength) return { state: "invalid", code: "TOO_LONG" };
//     return null;
// };



export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<PasswordCode> => {
    const password = normalize(value);

    const length = [...new Intl.Segmenter(undefined, {granularity: "grapheme"}).segment(password)].length;

    console.log("value", value.length, "password", password.length, "granularity", length )

    if (!password) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid", strength: "weak" })
            : makeResult({ code: "", state: "", strength: "" });
    }

    if (/\p{White_Space}/u.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid", strength: "weak" });

    if (!/\p{L}/u.test(password)) return makeResult({ code: "MISSING_LETTER", state: "invalid", strength: "weak" });

    if (!/\p{Nd}/u.test(password)) return makeResult({ code: "MISSING_NUMBER", state: "invalid", strength: "medium" });

    if (!/[\p{P}$+=]/u.test(password)) return makeResult({ code: "MISSING_SPECIAL_CHAR", state: "invalid", strength: "medium" });

    if (password.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid", strength: "medium" });
    if (password.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid", strength: "medium" });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid", strength: "weak" });

    return makeResult({ code: "", state: "valid", strength: "strong" });
};

// const passwordError = ({ code, state, strength }: PasswordError): ValidationResult => ({
//     code, state, strength
// });

// const validateLength = (valueLength: number, minLength: number, maxLength: number): ValidationResult | null => {
//     if (valueLength < minLength) return passwordError({ code: "TOO_SHORT", state: "invalid", strength: "medium" });
//     if (valueLength > maxLength) return passwordError({ code: "TOO_LONG", state: "invalid", strength: "medium" });
//     return null;
// };

// export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult => {
//     const password = normalize(value);
 
//     if (!password) return properties.required ? passwordError({ code: "REQUIRED", state: "invalid", strength: "weak" }) : passwordError({ code: "", state: "", strength: "" });

//     if (/\p{White_Space}/u.test(password)) return passwordError({ code: "NO_SPACES", state: "invalid", strength: "weak" });

//     if (!/\p{Lu}/u.test(password)) return passwordError({ code: "MISSING_UPPERCASE", state: "invalid", strength: "weak" });
//     if (!/\p{Ll}/u.test(password)) return passwordError({ code: "MISSING_LOWERCASE", state: "invalid", strength: "weak" });

//     if (!/\p{N}/u.test(password)) return passwordError({ code: "MISSING_NUMBER", state: "invalid", strength: "medium" });
//     if (!/[^\p{L}\p{N}]/u.test(password)) return passwordError({ code: "MISSING_SPECIAL_CHAR", state: "invalid", strength: "medium" });

//     const lengthError = validateLength(password.length, properties.minLength, properties.maxLength);
//     if (lengthError) return lengthError; 

//     if (!validity.valid) return passwordError({ code: "INVALID", state: "invalid", strength: "weak" });

//     return passwordError({ code: "", state: "valid", strength: "strong" });
// };


// export type Validator = (ctx: ValidationContext) => ValidationResult;


export const validators: Record<string, Validator> = {
    // "text:name": validateName,
    "password:new-password": validateNewPassword,
    // "email:email": validateEmail,
    
    // agrega aquí nuevas entradas: "type:autocomplete": validateFn
};
// export const validators: Record<string, Validator> = {
//     "text:name": validateName,
//     "text:username": validateUserName,
//     "email:": validateEmail,
//     "password:new-password": validateNewPassword,
// };