import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';

export interface PDFProtectOptions {
    userPassword: string;
    ownerPassword?: string;
    algorithm?: 'AES-256' | 'RC4';
    allowPrinting?: boolean;
    allowCopying?: boolean;
    allowModifying?: boolean;
    allowFillingForms?: boolean;
    allowAnnotating?: boolean;
}

export async function checkIsPdfEncrypted(pdfBytes: Uint8Array): Promise<{
    encrypted: boolean;
    algorithm?: string;
    version?: number;
    keyLength?: number;
}> {
    try {
        const info = await isEncrypted(pdfBytes);
        return info as any;
    } catch {
        return { encrypted: false };
    }
}

export async function protectPdfDocument(
    pdfBytes: Uint8Array,
    options: PDFProtectOptions
): Promise<Uint8Array> {
    if (!options.userPassword) {
        throw new Error("User password is required to protect the PDF.");
    }

    const encryptedBytes = await encryptPDF(pdfBytes, options.userPassword, {
        ownerPassword: options.ownerPassword || options.userPassword,
        algorithm: options.algorithm || 'AES-256',
        allowPrinting: options.allowPrinting ?? true,
        allowCopying: options.allowCopying ?? true,
        allowModifying: options.allowModifying ?? false,
        allowFillingForms: options.allowFillingForms ?? true,
        allowAnnotating: options.allowAnnotating ?? true,
    });

    return encryptedBytes;
}

export async function unlockPdfDocument(
    pdfBytes: Uint8Array,
    password: string
): Promise<Uint8Array> {
    if (!password) {
        throw new Error("Password is required to unlock this document.");
    }

    try {
        const decryptedBytes = await decryptPDF(pdfBytes, password);
        return decryptedBytes;
    } catch (err: any) {
        throw new Error(err?.message || "Incorrect password or unsupported encryption format.");
    }
}
