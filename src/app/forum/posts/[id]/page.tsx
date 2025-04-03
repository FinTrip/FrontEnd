"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Avatar, AvatarFallback } from "@/app/page/components/ui/avatar"
import { Separator } from "@/app/page/components/ui/separator"
import { Textarea } from "@/app/page/components/ui/textarea"
import { MapPin, Calendar, User, ThumbsUp, MessageSquare, Share2, Bookmark, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

interface Post {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:8081/indentity/api/blog/post/${params.id}`)
        const data = await response.json()
        
        if (data.code === 200) {
          setPost(data.result)
        } else {
          setError(data.message || "Không thể tải bài viết")
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải bài viết")
        console.error("Error fetching post:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Đang tải bài viết...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error || "Không tìm thấy bài viết"}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Link
        href="/forum"
        className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại trang chủ</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Đà Nẵng
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Thích (0)</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Bình luận (0)</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>Chia sẻ</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>Lưu</span>
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <p>{post.content}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Bình luận (0)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>TH</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea placeholder="Viết bình luận của bạn..." className="mb-2" />
                  <Button>Đăng bình luận</Button>
                </div>
              </div>

              <Separator />

              <div className="text-center text-muted-foreground">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Bài viết liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                Chưa có bài viết liên quan
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Xem thêm bài viết
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 