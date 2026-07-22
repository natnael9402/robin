'use client';

import { cn } from '../../lib/utils';

interface FileUploadProps {
  label?: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function FileUpload({ label, accept = 'image/*', value, onChange, className }: FileUploadProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
          {label}
        </label>
      )}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-surface file:text-primary hover:file:bg-surface-hover"
      />
      {value && (
        <p className="mt-1.5 text-xs text-primary font-mono truncate">{value.name}</p>
      )}
    </div>
  );
}
