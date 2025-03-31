"use client";
import { useState } from "react";
import { Button } from "@/app/page/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Textarea } from "@/app/page/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/page/components/ui/select";

export default function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    content: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
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

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Enter destination"
            />
          </div>

          <div className="space-y-2">
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
          </div>

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