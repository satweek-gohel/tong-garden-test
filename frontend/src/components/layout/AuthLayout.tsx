import React from "react";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex font-sans">
    <div className="hidden lg:flex w-[480px] xl:w-[560px] shrink-0 bg-primary px-16 py-14 flex-col justify-between relative overflow-hidden">
      <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full bg-white/[0.04]" />
      <div className="absolute -left-36 -bottom-36 w-96 h-96 rounded-full bg-white/[0.03]" />

      <div className="flex items-center gap-3 relative">
        <div className="w-9 h-9 rounded-[9px] bg-accent flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E4638" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <div className="text-[#F5F3EE] text-sm font-semibold tracking-[0.16em]">TONG GARDEN</div>
          <div className="text-[#F5F3EE]/55 text-[11px] tracking-[0.1em] mt-0.5">OPERATIONS</div>
        </div>
      </div>

      <div className="relative max-w-md">
        <div className="text-accent text-[13px] font-semibold tracking-[0.08em] mb-5">INTERNAL PLATFORM</div>
        <h1 className="font-display text-[#F5F3EE] text-4xl font-semibold leading-tight tracking-tight">
          Run the floor, the warehouse and the ledger from one screen.
        </h1>
        <p className="text-[#F5F3EE]/70 text-[15px] leading-relaxed mt-5">
          Products, inventory and orders for our manufacturing and FMCG operations — one login for every team.
        </p>
      </div>

      <div className="relative flex items-center gap-2.5 text-[#F5F3EE]/55 text-[13px]">
        <span>Manufacturing &amp; FMCG</span>
        <span className="w-[3px] h-[3px] rounded-full bg-[#F5F3EE]/40" />
        <span>Ahmedabad</span>
      </div>
    </div>

    <div className="flex-1 flex items-center justify-center bg-bg px-6 py-12">{children}</div>
  </div>
);
