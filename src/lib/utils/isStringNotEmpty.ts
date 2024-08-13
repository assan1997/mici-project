export function isStringNotEmpty(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value.trim() !== '';
}