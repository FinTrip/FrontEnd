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

    const handleScreenshot = async () => {
        if (captureRef.current) {
            try {
                const canvas = await html2canvas(captureRef.current, {
                    scrollY: -window.scrollY,
                    windowWidth: document.documentElement.offsetWidth,
                    windowHeight: document.documentElement.offsetHeight,
                });
                const dataUrl = canvas.toDataURL("image/png");
                setImage(dataUrl);
                setShowScreenshot(true);
            } catch (error) {
                console.error('Error capturing screenshot:', error);
            }
        }
    };

    return (
        <div className="relative">
            <div ref={captureRef} className={className}>
                {children}
            </div>

            {/* Screenshot Button */}
            <Button 
                onClick={handleScreenshot}
                variant="outline"
                className="absolute top-0 right-0 mt-6 mr-6 gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 z-40 text-black"
            >
                <Camera className="h-4 w-4" />
                Chụp ảnh
            </Button>

            {/* Screenshot Preview Modal */}
            {showScreenshot && image && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div 
                        className="bg-white rounded-xl overflow-hidden relative w-screenshot"
                        style={{ width: '50%', maxWidth: '800px' }}
                    >
                        <div className="p-2 border-b flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-black px-2">Xem trước ảnh</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowScreenshot(false)}
                                className="hover:bg-gray-100 h-7 w-7"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto">
                            <div className="relative w-full h-[300px] mb-3">
                                <img 
                                    src={image} 
                                    alt="Screenshot" 
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = image;
                                    link.download = 'ke-hoach-du-lich.png';
                                    link.click();
                                }}
                                className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Screenshot;