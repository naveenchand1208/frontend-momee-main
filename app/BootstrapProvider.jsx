// app/BootstrapProvider.jsx
'use client';

import { useEffect } from "react";

export default function BootstrapProvider() {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null; // it doesn't render anything visible
}
