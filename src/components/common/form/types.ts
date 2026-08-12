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

export type PasswordRequirement = | "length" | "letter" | "number" | "special";

export type PasswordRequirements = Partial<Record<PasswordRequirement, boolean>>;

export type ValidationResult<Code extends string = string> = {
    code?: Code | "";
    state: "invalid" | "valid" | "";
    strength?: "weak" | "medium" | "strong" | "";
    requirements?: PasswordRequirements;
};

export type Validator = (ctx: ValidationContext) => ValidationResult;

export type NameCode = | "" | "REQUIRED" | "INVALID_CHARS" | "SPACES" | "TOO_SHORT" | "TOO_LONG" | "INVALID";
export type EmailCode = | "" | "REQUIRED" | "NO_SPACES" | "MISSING_AT" | "MISSING_LOCAL_PART" | "MISSING_DOMAIN" | "TOO_SHORT" | "TOO_LONG" | "INVALID";
export type PasswordCode = | "" | "REQUIRED" | "NO_SPACES" | "TOO_SHORT" | "TOO_LONG" | "INVALID";
export type NewPasswordCode = | "" | "REQUIRED" | "NO_SPACES" | "MISSING_LETTER" | "MISSING_NUMBER" | "MISSING_SPECIAL_CHAR" | "TOO_SHORT" | "TOO_LONG" | "INVALID";