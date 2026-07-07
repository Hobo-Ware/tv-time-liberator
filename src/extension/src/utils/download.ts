import { strToU8, zipSync } from 'fflate';
import { emit } from '../request/emitter/emit';
import { Topic } from '../request/topic/Topic';

function uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const CHUNK = 0x8000; // avoid arg-count limits on String.fromCharCode
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

function anchorDownload(filename: string, bytes: Uint8Array, mime: string) {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    // Revoke next tick: revoking synchronously can cancel the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Prefer chrome.downloads (via the background worker) for a reliable, visible
// download; fall back to an in-page anchor if the message/download fails.
async function triggerDownload(filename: string, bytes: Uint8Array, mime: string) {
    const ok = await emit(Topic.Download, {
        filename,
        base64: uint8ToBase64(bytes),
        mime,
    }).catch(() => false);

    if (!ok) {
        anchorDownload(filename, bytes, mime);
    }
}

export async function download(filename: string, content: string) {
    await triggerDownload(filename, strToU8(content), 'text/plain;charset=utf-8');
}

export async function downloadZip(files: Record<string, string>, zipName = 'tv-time-export.zip') {
    const zipped = zipSync(
        Object.fromEntries(
            Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
        ),
    );

    await triggerDownload(zipName, zipped, 'application/zip');
}
