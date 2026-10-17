import React from 'react';
import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[#e4e8e1] bg-white/70 mt-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs font-semibold text-[#6b756e] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-extrabold text-[#17231d]">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2f6b4f] text-[#d9f36a]">
            <Compass size={15} />
          </span>
          <span>NearNest</span>
        </div>
        <span>Discover local. Book confidently. Support nearby.</span>
        <span>Built for HACKVIBE · Round 1</span>
      </div>
    </footer>
  );
};

export default Footer;
