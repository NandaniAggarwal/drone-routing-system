import React from 'react';

export function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-wide text-muted">{label}</span>
      <input
        {...props}
        className="bg-scope-bg border border-scope-border rounded-md px-2.5 py-1.5 text-sm font-mono text-gray-100 focus:border-signal-cyan/60 transition-colors w-full"
      />
    </label>
  );
}

export function SelectField({ label, children, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-wide text-muted">{label}</span>
      <select
        {...props}
        className="bg-scope-bg border border-scope-border rounded-md px-2.5 py-1.5 text-sm font-mono text-gray-100 focus:border-signal-cyan/60 transition-colors w-full"
      >
        {children}
      </select>
    </label>
  );
}

export function IconButton({ children, variant = 'ghost', className = '', ...props }) {
  const base = 'flex items-center justify-center gap-1.5 rounded-md text-xs font-medium px-2.5 py-1.5 transition-colors';
  const variants = {
    ghost: 'text-muted hover:text-gray-100 hover:bg-white/5',
    danger: 'text-signal-coral/80 hover:text-signal-coral hover:bg-signal-coral/10 border border-signal-coral/20',
    add: 'text-signal-cyan bg-signal-cyan/10 hover:bg-signal-cyan/20 border border-signal-cyan/30',
  };
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
