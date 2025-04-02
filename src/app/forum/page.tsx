"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { MapPin, Calendar, User, ThumbsUp, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"

interface Post {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
}

export default function ForumHome() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:8081/indentity/api/blog/all")
        const data = await response.json()
        
        if (data.code === 200) {
          setPosts(data.result)
        } else {
          setError(data.message || "Không thể tải bài viết")
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải bài viết")
        console.error("Error fetching posts:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Đang tải bài viết...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">FinTrip Forum</h1>
        <p className="text-muted-foreground mb-6">Chia sẻ và khám phá những trải nghiệm du lịch tuyệt vời</p>
        <div className="flex justify-center">
          <Link href="/forum/create-post">
            <Button size="lg">Tạo bài viết mới</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link href={`/forum/posts/${post.id}`} key={post.id} className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Đà Nẵng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.authorName}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>0 bình luận</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 