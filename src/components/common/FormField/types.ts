// export type ValidationContext = {
//     value: string;
//     properties: {
//         minLength: number;
//         maxLength: number;
//         required: boolean;
//     };
//     validity: ValidityState;
// };

// export type ValidationResult = {
//     code: string;
//     state: "invalid" | "valid" | "";
//     strength?: "weak" | "medium" | "strong" | "";
// };

// export type PasswordError = {
//     code:  "" | "REQUIRED" | "INVALID" | "TOO_SHORT" | "TOO_LONG" | "MISSING_AT" | "MISSING_LOCAL_PART" | "MISSING_DOMAIN" | "NO_SPACES" | "MISSING_UPPERCASE" | "MISSING_LOWERCASE" | "MISSING_NUMBER" | "MISSING_SPECIAL_CHAR";
//     state: "invalid" | "valid" | "";
//     strength?: "weak" | "medium" | "strong" | "";
// }

type FieldProperties = {
    minLength: number;
    maxLength: number;
    required: boolean;
};

export type ValidationContext<Props = FieldProperties> = {
    value: string;
    properties: Props;
    validity: ValidityState;
};

export type ValidationResult<Code extends string = string> = {
    code: Code | "";
    state: "invalid" | "valid" | "";
    strength?: "weak" | "medium" | "strong" | "";
};

// Tipo genérico que usa el componente para invocar cualquier validador
export type Validator = (ctx: ValidationContext) => ValidationResult;

export type PasswordCode = | "" | "REQUIRED" | "INVALID" | "TOO_SHORT" | "TOO_LONG" | "NO_SPACES" | "MISSING_UPPERCASE" | "MISSING_LOWERCASE" | "MISSING_LETTER" | "MISSING_NUMBER" | "MISSING_SPECIAL_CHAR";


// Helper genérico: solo evita repetir la forma del objeto en cada validador

// export type Validator = (context: ValidationContext) => ValidationResult;

// email: "" | "REQUIRED" | "INVALID" | "MISSING_AT" | "MISSING_LOCAL_PART" | "MISSING_DOMAIN" | ""