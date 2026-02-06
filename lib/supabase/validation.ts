// Validates password meets requirements
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('minLength');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('uppercase');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('lowercase');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('special');
    }

    return { valid: errors.length === 0, errors };
}
