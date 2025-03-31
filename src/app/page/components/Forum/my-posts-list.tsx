"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Button } from "@/app/page/components/ui/button";
import { Badge } from "@/app/page/components/ui/badge";
import { Calendar, MapPin, ThumbsUp, MessageCircle, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const mockPosts = [
  {
    id: 1,
    title: "Exploring Ha Giang",
    destination: "Ha Giang, Vietnam",
    date: "March 15, 2024",
    status: "published",
    likes: 42,
    comments: 12,
    views: 156,
  },
  {
    id: 2,
    title: "Hidden Gems in Da Lat",
    destination: "Da Lat, Vietnam",
    date: "March 14, 2024",
    status: "draft",
    likes: 0,
    comments: 0,
    views: 0,
  },
  {
    id: 3,
    title: "Food Tour in Hanoi",
    destination: "Hanoi, Vietnam",
    date: "March 13, 2024",
    status: "published",
    likes: 56,
    comments: 15,
    views: 234,
  },
];

export default function MyPostsList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
        <Button asChild>
          <Link href="/forum/create-post">Create New Post</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {mockPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/forum/posts/${post.id}`}>
                    <CardTitle className="text-xl hover:underline">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{post.destination}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/forum/posts/${post.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/forum/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 