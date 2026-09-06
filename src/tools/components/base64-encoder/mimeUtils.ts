/**
 * Detects the MIME type of a file based on its binary signature/magic numbers
 * @param data - Uint8Array containing the file's binary data to analyze
 * @returns string - The detected MIME type
 */
export function detectMimeType(data: Uint8Array): string {
    if (!data || data.length === 0) {
        return 'application/octet-stream';
    }

    // RIFF family (must check subtype at offset 8)
    // RIFF....WEBP / WAVE / AVI 
    if (hasAsciiAt(data, 0, 'RIFF') && data.length >= 12) {
        const riffType = readAscii(data, 8, 4);
        if (riffType === 'WEBP') return 'image/webp';
        if (riffType === 'WAVE') return 'audio/wav';
        if (riffType === 'AVI ') return 'video/x-msvideo';
    }

    // ISO BMFF / MP4 family
    // Typical structure: [size:4][ftyp:4][major_brand:4]...
    if (data.length >= 12 && hasAsciiAt(data, 4, 'ftyp')) {
        const majorBrand = readAscii(data, 8, 4);

        // Known brands (not exhaustive but robust for mp4/audio mp4/quicktime)
        const videoMp4Brands = new Set([
            'isom', 'iso2', 'iso3', 'iso4',
            'mp41', 'mp42',
            'avc1', 'dash',
            '3gp4', '3gp5', '3gp6',
            'F4V ', 'M4V '
        ]);

        const audioMp4Brands = new Set([
            'M4A ', 'M4B ', 'M4P ', 'f4a ', 'f4b '
        ]);

        if (majorBrand === 'qt  ') return 'video/quicktime';
        if (videoMp4Brands.has(majorBrand)) return 'video/mp4';
        if (audioMp4Brands.has(majorBrand)) return 'audio/mp4';

        // Unknown BMFF brand: still safer than text/plain
        return 'application/octet-stream';
    }

    // High-confidence signatures
    if (matchBytes(data, [0xFF, 0xD8, 0xFF])) return 'image/jpeg';
    if (matchBytes(data, [0x89, 0x50, 0x4E, 0x47])) return 'image/png';
    if (matchBytes(data, [0x47, 0x49, 0x46, 0x38])) return 'image/gif';
    if (matchBytes(data, [0x42, 0x4D])) return 'image/bmp';
    if (matchBytes(data, [0x00, 0x00, 0x01, 0x00])) return 'image/x-icon';

    if (matchBytes(data, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
    if (matchBytes(data, [0x50, 0x4B, 0x03, 0x04]) || matchBytes(data, [0x50, 0x4B, 0x05, 0x06]) || matchBytes(data, [0x50, 0x4B, 0x07, 0x08])) return 'application/zip';
    if (matchBytes(data, [0x1F, 0x8B, 0x08])) return 'application/gzip';
    if (matchBytes(data, [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07])) return 'application/x-rar-compressed';
    if (matchBytes(data, [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) return 'application/x-7z-compressed';

    if (matchBytes(data, [0x49, 0x44, 0x33])) return 'audio/mpeg';
    if (matchBytes(data, [0xFF, 0xFB]) || matchBytes(data, [0xFF, 0xFA]) || matchBytes(data, [0xFF, 0xF3])) return 'audio/mpeg';
    if (matchBytes(data, [0x66, 0x4C, 0x61, 0x43])) return 'audio/flac';
    if (matchBytes(data, [0x4F, 0x67, 0x67, 0x53])) return 'audio/ogg';

    if (matchBytes(data, [0x1A, 0x45, 0xDF, 0xA3])) return 'video/x-matroska';
    if (matchBytes(data, [0x46, 0x4C, 0x56, 0x01])) return 'video/x-flv';

    if (matchBytes(data, [0x7F, 0x45, 0x4C, 0x46])) return 'application/x-executable';
    if (matchBytes(data, [0x4D, 0x5A])) return 'application/x-msdownload';

    if (isLikelyTextContent(data)) {
        return 'text/plain';
    }

    return 'application/octet-stream';
}

function matchBytes(data: Uint8Array, signature: number[], offset = 0): boolean {
    if (data.length < offset + signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (data[offset + i] !== signature[i]) return false;
    }
    return true;
}

function hasAsciiAt(data: Uint8Array, offset: number, text: string): boolean {
    if (data.length < offset + text.length) return false;
    for (let i = 0; i < text.length; i++) {
        if (data[offset + i] !== text.charCodeAt(i)) return false;
    }
    return true;
}

function readAscii(data: Uint8Array, offset: number, length: number): string {
    if (data.length < offset + length) return '';
    let out = '';
    for (let i = 0; i < length; i++) {
        out += String.fromCharCode(data[offset + i]);
    }
    return out;
}

function isLikelyTextContent(data: Uint8Array): boolean {
    if (data.length === 0) return false;

    const hasUtf8Bom = data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF;
    const hasUtf16LEBom = data.length >= 2 && data[0] === 0xFF && data[1] === 0xFE;
    const hasUtf16BEBom = data.length >= 2 && data[0] === 0xFE && data[1] === 0xFF;

    // Fast binary guard: null bytes are strong binary indicator (unless UTF-16 BOM exists)
    if (!hasUtf16LEBom && !hasUtf16BEBom) {
        const sample = data.subarray(0, Math.min(data.length, 4096));
        for (let i = 0; i < sample.length; i++) {
            if (sample[i] === 0x00) return false;
        }
    }

    try {
        let decoded = '';

        if (hasUtf16LEBom) {
            decoded = new TextDecoder('utf-16le', { fatal: false }).decode(data);
        } else if (hasUtf16BEBom) {
            const beData = data.subarray(2); // skip BOM
            const swapped = new Uint8Array(beData.length);
            for (let i = 0; i + 1 < beData.length; i += 2) {
                swapped[i] = beData[i + 1];
                swapped[i + 1] = beData[i];
            }
            decoded = new TextDecoder('utf-16le', { fatal: false }).decode(swapped);
        } else {
            decoded = new TextDecoder('utf-8', { fatal: true }).decode(hasUtf8Bom ? data.subarray(3) : data);
        }

        if (!decoded) return false;

        return true;
    } catch {
        return false;
    }
}