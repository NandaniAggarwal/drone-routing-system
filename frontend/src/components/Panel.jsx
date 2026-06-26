import React from 'react';

export default function Panel({ title, eyebrow, accent = '#5EEAD4', children, action }) {
  return (
    <div className="bg-scope-panel border border-scope-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-scope-border" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}>
        <div>
          {eyebrow && (
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
              {eyebrow}
            </div>
          )}
          <div className="font-semibold text-sm text-gray-100">{title}</div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
