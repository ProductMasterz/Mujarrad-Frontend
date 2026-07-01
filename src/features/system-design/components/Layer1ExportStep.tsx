'use client';

import { useMemo, useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import { downloadFile, downloadFiles, type DownloadableFile } from '../utils/downloadFile';
import { buildLayer1ExportFiles, isLayer1BundleExportable } from '../utils/exportLayer1';

export function Layer1ExportStep() {
  const approvedArtifacts = useLayer1Store((state) => state.graphState.approvedLayer1Artifacts);

  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [lastDownloadedAt, setLastDownloadedAt] = useState<string | null>(null);

  const isExportable = isLayer1BundleExportable(approvedArtifacts);

  const files = useMemo(
    () => (isExportable && approvedArtifacts ? buildLayer1ExportFiles(approvedArtifacts) : []),
    [approvedArtifacts, isExportable],
  );

  async function handleDownloadAll() {
    if (!isExportable || !approvedArtifacts) {
      return;
    }

    setError(null);
    setDownloading(true);

    try {
      const response = await fetch('/api/system-builder/layer1/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundle: approvedArtifacts }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        files?: DownloadableFile[];
        error?: string;
      };

      if (!result.ok || !result.files) {
        setError(result.error ?? 'Export failed. Please try again.');
        return;
      }

      downloadFiles(result.files);
      setLastDownloadedAt(new Date().toISOString());
    } catch {
      setError('Export request failed. Check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  }

  function handleDownloadSingle(file: DownloadableFile) {
    downloadFile(file);
    setLastDownloadedAt(new Date().toISOString());
  }

  if (!isExportable) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Task 8</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Export</h2>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-600">
          Approve the Markdown specification and diagram in the Review step before exporting Layer 1 artifacts.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Task 8</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Export</h2>
        </div>

        <button
          type="button"
          disabled={downloading}
          onClick={() => void handleDownloadAll()}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? 'Preparing...' : 'Download all'}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {files.map((file) => (
          <li
            key={file.fileName}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-semibold text-slate-700">{file.fileName}</span>

            <button
              type="button"
              onClick={() => handleDownloadSingle(file)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              Download
            </button>
          </li>
        ))}
      </ul>

      {lastDownloadedAt ? (
        <p className="mt-4 text-xs font-medium text-slate-400">
          Last download triggered at {new Date(lastDownloadedAt).toLocaleTimeString()}.
        </p>
      ) : null}
    </section>
  );
}
