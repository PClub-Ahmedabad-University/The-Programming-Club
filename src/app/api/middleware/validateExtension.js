/**
 * Middleware to validate Anti-Copilot Extension requests
 * Prevents fake/tampered extensions from sending API calls
 */

export function validateExtensionKey(request) {
    const extensionKey = request.headers.get('X-Extension-Key');
    const expectedKey = process.env.anti_copilot_extension_client_validation_key;

    if (!extensionKey) {
        return {
            valid: false,
            error: 'Missing extension validation key'
        };
    }

    if (extensionKey !== expectedKey) {
        return {
            valid: false,
            error: 'Invalid extension key - Extension may be tampered. Please reinstall the original extension.'
        };
    }

    return {
        valid: true
    };
}
