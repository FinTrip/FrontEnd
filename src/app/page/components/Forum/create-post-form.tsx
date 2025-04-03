"use client";
import { useState } from "react";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Textarea } from "@/app/page/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/page/components/ui/select";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
interface CreatePost {
  title: string;
  content: string;
}
export default function CreatePostForm() {
  const [formData, setFormData] = useState<CreatePost>({
    title: "",
    content: "",
  }
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { checkAuth, token} = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    //Kiem tra dang nhap hay chua
    if (!token) {
      setError("You are not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }
    try{
      const response = await fetch(
        "http://localhost:8081/indentity/api/blog/create",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
             Authorization:`Bearer ${token}`
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create post. Please try again.");
      }
      router.push("/forum")
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    
   
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title"
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel-guide">Travel Guide</SelectItem>
                <SelectItem value="travel-tips">Travel Tips</SelectItem>
                <SelectItem value="food-dining">Food & Dining</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post content here..."
              className="min-h-[200px]"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}