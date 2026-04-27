// src/app/auth/error/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Leer el fragment de la URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const errorDesc = params.get('error_description') ?? 'El link es inválido o expiró';
    
    router.replace(`/auth/login?error=${encodeURIComponent(errorDesc)}`);
  }, []);

  return null;
}