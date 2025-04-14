'use client';

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/app/page/components/ui/button"
import { Download, Camera, X } from "lucide-react"
import "./home/plan.css";

interface ScreenshotProps {
    children: React.ReactNode;
    className?: string;
}

const Screenshot: React.FC<ScreenshotProps> = ({ children, className }) => {
    const captureRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [showScreenshot, setShowScreenshot] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleScreenshot = async () => {
        if (captureRef.current) {
            try {
                setIsCapturing(true);
                
                // Lưu vị trí cuộn hiện tại để khôi phục sau
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;
                
                // Lấy element cần chụp 
                const element = captureRef.current;
                
                // Lấy kích thước thực tế của element (bao gồm cả phần không hiển thị)
                const fullWidth = element.scrollWidth;
                const fullHeight = element.scrollHeight;
                
                console.log(`Capturing full page: ${fullWidth}x${fullHeight}`);
                
                // Cài đặt canvas với kích thước đầy đủ
                const canvas = document.createElement('canvas');
                canvas.width = fullWidth;
                canvas.height = fullHeight;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    throw new Error('Không thể tạo canvas context');
                }
                
                // Chụp từng phần của trang và ghép lại
                const chunkSize = 1000; // Chiều cao mỗi lần chụp
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                if (!tempCtx) {
                    throw new Error('Không thể tạo temporary canvas context');
                }
                
                tempCanvas.width = fullWidth;
                tempCanvas.height = chunkSize;
                
                // Lưu lại style ban đầu
                const originalStyles = {
                    position: element.style.position,
                    width: element.style.width,
                    height: element.style.height,
                    overflow: element.style.overflow
                };
                
                // Sửa style để đảm bảo chụp đúng
                element.style.overflow = 'visible';
                
                for (let y = 0; y < fullHeight; y += chunkSize) {
                    // Điều chỉnh vị trí cuộn
                    window.scrollTo(0, y);
                    
                    // Đợi cho render xong
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Chụp phần đang hiển thị
                    const chunkHeight = Math.min(chunkSize, fullHeight - y);
                    tempCanvas.height = chunkHeight;
                    
                    await html2canvas(element, {
                        canvas: tempCanvas,
                        height: chunkHeight,
                        width: fullWidth,
                        scrollY: -y,
                        scrollX: 0,
                        windowHeight: chunkHeight,
                        windowWidth: fullWidth,
                        x: 0,
                        y: y,
                        allowTaint: true,
                        useCORS: true,
                        logging: true,
                        backgroundColor: null
                    });
                    
                    // Vẽ phần đã chụp vào canvas chính
                    ctx.drawImage(tempCanvas, 0, y);
                    
                    // Cập nhật tiến độ
                    console.log(`Captured section ${y}px to ${y + chunkHeight}px of ${fullHeight}px`);
                }
                
                // Khôi phục style ban đầu
                element.style.position = originalStyles.position;
                element.style.width = originalStyles.width;
                element.style.height = originalStyles.height;
                element.style.overflow = originalStyles.overflow;
                
                // Khôi phục vị trí cuộn
                window.scrollTo(scrollX, scrollY);
                
                // Chuyển canvas thành ảnh
                const dataUrl = canvas.toDataURL("image/png");
                setImage(dataUrl);
                setShowScreenshot(true);
                
                console.log("Full page screenshot completed!");
            } catch (error) {
                console.error('Error capturing screenshot:', error);
                alert('Có lỗi khi chụp ảnh toàn trang. Vui lòng thử lại!');
            } finally {
                setIsCapturing(false);
            }
        }
    };

    // Phương pháp thay thế đơn giản hơn nếu phương pháp trên không hoạt động
    const handleSimpleScreenshot = async () => {
        if (captureRef.current) {
            try {
                setIsCapturing(true);
                
                const element = captureRef.current;
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    logging: true,
                    backgroundColor: null,
                    // Các thiết lập quan trọng để chụp toàn bộ trang
                    scrollY: 0, 
                    scrollX: 0,
                    scale: window.devicePixelRatio,
                    height: element.scrollHeight,
                    width: element.scrollWidth,
                    windowHeight: element.scrollHeight,
                });
                
                const dataUrl = canvas.toDataURL("image/png");
                setImage(dataUrl);
                setShowScreenshot(true);
            } catch (error) {
                console.error('Error capturing simple screenshot:', error);
                alert('Có lỗi khi chụp ảnh. Vui lòng thử lại!');
            } finally {
                setIsCapturing(false);
            }
        }
    };

    return (
        <div className="relative">
            <div ref={captureRef} className={className}>
                {children}
            </div>

            {/* Screenshot Buttons */}
            <div className="absolute top-0 right-0 mt-6 mr-6 flex flex-col gap-2 z-40">
                <Button 
                    onClick={handleScreenshot}
                    variant="outline"
                    className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-black"
                    disabled={isCapturing}
                >
                    {isCapturing ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                            Đang chụp...
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            Chụp toàn trang
                        </>
                    )}
                </Button>
                
                <Button 
                    onClick={handleSimpleScreenshot}
                    variant="outline"
                    className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-black"
                    disabled={isCapturing}
                >
                    <Camera className="h-4 w-4" />
                    Chụp đơn giản
                </Button>
            </div>

            {/* Screenshot Preview Modal */}
            {showScreenshot && image && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div 
                        className="bg-white rounded-xl overflow-hidden relative"
                        style={{ width: '90%', maxWidth: '1200px', maxHeight: '90vh' }}
                    >
                        <div className="p-3 border-b flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-black px-2">Xem trước ảnh toàn trang</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowScreenshot(false)}
                                className="hover:bg-gray-100 h-7 w-7"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 flex-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                            <div className="relative w-full bg-gray-100 rounded-lg">
                                <img 
                                    src={image} 
                                    alt="Screenshot" 
                                    className="w-full object-contain rounded-lg"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = image;
                                        link.download = 'ke-hoach-du-lich-full.png';
                                        link.click();
                                    }}
                                    className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    Tải xuống
                                </Button>
                                <Button
                                    onClick={() => setShowScreenshot(false)}
                                    variant="outline"
                                    className="flex-1 gap-2 text-sm"
                                >
                                    <X className="h-4 w-4" />
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Screenshot;