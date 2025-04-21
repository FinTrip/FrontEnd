
"use client";
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { io, Socket } from 'socket.io-client';

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
  onLeaveRoom?: () => void;
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

// Định nghĩa interface cho thông báo cuộc gọi
interface CallNotification {
  callerId: number;
  callerName: string;
  roomId: string;
  type: 'video' | 'audio';
}

export default function VideoCall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    // Khởi tạo kết nối socket cho các thông báo trong thời gian thực
    if (user && token) {
      const socket = io('http://localhost:8081', {
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        
        // Đăng ký nhận thông báo cuộc gọi
        socket.emit('register', { userId: user.id });
      });

      socket.on('call-notification', (data: CallNotification) => {
        console.log('Call notification received:', data);
        
        // Tạo custom event để thông báo cuộc gọi đến
        const callEvent = new CustomEvent('incomingCall', { detail: data });
        window.dispatchEvent(callEvent);
      });

      socket.on('call-rejected', (data: { callerId: number, roomId: string }) => {
        // Xử lý khi cuộc gọi bị từ chối
        if (user.id === data.callerId) {
          // Hiển thị thông báo từ chối cuộc gọi
          const toast = window.document.createElement('div');
          toast.textContent = 'Cuộc gọi đã bị từ chối';
          toast.style.position = 'fixed';
          toast.style.bottom = '20px';
          toast.style.right = '20px';
          toast.style.backgroundColor = '#f44336';
          toast.style.color = 'white';
          toast.style.padding = '10px 20px';
          toast.style.borderRadius = '4px';
          toast.style.zIndex = '9999';
          
          document.body.appendChild(toast);
          
          setTimeout(() => {
            document.body.removeChild(toast);
            // Chuyển về trang trước đó hoặc trang chủ
            router.back();
          }, 3000);
        }
      });

      socket.on('user-joined-call', (data: { userId: number, userName: string, roomId: string }) => {
        if (data.roomId === searchParams.get('roomID')) {
          // Hiển thị thông báo người dùng đã tham gia
          const joinedToast = document.createElement('div');
          joinedToast.textContent = `${data.userName || 'Ai đó'} đã tham gia phòng họp`;
          joinedToast.style.position = 'fixed';
          joinedToast.style.top = '20px';
          joinedToast.style.right = '20px';
          joinedToast.style.backgroundColor = '#2196f3';
          joinedToast.style.color = 'white';
          joinedToast.style.padding = '10px 20px';
          joinedToast.style.borderRadius = '4px';
          joinedToast.style.zIndex = '9999';
          
          document.body.appendChild(joinedToast);
          
          setTimeout(() => {
            document.body.removeChild(joinedToast);
          }, 3000);
        }
      });

      setSocketInstance(socket);

      return () => {
        socket.disconnect();
      };
    }
  }, [user, token, router]);

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
      
      // Kiểm tra xem roomID có đúng định dạng "room_X_Y_Z" không
      const isFromChatInvitation = roomID.startsWith('room_');
      
      // Gửi thông báo đã tham gia nếu là từ lời mời
      if (isFromChatInvitation && user && socketInstance) {
        try {
          // Trích xuất senderId từ roomID (room_senderId_receiverId_timestamp)
          const parts = roomID.split('_');
          if (parts.length >= 3) {
            const creatorId = parseInt(parts[1]);
            
            // Gửi thông báo đã tham gia cuộc gọi
            socketInstance.emit('join-call', {
              roomId: roomID,
              userId: user.id,
              userName: user.fullName || `User_${user.id}`,
              creatorId: creatorId
            });
            
            // Hiển thị thông báo đã tham gia
            const joinToast = document.createElement('div');
            joinToast.textContent = 'Bạn đã tham gia phòng họp';
            joinToast.style.position = 'fixed';
            joinToast.style.top = '20px';
            joinToast.style.right = '20px';
            joinToast.style.backgroundColor = '#4caf50';
            joinToast.style.color = 'white';
            joinToast.style.padding = '10px 20px';
            joinToast.style.borderRadius = '4px';
            joinToast.style.zIndex = '9999';
            
            document.body.appendChild(joinToast);
            
            setTimeout(() => {
              document.body.removeChild(joinToast);
            }, 3000);
          }
        } catch (error) {
          console.error("Lỗi khi gửi thông báo tham gia:", error);
        }
      }
      
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
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 10,
        layout: "Auto",
        showLayoutButton: false,
        onLeaveRoom: () => {
          // Xử lý khi người dùng rời phòng
          router.back();
        }
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

