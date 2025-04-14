"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Separator } from "@/app/page/components/ui/separator"
import { Calendar, User, ThumbsUp, MessageSquare, Eye, Flame } from "lucide-react"
import { useEffect, useState } from "react"

interface Post {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
  views: number | null
  likes: number | null
  images?: string[]
}

interface HotPost extends Post { 
  hotScore: number;
  commentsCount: number | null;
}

export default function ForumHome() {
  const [posts, setPosts] = useState<Post[]>([])
  const [hotPosts, setHotPosts] = useState<HotPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [hotPostsError, setHotPostsError] = useState("")

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      setError("")
      setHotPostsError("")

      try {
        const [postsResponse, hotPostsResponse] = await Promise.all([
          fetch("http://localhost:8081/indentity/api/blog/all"),
          fetch("http://localhost:8081/indentity/api/blog/hot-trend")
        ]);

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          if (postsData.code === 200) {
            setPosts(postsData.result || []);
          } else {
            setError(postsData.message || "Không thể tải danh sách bài viết");
          }
        } else {
           setError(`Lỗi tải danh sách bài viết: ${postsResponse.status}`);
        }

        if (hotPostsResponse.ok) {
          const hotPostsData = await hotPostsResponse.json();
          if (hotPostsData.code === 200) {
            setHotPosts(hotPostsData.result || []);
          } else {
            setHotPostsError(hotPostsData.message || "Không thể tải bài viết nổi bật");
          }
        } else {
            setHotPostsError(`Lỗi tải bài viết nổi bật: ${hotPostsResponse.status}`);
        }

      } catch (err) {
        console.error("Error fetching forum data:", err)
        setError("Có lỗi mạng xảy ra khi tải dữ liệu diễn đàn.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const HotPostItem = ({ post, index }: { post: HotPost, index: number }) => (
    <Link href={`/forum/posts/${post.id}`} className="block group">
      <div className="flex items-center gap-4 p-4 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-md transition-colors">
         <span className="text-lg font-medium text-muted-foreground w-6 text-center">{index + 1}</span>
         <Separator orientation="vertical" className="h-8" />
         <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm group-hover:text-primary truncate mb-1" title={post.title}>{post.title}</h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate shrink mr-3"><User className="h-3.5 w-3.5 flex-shrink-0" />{post.authorName}</span>
              <div className="flex items-center gap-3.5 flex-shrink-0">
                 <span className="flex items-center gap-1" title="Lượt thích"><ThumbsUp className="h-3.5 w-3.5" />{post.likes || 0}</span>
                 <span className="flex items-center gap-1" title="Lượt xem"><Eye className="h-3.5 w-3.5" />{post.views || 0}</span>
                 <span className="flex items-center gap-1" title="Bình luận"><MessageSquare className="h-3.5 w-3.5" />{post.commentsCount || 0}</span>
              </div>
            </div>
         </div>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">FinTrip Forum</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Chia sẻ và khám phá những trải nghiệm du lịch tuyệt vời từ cộng đồng.</p>
        <Link href="/forum/create-post">
          <Button size="lg"> <MessageSquare className="mr-2 h-5 w-5"/> Tạo bài viết mới</Button>
        </Link>
      </header>

      {!isLoading && hotPosts.length > 0 && (
        <section className="mb-16 bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/30 dark:bg-muted/20">
             <h2 className="text-2xl font-semibold flex items-center gap-2.5">
               <Flame className="text-orange-500 h-6 w-6" /> Bài viết nổi bật
             </h2>
          </div>
          {hotPostsError && <p className="text-red-500 text-sm p-4">{hotPostsError}</p>} 
          <div className="divide-y divide-border">
            {hotPosts.map((post, index) => (
              <HotPostItem key={`hot-${post.id}`} post={post} index={index} />
            ))}
          </div>
        </section>
      )}
      {!isLoading && hotPosts.length === 0 && hotPostsError && !error && (
           <p className="text-center text-red-500 mb-8">{hotPostsError}</p>
      )}

      <section>
         <h2 className="text-3xl font-semibold mb-8">Bài viết mới nhất</h2>
          
         {isLoading && (
             <div className="text-center py-10">Đang tải bài viết...</div>
         )}
         {!isLoading && error && (
             <div className="text-center text-red-500 py-10">{error}</div>
         )}

         {!isLoading && !error && posts.length === 0 && (
            <p className="text-center text-muted-foreground py-10">Chưa có bài viết nào.</p>
         )}
         {!isLoading && !error && posts.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {posts.map((post) => (
                  <Link href={`/forum/posts/${post.id}`} key={post.id} className="block group">
                    <Card className="h-full border dark:border-muted/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden rounded-lg group-hover:-translate-y-1">
                      <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 dark:from-muted/30 dark:to-muted/10">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={post.images[0]}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <MessageSquare className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="p-5 pb-3">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary mb-1" title={post.title}>{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs pt-1">
                          <User className="h-3.5 w-3.5" /> {post.authorName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 flex-grow">
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground mb-4">
                          {post.content.length > 130 ? post.content.substring(0, 130) + "..." : post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t p-4 bg-muted/30 dark:bg-muted/20">
                        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5" title="Lượt thích">
                              <ThumbsUp className="h-4 w-4" />
                              {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1.5" title="Lượt xem">
                              <Eye className="h-4 w-4" />
                              {post.views || 0}
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5" title="Bình luận">
                            <MessageSquare className="h-4 w-4" />
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
         )}
      </section>
    </div>
  )
} 