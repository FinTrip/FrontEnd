"use client";
import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Định nghĩa interface cho ZegoUIKitPrebuilt và các config liên quan
interface RoomConfig {
  container: HTMLDivElement | null;
  sharedLinks: Array<{ name: string; url: string }>;
  scenario: { mode: string };
  turnOnMicrophoneWhenJoining: boolean;
  turnOnCameraWhenJoining: boolean;
  showMyCameraToggleButton: boolean;
  showMyMicrophoneToggleButton: boolean;
  showAudioVideoSettingsButton: boolean;
  showScreenSharingButton: boolean;
  showTextChat: boolean;
  showUserList: boolean;
  maxUsers: number;
  layout: string;
  showLayoutButton: boolean;
}

interface ZegoUIKitPrebuilt {
  generateKitTokenForTest: (appID: number, serverSecret: string, roomID: string, userID: string, userName: string) => string;
  create: (token: string) => { joinRoom: (config: RoomConfig) => void };
  VideoConference: string;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

export default function VideoCall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Chỉ kiểm tra token trong localStorage
    const localToken = localStorage.getItem('token');
    
    if (!localToken) {
      router.push('/page/auth/login');
      return;
    }

    const loadZegoCloud = async () => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeVideoCall();
      };
    };

    const initializeVideoCall = () => {
      // Lấy roomID từ URL hoặc tạo mới
      const roomID = searchParams.get('roomID') || Math.floor(Math.random() * 10000).toString();
      
      // Lấy thông tin người dùng từ localStorage
      let userID = Math.floor(Math.random() * 10000).toString();
      let userName = 'Guest';
      
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userID = userData.id?.toString() || userID;
          userName = userData.fullName || `User_${userID}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      
      const appID = 31464026;
      const serverSecret = "46c4e0a6f2c196c3bb03ec86f584a960";
      
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = window.ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: rootRef.current,
        sharedLinks: [{
          name: 'Personal link',
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
        }],
        scenario: {
          mode: window.ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 10,
        layout: "Auto",
        showLayoutButton: false,
      });
    };

    loadZegoCloud();

    return () => {
      const zegoScript = document.querySelector('script[src*="zego-uikit-prebuilt"]');
      if (zegoScript) {
        zegoScript.remove();
      }
    };
  }, [searchParams, user, router]);

  return (
    <div 
      ref={rootRef} 
      className="w-screen h-screen"
    />
  );
}

