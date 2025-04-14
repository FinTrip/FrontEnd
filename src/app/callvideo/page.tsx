// FrontEnd/src/app/CallVideo/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoCall from '../page/components/callvideo/videocall';

export default function VideoCallPage() {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xác thực từ localStorage
    const localToken = localStorage.getItem('token');
    
    if (!localToken) {
      router.push('/page/auth/login');
    }
  }, [router]);

  return <VideoCall />;
}