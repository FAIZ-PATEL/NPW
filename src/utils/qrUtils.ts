import QRCode from 'qrcode';
import jsQR from 'jsqr';

/**
 * Returns the public / direct URL to open the digital job summary page.
 */
export function getJobSummaryUrl(jobNumber: string): string {
  const origin = window.location.origin || '';
  const pathname = window.location.pathname || '';
  return `${origin}${pathname}?job=${encodeURIComponent(jobNumber)}`;
}

/**
 * Generates a high-resolution QR Code data URL for a job card.
 */
export async function generateJobQRCodeDataUrl(
  jobNumber: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const url = getJobSummaryUrl(jobNumber);
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      width: options?.width || 320,
      margin: options?.margin !== undefined ? options?.margin : 2,
      color: {
        dark: '#1e3a8a', // Deep blue brand color
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    // Fallback simple QR
    return await QRCode.toDataURL(jobNumber, { width: options?.width || 320 });
  }
}

/**
 * Decodes a QR code from image/canvas pixel data using jsQR.
 */
export function scanQRFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): string | null {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code && code.data) {
      return code.data;
    }
  } catch (e) {
    console.error('jsQR scanning error:', e);
  }
  return null;
}

/**
 * Extracts a Job Number (e.g. NW-0001, NW-1025) from any scanned QR text or URL.
 */
export function parseJobNumberFromQR(scannedText: string): string | null {
  if (!scannedText) return null;

  // Case 1: URL format like ...?job=NW-0001
  try {
    const url = new URL(scannedText, window.location.origin);
    const jobParam = url.searchParams.get('job');
    if (jobParam) {
      const match = jobParam.match(/NW-\d+/i);
      if (match) return match[0].toUpperCase();
    }
  } catch {
    // Not a standard URL
  }

  // Case 2: Contains NW-XXXX anywhere in text
  const match = scannedText.match(/NW-\d+/i);
  if (match) {
    return match[0].toUpperCase();
  }

  return null;
}
