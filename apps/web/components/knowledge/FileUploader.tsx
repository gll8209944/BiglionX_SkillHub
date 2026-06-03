'use client';

import { useState, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';

interface PreviewData {
  headers?: string[];
  rows?: Record<string, string>[];
  totalRows?: number;
}

interface FileUploaderProps {
  onFileParsed: (data: { contentType: 'csv' | 'json'; content: unknown; rawContent: string; preview: unknown }) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploader({ onFileParsed, accept = '.csv,.json', maxSizeMB = 10 }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndParse = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('parsing');
    setError('');

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`文件大小超过限制（最大 ${maxSizeMB}MB），当前大小：${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      setStatus('error');
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json') {
      setError('仅支持 CSV 和 JSON 文件');
      setStatus('error');
      return;
    }

    try {
      const rawContent = await selectedFile.text();

      if (ext === 'csv') {
        handleParseCSV(rawContent);
      } else {
        handleParseJSON(rawContent);
      }
    } catch {
      setError('文件读取失败');
      setStatus('error');
    }
  }, [maxSizeMB]);

  const handleParseCSV = (rawContent: string) => {
    const lines = rawContent.trim().split('\n').filter(Boolean);
    if (lines.length < 1) {
      setError('CSV 文件为空');
      setStatus('error');
      return;
    }

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    });

    setPreview({ headers, rows: rows.slice(0, 5), totalRows: rows.length });
    setStatus('success');

    onFileParsed({
      contentType: 'csv',
      content: rows,
      rawContent,
      preview: { headers, rows: rows.slice(0, 5) },
    });
  };

  const handleParseJSON = (rawContent: string) => {
    try {
      const data = JSON.parse(rawContent);

      let previewData: unknown;
      if (Array.isArray(data)) {
        previewData = data.slice(0, 5);
      } else {
        previewData = data;
      }

      setPreview({ totalRows: Array.isArray(data) ? data.length : 1 });
      setStatus('success');

      onFileParsed({
        contentType: 'json',
        content: data,
        rawContent,
        preview: previewData,
      });
    } catch {
      setError('JSON 解析失败，请检查文件格式');
      setStatus('error');
    }
  };

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndParse(droppedFile);
    }
  }, [validateAndParse]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndParse(selectedFile);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setError('');
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {status === 'idle' || status === 'error' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            拖拽文件到此处，或点击选择文件
          </p>
          <p className="mt-1 text-xs text-gray-400">
            支持 CSV、JSON 格式，最大 {maxSizeMB}MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : null}

      {status === 'parsing' && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <FileText className="h-4 w-4" />
          正在解析文件...
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
          <button onClick={reset} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {status === 'success' && file && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{file.name}</span>
            <span className="text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
            {preview?.totalRows !== undefined && (
              <span className="text-gray-500">共 {preview.totalRows} 行</span>
            )}
            <button onClick={reset} className="ml-auto text-green-400 hover:text-green-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {preview?.headers && preview?.rows && (() => { const hdrs = preview.headers; const rws = preview.rows; return (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {hdrs.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rws.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {hdrs.map((h) => (
                        <td key={h} className="px-3 py-2 text-gray-700 truncate max-w-40">{row[h] || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.totalRows && preview.totalRows > 5 && (
                <p className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t">
                  仅显示前 5 行，共 {preview.totalRows} 行数据
                </p>
              )}
            </div>
          ); })()}
        </div>
      )}
    </div>
  );
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
