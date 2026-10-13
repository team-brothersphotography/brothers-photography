import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FieldWrapper({ label, error, children, hint }: FieldWrapperProps) {
  return (
    <label className="block">
      <span className="text-sm text-cream-dim">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <span className="mt-1 block text-xs text-cream-dim/70">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-clay">{error}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-cream placeholder:text-cream-dim/50 focus:border-gold";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`.trim()} {...props} />;
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} min-h-[100px] resize-y ${className}`.trim()} {...props} />;
}
