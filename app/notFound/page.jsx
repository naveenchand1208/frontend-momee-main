'use client';
import { useEffect } from "react";
import Button from "@/components/shared/button/page";
import { Colors } from "@/common/constants/colorEnum";
import { useRouter } from "next/navigation";
export default function NotFoundPage() {
    const router = useRouter();
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/');
            // router.back();
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);
    return (
        <div
            style={{
                backgroundImage: "url('/assets/icons/not-found-icon.png')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: '1rem',
                    textAlign: 'center',
                    marginLeft: '750px',
                    marginTop: '500px'
                }}
            >
                <Button
                    label="Back to Momee"
                    type="button"
                    size="small"
                    color="#fff"
                    backgroundColor={Colors.Primary1}
                    onClick={() => router.push('/')}
                />
            </div>
        </div>
    );
}
