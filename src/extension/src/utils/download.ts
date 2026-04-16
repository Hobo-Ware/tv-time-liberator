import { strToU8, zipSync } from 'fflate';

export function download(filename: string, content: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function downloadZip(files: Record<string, string>, zipName = 'tv-time-export.zip') {
    const zipped = zipSync(
        Object.fromEntries(
            Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
        ),
    );

    const blob = new Blob([zipped], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', zipName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    URL.revokeObjectURL(url);
}