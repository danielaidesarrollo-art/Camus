/**
 * Security Utility
 * Implements AES-256-GCM encryption for health data transit (Directiva 4)
 */

const ENCRYPTION_KEY = import.meta.env.VITE_TRANSIT_KEY || 'default-secret-key-32-chars-long!!';

export async function encryptData(data: any): Promise<{ ciphertext: string; iv: string }> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    const key = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

export async function decryptData(ciphertextB64: string, ivB64: string): Promise<any> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const key = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
        'AES-GCM',
        false,
        ['decrypt']
    );

    const iv = new Uint8Array(atob(ivB64).split('').map(c => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(ciphertextB64).split('').map(c => c.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );

    return JSON.parse(decoder.decode(decrypted));
}
