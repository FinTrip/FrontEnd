// FrontEnd/src/app/page/components/CallVideo/VideoCall.tsx
"use client";
import { useEffect, useRef, useState } from 'react';
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
    ZegoUIKitPrebuilt: ZegoUIKitPrebuilt;
  }
}

export default function VideoCall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'prompt'|'granted'|'denied'|null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noDeviceDetected, setNoDeviceDetected] = useState(false);

  // Auto-trigger permission request after auth check
  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated && permissionStatus === null && !noDeviceDetected) {
      requestPermissions();
    }
  }, [hasCheckedAuth, isAuthenticated, permissionStatus, noDeviceDetected]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    console.log("Auth check started - isAuthenticated:", isAuthenticated, "token:", !!token);
    
    const authCheckTimer = setTimeout(() => {
      setHasCheckedAuth(true);
      
      if (!isAuthenticated || !token) {
        console.log("Not authenticated, redirecting to login");
        router.push('/page/auth/login');
      } else {
        console.log("User authenticated:", user?.fullName);
      }
    }, 1500);

    return () => clearTimeout(authCheckTimer);
  }, [isAuthenticated, token, router, user]);

  // Kiểm tra thiết bị
  const checkDeviceAvailability = async () => {
    try {
      // Kiểm tra xem có thiết bị nào không
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      
      console.log("Device check:", { hasVideoInput, hasAudioInput, devices });
      
      if (!hasVideoInput && !hasAudioInput) {
        setNoDeviceDetected(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking devices:", error);
      return false;
    }
  };

  // Hiện thực giao diện yêu cầu quyền
  const requestPermissions = async () => {
    try {
      console.log("Requesting media permissions...");
      setIsLoading(true);
      setError(null);
      
      // Kiểm tra thiết bị trước
      const hasDevices = await checkDeviceAvailability();
      if (!hasDevices) {
        setError("Không tìm thấy camera hoặc microphone trên thiết bị của bạn. Vui lòng kết nối thiết bị và thử lại.");
        setIsLoading(false);
        return;
      }
      
      // Thử yêu cầu quyền với cả audio và video
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // Dừng stream sau khi đã có quyền
        stream.getTracks().forEach(track => track.stop());
        setPermissionStatus('granted');
        
        // Delay a bit before loading Zego Cloud
        setTimeout(() => {
          loadZegoCloud();
        }, 500);
      } catch (firstError: any) {
        console.warn("Failed with both audio and video:", firstError);
        
        // Nếu lỗi là NotFoundError, thử với chỉ audio
        if (firstError.name === 'NotFoundError') {
          try {
            console.log("Trying with audio only...");
            const audioStream = await navigator.mediaDevices.getUserMedia({ 
              video: false, 
              audio: true 
            });
            
            audioStream.getTracks().forEach(track => track.stop());
            setPermissionStatus('granted');
            
            // Audio-only mode warning
            console.log("Audio-only mode activated");
            alert("Không tìm thấy camera. Bạn sẽ tham gia cuộc gọi chỉ với microphone.");
            
            setTimeout(() => {
              loadZegoCloud(true);
            }, 500);
          } catch (audioError) {
            console.error("Failed with audio only too:", audioError);
            handlePermissionError(firstError);
          }
        } else {
          handlePermissionError(firstError);
        }
      }
    } catch (error: any) {
      handlePermissionError(error);
    }
  };
  
  // Xử lý lỗi quyền truy cập
  const handlePermissionError = (error: any) => {
    console.error('Error accessing media devices:', error);
    setIsLoading(false);
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      setPermissionStatus('denied');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      setNoDeviceDetected(true);
      setError("Không tìm thấy camera hoặc microphone. Vui lòng kết nối thiết bị và thử lại.");
    } else {
      setError(`Lỗi khi truy cập thiết bị: ${error.message || 'Không xác định'}`);
    }
  };

  // Khởi tạo video call mà không có camera/mic
  const joinWithoutDevices = () => {
    setIsLoading(true);
    setPermissionStatus('granted');
    loadZegoCloud(true, true);
  };

  // Khởi tạo Zego Cloud
  const loadZegoCloud = async (audioOnly = false, viewOnly = false) => {
    try {
      console.log("Loading Zego Cloud script...", { audioOnly, viewOnly });
      
      // Kiểm tra xem script đã được tải chưa
      if (window.ZegoUIKitPrebuilt) {
        console.log("Zego UI Kit already loaded, initializing directly");
        initializeVideoCall(audioOnly, viewOnly);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log("Zego Cloud script loaded successfully");
        // Delay a bit before initializing
        setTimeout(() => {
          initializeVideoCall(audioOnly, viewOnly);
        }, 500);
      };

      script.onerror = (e) => {
        console.error('Failed to load Zego Cloud script', e);
        setError('Không thể tải script video call. Vui lòng kiểm tra kết nối internet và thử lại.');
        setIsLoading(false);
      };
    } catch (error: any) {
      console.error('Error loading Zego Cloud:', error);
      setError(`Lỗi khi khởi tạo video call: ${error.message || 'Không xác định'}`);
      setIsLoading(false);
    }
  };

  // Khởi tạo video call
  const initializeVideoCall = (audioOnly = false, viewOnly = false) => {
    try {
      console.log("Initializing video call...", { audioOnly, viewOnly });
      
      if (!window.ZegoUIKitPrebuilt) {
        throw new Error("ZegoUIKitPrebuilt not loaded");
      }
      
      const roomID = searchParams.get('roomID') || Math.floor(Math.random() * 10000).toString();
      const userID = user?.id?.toString() || Math.floor(Math.random() * 10000).toString();
      const userName = user?.fullName || `Người dùng ${userID}`;
      
      console.log(`Room ID: ${roomID}, User ID: ${userID}, User Name: ${userName}`);
      
      const appID = 2004678343;
      const serverSecret = "de287b9ef2e8713784a20bc59b114639";
      
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      console.log("Token generated successfully");
      
      const zp = window.ZegoUIKitPrebuilt.create(kitToken);
      
      const roomConfig = {
        container: rootRef.current,
        sharedLinks: [{
          name: 'Liên kết phòng',
          url: `${window.location.origin}/page/components/callvideo/videocall?roomID=${roomID}`,
        }],
        scenario: {
          mode: window.ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: !viewOnly,
        turnOnCameraWhenJoining: !audioOnly && !viewOnly,
        showMyCameraToggleButton: !viewOnly,
        showMyMicrophoneToggleButton: !viewOnly,
        showAudioVideoSettingsButton: !viewOnly,
        showScreenSharingButton: !viewOnly,
        showTextChat: true,
        showUserList: true,
        maxUsers: 4,
        layout: "Auto",
        showLayoutButton: true,
      };
      
      console.log("Joining room with config:", roomConfig);
      zp.joinRoom(roomConfig);
      
      console.log(`Video call initialized with Room ID: ${roomID}`);
      console.log(`User joined as: ${userName}`);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error initializing video call:', error);
      setError(`Không thể khởi tạo cuộc gọi: ${error.message || 'Lỗi không xác định'}`);
      setIsLoading(false);
    }
  };

  // Màn hình lỗi thiết bị không tìm thấy
  if (noDeviceDetected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thiết bị</h2>
            <p className="text-gray-600 mb-4">Không tìm thấy camera hoặc microphone trên thiết bị của bạn.</p>
            
            <div className="space-y-3 mt-6">
              <button 
                onClick={joinWithoutDevices} 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Tham gia chỉ để xem và nghe
              </button>
              
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Thử lại sau khi kết nối thiết bị
              </button>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Lưu ý: Nếu bạn tham gia mà không có thiết bị, bạn chỉ có thể xem và nghe người khác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể kết nối</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Thử lại
            </button>
            
            <button 
              onClick={joinWithoutDevices} 
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Tham gia chỉ để xem và nghe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình loading
  if (!hasCheckedAuth || (isLoading && permissionStatus === 'granted')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Đang khởi tạo video call...</div>
        </div>
      </div>
    );
  }

  // Màn hình yêu cầu quyền truy cập
  if (permissionStatus !== 'granted' && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Call</h2>
            <p className="text-gray-600">
              Để sử dụng tính năng video call, FinTrip cần quyền truy cập vào camera và microphone của bạn.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Camera</h3>
                <p className="text-sm text-blue-600">Để hiển thị video của bạn cho người khác</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Microphone</h3>
                <p className="text-sm text-blue-600">Để người khác có thể nghe bạn nói</p>
              </div>
            </div>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
              <p className="font-medium mb-2">Quyền truy cập bị từ chối</p>
              <p className="text-sm">
                Bạn đã từ chối quyền truy cập camera hoặc microphone. Vui lòng làm theo các bước sau:
              </p>
              <ol className="text-sm mt-2 list-decimal list-inside">
                <li>Nhấn vào biểu tượng <span className="inline-block px-1">🔒</span> hoặc <span className="inline-block px-1">🎥</span> trong thanh địa chỉ</li>
                <li>Chọn "Cho phép" đối với camera và microphone</li>
                <li>Tải lại trang</li>
              </ol>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
              >
                Tải lại trang
              </button>
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            <button
              onClick={requestPermissions}
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white font-medium transition duration-200 ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang xử lý...
                </>
              ) : (
                'Cho phép truy cập thiết bị'
              )}
            </button>
            
            <button
              onClick={joinWithoutDevices}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 transition duration-200"
            >
              Tham gia chỉ để xem và nghe
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            FinTrip sẽ chỉ sử dụng quyền truy cập trong thời gian bạn tham gia cuộc gọi
          </p>
        </div>
      </div>
    );
  }

  // Màn hình video call
  return (
    <div 
      ref={rootRef} 
      className="w-screen h-screen"
    />
  );
}