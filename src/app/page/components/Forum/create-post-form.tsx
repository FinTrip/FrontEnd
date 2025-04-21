"use client";
import { useState } from "react";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Textarea } from "@/app/page/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { toast } from "react-hot-toast";

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
  const router = useRouter();
  const { token } = useAuth();

  // Xử lý khi chọn files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);

      // Tạo preview URLs cho các files đã chọn
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Xóa một ảnh khỏi danh sách đã chọn
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!token) {
      setError("You are not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
        <CardTitle className="text-white">Create New Post</CardTitle>
        {onCancel && (
          <Button variant="ghost" className="text-white hover:text-white/80" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title"
              className="border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post content here..."
              className="min-h-[200px] border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-gray-700">Images</Label>
            <Input
              id="images"
              type="file"
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              required
              className="cursor-pointer border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
            />
          </div>

          {/* Preview ảnh đã chọn */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0] hover:from-[#0083B0] hover:to-[#00B4DB] text-white font-medium shadow-lg hover:shadow-xl transition-all" 
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}