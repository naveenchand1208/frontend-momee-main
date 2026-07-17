'use client';

import { useSocket } from '@/hooks/useSocket';

export default function ClientSocketProvider() {
  useSocket({ trackNotifications: true });
  return null;
}
