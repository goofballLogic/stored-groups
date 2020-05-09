export function required(value, name, description) {
    if (value) return value;
    throw new Error(`Required ${name} missing: ${description}`);
}