import { debounce } from '@/utils/limitExecution';
import { validators } from '@/components/common/form/inputValidation';

type FieldState = "valid" | "invalid" | "";

type FieldController = {
    fieldElement: HTMLDivElement; // necesario para poder leer .hidden
    inputElement: HTMLInputElement;
    validate: () => FieldState;
    getState: () => FieldState;
};

const setupField = (fieldElement: HTMLDivElement, onValidated: () => void): FieldController | null => {
    const inputElement = fieldElement.querySelector<HTMLInputElement>("[data-field-input]");
    const feedbackElement = fieldElement.querySelector<HTMLElement>("[data-field-feedback]");

    if (!inputElement) return null;

    const { type, autocomplete, minLength, maxLength, required } = inputElement;
    const properties = { minLength, maxLength, required };
    const validator = validators[`${type}:${autocomplete}`];

    if (!validator) {
        console.warn(`No hay validador registrado para "${type}:${autocomplete}"`);
        return null;
    }

    let activeCode = "";
    let currentState: FieldState = "";

    const rawMessages = feedbackElement?.dataset.messages;
    const messages: Record<string, string> = rawMessages ? JSON.parse(rawMessages) : {};

    if (feedbackElement) delete feedbackElement.dataset.messages;

    const showMessage = (code: string) => {
        if (!feedbackElement) return;
        if (code === activeCode) return;

        console.log(code, messages[code])
        
        feedbackElement.textContent = messages[code] ?? "";
        activeCode = code;
    };

    const validate = (): FieldState => {
        const { code, state, requirements } = validator({ value: inputElement.value, validity: inputElement.validity, properties });
    
        fieldElement.dataset.state = state;
    
        showMessage(code);
    
        if (requirements) {
            Object.entries(requirements).forEach(([requirement, isValid]) => {
                fieldElement.setAttribute(`data-req-${requirement}`, String(isValid));
            });
        }
    
        currentState = state;
        return state;
    };

    const debouncedValidate = debounce(() => {
        validate();
        onValidated(); // recalcula el estado del botón una vez que el campo terminó de validarse
    }, 400);

    inputElement.addEventListener("input", debouncedValidate);

    if (type === "password") {
        const toggleButton = fieldElement.querySelector<HTMLButtonElement>('[data-toggle="password"]');
        toggleButton?.addEventListener("element-toggle:change", (event) => {
            const { active } = (event as CustomEvent<{ active: boolean }>).detail;
            inputElement.type = active ? "text" : "password";
        });
    }

    return { fieldElement, inputElement, validate, getState: () => currentState };
};

export const setupForm = <T extends Record<string, string>>(form: HTMLFormElement, onValidSubmit: (data: T) => void | Promise<void>) => {
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    const updateSubmitState = () => {
        if (!submitButton) return;

        const canSubmit = fields.every((field) => {
            if (field.fieldElement.hidden) return true; // un campo oculto no bloquea el submit

            const isRequired = field.inputElement.required;
            const state = field.getState();

            // un campo requerido solo permite submit si terminó de validarse como "valid"
            // (esto también cubre el caso de "" mientras la password no cumple todos los requirements)
            if (isRequired) return state === "valid";

            // un campo opcional bloquea solo si quedó explícitamente inválido
            return state !== "invalid";
        });

        submitButton.disabled = !canSubmit;
    };

    const fields = Array.from(form.querySelectorAll<HTMLDivElement>(".form-field"))
        .map((fieldElement) => setupField(fieldElement, updateSubmitState))
        .filter((f): f is FieldController => f !== null);

    // estado inicial del botón (por si hay valores precargados, autofill, etc.)
    // updateSubmitState();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const states = fields.filter((field) => !field.fieldElement.hidden).map((field) => field.validate());

        // const states = fields.map((field) => field.validate());
        const isValid = states.every((state) => state === "valid");

        if (!isValid) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as T;

        await onValidSubmit(data);
    });
};