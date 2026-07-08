import { strToU8, zipSync } from 'fflate';

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

export async function download(filename: string, content: string) {
    anchorDownload(filename, strToU8(content), 'text/plain;charset=utf-8');
}

export async function downloadZip(files: Record<string, string>, zipName = 'tv-time-export.zip') {
    const zipped = zipSync(
        Object.fromEntries(
            Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
        ),
    );

    anchorDownload(zipName, zipped, 'application/zip');
}
