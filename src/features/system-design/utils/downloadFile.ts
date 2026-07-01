export type DownloadableFileEncoding = 'utf-8' | 'base64' | 'data-url';

export interface DownloadableFile {
  fileName: string;
  content: string;
  mimeType?: string;
  encoding?: DownloadableFileEncoding;
}

/**
 * Triggers a browser download for the given href by creating a temporary
 * anchor element, clicking it, and cleaning it up afterwards.
 *
 * No-ops outside the browser (e.g. during server-side rendering or in a
 * non-DOM test environment) so it is safe to call from shared code paths.
 */
function triggerBrowserDownload(fileName: string, href: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (href.startsWith('blob:') && typeof URL !== 'undefined' && 'revokeObjectURL' in URL) {
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
}

/**
 * Downloads plain text content (e.g. Markdown or XML) as a file.
 */
export function downloadTextFile(
  fileName: string,
  content: string,
  mimeType = 'text/plain;charset=utf-8',
): void {
  if (typeof window === 'undefined' || typeof Blob === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);

  triggerBrowserDownload(fileName, href);
}

/**
 * Downloads content that is already a data: URL (e.g. an inline diagram
 * image captured as a base64 PNG/SVG data URL).
 */
export function downloadDataUrlFile(fileName: string, dataUrl: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  triggerBrowserDownload(fileName, dataUrl);
}

/**
 * Downloads a single DownloadableFile, dispatching to the right strategy
 * based on its encoding.
 */
export function downloadFile(file: DownloadableFile): void {
  const encoding = file.encoding ?? 'utf-8';

  if (encoding === 'data-url') {
    downloadDataUrlFile(file.fileName, file.content);
    return;
  }

  if (encoding === 'base64') {
    const mimeType = file.mimeType ?? 'application/octet-stream';
    downloadDataUrlFile(file.fileName, `data:${mimeType};base64,${file.content}`);
    return;
  }

  downloadTextFile(file.fileName, file.content, file.mimeType);
}

/**
 * Downloads a list of files sequentially. Browsers may prompt the user to
 * allow multiple downloads when more than one file is triggered at once.
 */
export function downloadFiles(files: DownloadableFile[]): void {
  files.forEach((file) => downloadFile(file));
}
