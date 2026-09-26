import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#F4EDE3] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#F2D4C8] selection:text-[#234653]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-lg font-bold shadow-2xs group-hover:bg-[#17272C] transition-colors">
            ✦
          </div>
          <span className="text-2xl font-bold text-[#234653] font-serif-editorial tracking-tight">
            RoomSync
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFF9F1] py-8 px-6 sm:px-10 shadow-sm border border-[#E8DEC8] rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
