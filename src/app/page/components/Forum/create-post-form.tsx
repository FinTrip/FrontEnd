"use client";
import { useState } from "react";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Textarea } from "@/app/page/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

interface CreatePost {
  title: string;
  content: string;
}

interface PostResponse {
  code: number;
  message: string;
  result: {
    createdAt: string;
    images: string[];
    authorName: string;
    id: number;
    title: string;
    content: string;
  };
}

interface CreatePostFormProps {
  onPostCreated?: (newPost: PostResponse['result']) => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ onPostCreated, onCancel }: CreatePostFormProps) {
  const [formData, setFormData] = useState<CreatePost>({
    title: "",
    content: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  // Xử lý khi chọn files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Giới hạn số lượng ảnh tối đa
      if (files.length > 5) {
        setError("Chỉ được chọn tối đa 5 ảnh");
        return;
      }

      // Kiểm tra kích thước file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(`${oversizedFiles.length} ảnh có kích thước lớn hơn 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
        return;
      }
      
      setSelectedFiles(files);

      // Tạo preview URLs cho các files đã chọn
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Xóa một ảnh khỏi danh sách đã chọn
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Hàm kiểm tra xem form có hợp lệ không
  const validateForm = () => {
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return false;
    }

    // Allow posts without images
    if (selectedFiles.length > 5) {
      setError("Vui lòng chọn tối đa 5 ảnh");
      return false;
    }

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return false;
    }

    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Kiểm tra form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      
      selectedFiles.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const response = await fetch(
        "http://localhost:8081/indentity/api/blog/create",
        {
          method: "POST",
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText || 'No error details available'}`);
        }
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data: PostResponse;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed response:', data);

      if (data.code === 200) {
        // Cleanup preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        
        // Call the callback with the new post data
        if (onPostCreated) {
          onPostCreated(data.result);
        }
        
        // Reset form
        setFormData({ title: "", content: "" });
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Close form if onCancel is provided
        if (onCancel) {
          onCancel();
        }
        
        toast.success("Bài viết đã được tạo thành công!");
      } else {
        throw new Error(data.message || "Failed to create post");
      }

    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/90 border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
        <CardTitle className="text-white">Tạo bài viết mới</CardTitle>
        {onCancel && (
          <Button variant="ghost" className="text-white hover:text-white/80" onClick={onCancel}>
            Đóng
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700">Tiêu đề</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề bài viết"
              className="border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700 text-base font-medium">Nội dung</Label>
            <div className="border rounded-md focus-within:ring-2 focus-within:ring-[#00B4DB]/30 focus-within:border-[#00B4DB] overflow-hidden">
              <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">Soạn nội dung bài viết</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-gray-500 hover:text-[#00B4DB] text-xs"
                  onClick={() => {
                    // Open a temporary fullscreen editor
                    const content = document.getElementById('content') as HTMLTextAreaElement;
                    if (content) {
                      content.style.height = '70vh';
                      content.focus();
                    }
                  }}
                >
                  Mở rộng
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Viết nội dung bài viết tại đây...

Nhấn Enter để xuống dòng và tạo đoạn văn mới.

Tạo nhiều đoạn văn riêng biệt để bài viết có cấu trúc rõ ràng và dễ đọc hơn.

Bạn có thể kéo góc dưới bên phải để mở rộng ô soạn thảo."
                className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y text-base"
                required
                onFocus={(e) => {
                  // Auto expand when focused
                  e.currentTarget.style.height = '350px';
                }}
                onBlur={(e) => {
                  // Return to default size when not focused
                  if (e.currentTarget.value.trim().length < 100) {
                    e.currentTarget.style.height = '300px';
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>
                Sử dụng phím Enter để xuống dòng và tạo đoạn văn mới, giúp bài viết dễ đọc hơn.
              </p>
              <p>
                {formData.content.length} ký tự
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-gray-700">Ảnh (không bắt buộc)</Label>
            <Input
              id="images"
              type="file"
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
            />
            <p className="text-xs text-gray-500">
              Bạn có thể chọn từ 1 đến 5 ảnh. Mỗi ảnh không vượt quá 5MB.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="pb-2">
              <Label className="block mb-2 text-gray-700">Xem trước hình ảnh</Label>
              <div className="relative">
                <div className="flex overflow-x-auto space-x-2 pb-2 hide-scrollbar">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <div className="relative w-24 h-24 md:w-32 md:h-32 border rounded overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          fill
                          style={{objectFit: 'cover'}}
                          className="rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                {selectedFiles.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    ← Cuộn để xem thêm hình ảnh →
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:from-[#0083B0] hover:to-[#00B4DB] text-white font-medium shadow-lg hover:shadow-xl transition-all py-2 md:py-3" 
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo..." : "Tạo bài viết"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}