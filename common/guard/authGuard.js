'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export const useAuthGuard = (skipAuth = false) => {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        if (skipAuth) {
            setIsAuth(false);
            setLoading(false);
            return;
        }

        if (token) {
            setIsAuth(true);
            setLoading(false);
        } else {
            setIsAuth(false);
            setLoading(false);
            router.replace('/login');
        }
    }, [skipAuth, token, router]);

    return { isAuth, loading };
};

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector } from 'react-redux';

// export const useAuthGuard = (skipAuth = false) => {
// 	const [isAuth, setIsAuth] = useState(false);
// 	const [loading, setLoading] = useState(true);
// 	const router = useRouter();

// 	const token = useSelector((state) => state.auth.token);
// 	useEffect(() => {
// 		if (skipAuth) {
// 			setLoading(false);
// 			return;
// 		}

// 		if (!token) {
// 			router.replace('/login');
// 			setIsAuth(false);
// 		} else {
// 			setIsAuth(true);
// 		}
// 		setLoading(false);
// 	}, [skipAuth, token, router]);

// 	return { isAuth, loading };
// };
