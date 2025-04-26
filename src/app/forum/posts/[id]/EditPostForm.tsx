import { useState, useRef } from "react";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Textarea } from "@/app/page/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface EditPostFormProps {
  post: {
    id: number;
    title: string;
    content: string;
    images?: string[];
  };
  onClose: () => void;
  onUpdated: (updatedPost: { id: number; title: string; content: string; images?: string[] }) => void;
}

export default function EditPostForm({ post, onClose, onUpdated }: EditPostFormProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState<string[]>(post.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khi chọn file ảnh mới
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  // Xóa ảnh cũ (link) hoặc ảnh mới (file)
  const removeImage = (index: number, isOld: boolean) => {
    if (isOld) {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Thêm ảnh từ link
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  // Upload file lên server, trả về link ảnh (giả lập, cần thay bằng API thực tế nếu có)
  const uploadFile = async (file: File): Promise<string> => {
    // TODO: Thay thế bằng API upload thực tế nếu có
    // Hiện tại chỉ trả về URL local để demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 500);
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!token) {
      setError("Bạn cần đăng nhập để chỉnh sửa bài viết");
      setIsLoading(false);
      return;
    }
    try {
      // Upload file ảnh mới nếu có
      let uploadedImageLinks: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImageLinks = await Promise.all(selectedFiles.map(file => uploadFile(file)));
      }
      const allImages = [...images, ...uploadedImageLinks];
      const response = await fetch(`http://localhost:8081/indentity/api/blog/update/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          images: allImages
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        onUpdated({
          ...post,
          title,
          content,
          images: allImages,
        });
      } else {
        setError(data.message || "Không thể cập nhật bài viết");
      }
    } catch {
      setError("Có lỗi xảy ra khi cập nhật bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/90 border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
        <CardTitle className="text-white">Chỉnh sửa bài viết</CardTitle>
        <Button variant="ghost" className="text-white hover:text-white/80" onClick={onClose}>
          Đóng
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết"
              className="border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700">Nội dung</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung bài viết..."
              className="min-h-[150px] border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Ảnh</Label>
            {/* Ảnh cũ (link) */}
            {images.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-40 h-24 object-cover rounded border aspect-video"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100"
                      onClick={() => removeImage(idx, true)}
                      title="Xóa ảnh"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            {/* Ảnh mới (file) */}
            {previewUrls.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto mb-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-40 h-24 object-cover rounded border aspect-video"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100"
                      onClick={() => removeImage(idx, false)}
                      title="Xóa ảnh"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="flex-1 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              />
            </div>
            
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:from-[#0083B0] hover:to-[#00B4DB] text-white font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 