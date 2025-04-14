"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Avatar, AvatarFallback } from "@/app/page/components/ui/avatar"
import { Separator } from "@/app/page/components/ui/separator"
import { Textarea } from "@/app/page/components/ui/textarea"
import { MapPin, Calendar, User, ThumbsUp, MessageSquare, Share2, Bookmark, ArrowLeft, Eye, Loader2, X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"

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

interface Comment {
  id: number
  content: string
  authorName: string
  createdAt: string
  replies?: Reply[]
}

interface Reply {
  id: number
  content: string
  authorName: string
  createdAt: string
  replies?: Reply[]
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newReply, setNewReply] = useState<{ [key: number]: string }>({})
  const [newNestedReply, setNewNestedReply] = useState<{ [key: number]: string }>({})
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyingToReply, setReplyingToReply] = useState<{ commentId: number, replyId: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { token, user } = useAuth()

  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [isLoadingLikeStatus, setIsLoadingLikeStatus] = useState<boolean>(false)
  const [isProcessingLike, setIsProcessingLike] = useState<boolean>(false)

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8081/indentity/api/comment/post/${params.id}`)
      const data = await response.json()
      
      if (data.code === 200) {
        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          data.result.map(async (comment: Comment) => {
            try {
              const repliesResponse = await fetch(`http://localhost:8081/indentity/api/comment/${comment.id}/replies`)
              const repliesData = await repliesResponse.json()
              if (repliesData.code === 200) {
                // Sort replies by creation time (newest first)
                const sortedReplies = repliesData.result.sort((a: Reply, b: Reply) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                return {
                  ...comment,
                  replies: sortedReplies
                }
              }
              return comment
            } catch (err) {
              console.error("Error fetching replies:", err)
              return comment
            }
          })
        )
        // Sort comments by creation time (newest first)
        const sortedComments = commentsWithReplies.sort((a: Comment, b: Comment) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setComments(sortedComments)
      } else {
        setError(data.message || "Không thể tải bình luận")
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    }
  }

  const fetchLikeStatus = async () => {
    if (!token) {
      setIsLiked(false)
      return
    }
    setIsLoadingLikeStatus(true)
    try {
      const response = await fetch(`http://localhost:8081/indentity/api/blog/${params.id}/like-status`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          setIsLiked(false);
        } else {
          console.error('Failed to fetch like status with status:', response.status);
          setIsLiked(false); 
        }
      } else {
        const data = await response.json();
        if (data.code === 200 && typeof data.result?.isLiked === 'boolean') {
          setIsLiked(data.result.isLiked);
        } else {
          console.error('Invalid response format for like status:', data);
          setIsLiked(false);
        }
      }
    } catch (err) {
      console.error("Error fetching like status:", err)
      setIsLiked(false)
    } finally {
      setIsLoadingLikeStatus(false)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      let postData: Post | null = null;
      try {
        setIsLoading(true)
        setError(""); 
        const response = await fetch(`http://localhost:8081/indentity/api/blog/post/${params.id}`)
        const data = await response.json()
        
        if (data.code === 200 && data.result) {
          postData = data.result;
          setPost(postData)
          setLikeCount(postData?.likes || 0)
          await fetchComments()
        } else {
          setError(data.message || "Không thể tải bài viết")
          setPost(null);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải bài viết")
        console.error("Error fetching post:", err)
        setPost(null);
      } finally {
        setIsLoading(false)
        if (postData) {
          await fetchLikeStatus();
        }
      }
    }

    fetchPost()
  }, [params.id, token])

  const handleCommentSubmit = async () => {
    if (!token) {
      setError("Bạn cần đăng nhập để bình luận")
      return
    }

    if (!newComment.trim()) {
      setError("Vui lòng nhập nội dung bình luận")
      return
    }

    try {
      const response = await fetch("http://localhost:8081/indentity/api/comment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          postId: params.id
        })
      })

      const data = await response.json()
      if (data.code === 200) {
        setNewComment("")
        setError("")
        await fetchComments()
      } else {
        setError(data.message || "Không thể đăng bình luận")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng bình luận")
      console.error("Error posting comment:", err)
    }
  }

  const handleReplySubmit = async (commentId: number) => {
    if (!token) {
      setError("Bạn cần đăng nhập để trả lời")
      return
    }

    const replyContent = newReply[commentId]
    if (!replyContent?.trim()) {
      setError("Vui lòng nhập nội dung trả lời")
      return
    }

    try {
      const response = await fetch("http://localhost:8081/indentity/api/comment/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          commentId: commentId,
          content: replyContent
        })
      })

      const data = await response.json()
      if (data.code === 200) {
        setNewReply({ ...newReply, [commentId]: "" })
        setReplyingTo(null)
        setError("")
        await fetchComments()
      } else {
        setError(data.message || "Không thể đăng trả lời")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng trả lời")
      console.error("Error posting reply:", err)
    }
  }

  const handleNestedReplySubmit = async (commentId: number, replyId: number) => {
    if (!token) {
      setError("Bạn cần đăng nhập để trả lời")
      return
    }

    const replyContent = newNestedReply[replyId]
    if (!replyContent?.trim()) {
      setError("Vui lòng nhập nội dung trả lời")
      return
    }

    try {
      const response = await fetch("http://localhost:8081/indentity/api/comment/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          commentId: commentId,
          content: replyContent,
          parentReplyId: replyId
        })
      })

      const data = await response.json()
      if (data.code === 200) {
        setNewNestedReply({ ...newNestedReply, [replyId]: "" })
        setReplyingToReply(null)
        setError("")
        await fetchComments()
      } else {
        setError(data.message || "Không thể đăng trả lời")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng trả lời")
      console.error("Error posting nested reply:", err)
    }
  }

  const handleLikeToggle = async () => {
    if (!token) {
      setError("Bạn cần đăng nhập để thích bài viết")
      return
    }
    console.log("Token being used for like request:", token);
    
    console.log("Current isLiked state before toggle:", isLiked);

    if (isProcessingLike || isLoadingLikeStatus || isLiked === null) {
      console.log("Like toggle prevented. States:", { isProcessingLike, isLoadingLikeStatus, isLiked });
      return;
    }

    setIsProcessingLike(true)
    const originalLikedState = isLiked;
    const originalLikeCount = likeCount;

    const newOptimisticLikedState = !isLiked;
    setIsLiked(newOptimisticLikedState);
    setLikeCount(prev => newOptimisticLikedState ? prev + 1 : prev - 1);
    setError("")

    try {
      const response = await fetch(`http://localhost:8081/indentity/api/blog/${params.id}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
         let errorMessage = "Thao tác thất bại";
         try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
         } catch { /* Ignore if response is not JSON */ }
         throw new Error(errorMessage);
      }

      const data = await response.json()
      if (data.code === 200 && typeof data.result?.liked === 'boolean') {
         const actualLikedState = data.result.liked;
         if (actualLikedState !== newOptimisticLikedState) {
             setIsLiked(actualLikedState);
             setLikeCount(originalLikedState === actualLikedState 
                           ? originalLikeCount 
                           : actualLikedState ? originalLikeCount + 1 : originalLikeCount - 1);
         }
      } else {
         throw new Error(data.message || "Phản hồi không hợp lệ từ máy chủ")
      }
    } catch (err) {
      setIsLiked(originalLikedState);
      setLikeCount(originalLikeCount);
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi thích bài viết";
      setError(errorMessage);
      console.error("Error toggling like:", err);
    } finally {
      setIsProcessingLike(false)
    }
  }

  const handleFocusCommentTextarea = () => {
    commentTextareaRef.current?.focus();
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views || 0} Lượt xem</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1 sm:gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={handleLikeToggle}
                    disabled={isProcessingLike || isLoadingLikeStatus || isLiked === null}
                    title={isLiked === null ? "Đang tải trạng thái..." : isLiked ? "Bỏ thích" : "Thích"}
                  >
                    {isProcessingLike ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>Thích ({likeCount})</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={handleFocusCommentTextarea}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Bình luận ({comments.length})</span>
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
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {post.images.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video cursor-pointer group"
                        onClick={() => setSelectedImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Ảnh ${index + 1} của bài viết`}
                          className="rounded-lg object-cover w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p>{post.content}</p>
              </div>

              {/* Lightbox */}
              {selectedImage && (
                <div 
                  className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-5xl w-full">
                    <button
                      className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                      }}
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <img
                      src={selectedImage}
                      alt="Ảnh chi tiết"
                      className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Author Section */}
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {post.authorName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{post.authorName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Đăng vào {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Bình luận ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div ref={commentSectionRef} className="flex gap-4 pt-4">
                <Avatar>
                  <AvatarFallback>{user?.fullName ? user.fullName[0].toUpperCase() : '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    ref={commentTextareaRef}
                    placeholder="Viết bình luận của bạn..." 
                    className="mb-2"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleCommentSubmit}>Đăng bình luận</Button>
                </div>
              </div>

              <Separator />

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-4 border-b border-gray-200 pb-4 mb-4 last:border-0">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.authorName}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="mt-1">{comment.content}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            Trả lời
                          </Button>
                        </div>
                      </div>

                      <div className="ml-12 space-y-4">
                        {replyingTo === comment.id && (
                          <div className="flex gap-4 border-l-2 border-gray-200 pl-4">
                            <Avatar>
                              <AvatarFallback>TH</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea 
                                placeholder="Viết trả lời của bạn..." 
                                className="mb-2"
                                value={newReply[comment.id] || ""}
                                onChange={(e) => setNewReply({ ...newReply, [comment.id]: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <Button onClick={() => handleReplySubmit(comment.id)}>Đăng trả lời</Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex gap-4">
                                  <Avatar>
                                    <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{reply.authorName}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString('vi-VN', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="mt-1">{reply.content}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="mt-2"
                                      onClick={() => setReplyingToReply(
                                        replyingToReply?.replyId === reply.id ? null : { commentId: comment.id, replyId: reply.id }
                                      )}
                                    >
                                      Trả lời
                                    </Button>
                                  </div>
                                </div>

                                {replyingToReply?.replyId === reply.id && (
                                  <div className="ml-12 flex gap-4 mt-4">
                                    <Avatar>
                                      <AvatarFallback>TH</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <Textarea 
                                        placeholder="Viết trả lời của bạn..." 
                                        className="mb-2"
                                        value={newNestedReply[reply.id] || ""}
                                        onChange={(e) => setNewNestedReply({ ...newNestedReply, [reply.id]: e.target.value })}
                                      />
                                      <div className="flex gap-2">
                                        <Button onClick={() => handleNestedReplySubmit(comment.id, reply.id)}>
                                          Đăng trả lời
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setReplyingToReply(null)}
                                        >
                                          Hủy
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {reply.replies && reply.replies.length > 0 && (
                                  <div className="ml-12 space-y-4 mt-4">
                                    {reply.replies.map((nestedReply) => (
                                      <div key={nestedReply.id} className="flex gap-4">
                                        <Avatar>
                                          <AvatarFallback>{nestedReply.authorName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{nestedReply.authorName}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(nestedReply.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <p className="mt-1">{nestedReply.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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