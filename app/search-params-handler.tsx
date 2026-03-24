'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SearchParamsHandlerProps {
  children: React.ReactNode;
}

export default function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const error = errorParam ? decodeURIComponent(errorParam) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (errorParam) {
      // Clear the error from URL after reading it
      window.history.replaceState({}, '', '/');
    }
  }, [errorParam]);

  if (!mounted) return null;

  return (
    <>
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {children}
    </>
  );
}
