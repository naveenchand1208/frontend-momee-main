'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function NotFoundPage() {
    const router = useRouter();
    useEffect(() => {
       router.push('/notFound');
    },[])
  return (
    <div
    //   style={{
    //     backgroundImage: "url('/assets/icons/not-found-icon.png')",
    //     backgroundRepeat: 'no-repeat',
    //     backgroundSize: 'cover',
    //     backgroundPosition: 'center',
    //     height: '100vh',
    //     width: '100%',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //   }}
    >
      {/* <h1 style={{ color: '#fff' }}>404 - Page Not Found</h1> */}
    </div>
  );
}
