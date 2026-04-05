'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const st = document.documentElement.scrollTop;
      const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setP(sh <= 0 ? 0 : (st / sh) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className="fixed left-0 top-0 z-[200] h-0.5 bg-gradient-to-r from-[#7C6EFA] to-[#A855F7] transition-[width] duration-150"
      style={{ width: `${p}%` }}
    />
  );
}
