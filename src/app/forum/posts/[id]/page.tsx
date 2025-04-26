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
import EditPostForm from "./EditPostForm"

interface Post {
  id: number
  title: string
  content: string
  authorId: number
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                // Sort replies by creation time (oldest first)
                const sortedReplies = repliesData.result.sort((a: Reply, b: Reply) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
        className="flex items-center gap-2 text-gray-500 hover:text-[#00B4DB] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại trang chủ</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-3xl text-gray-800">
                {post.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-base text-[#00B4DB]">
                <MapPin className="h-4 w-4" /> Đà Nẵng
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-[#00B4DB]" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/forum/user/${post.authorId}`} className="flex items-center gap-1 hover:text-[#00B4DB] transition-colors">
                  <User className="h-4 w-4 text-[#00B4DB]" />
                  <span>{post.authorName}</span>
                </Link>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-[#00B4DB]" />
                  <span>{post.views || 0} Lượt xem</span>
                </div>
                {/* Nút chỉnh sửa chỉ hiện với tác giả */}
                {user?.id === post.authorId && (
                  <Button onClick={() => setShowEditModal(true)} className="ml-auto bg-[#00B4DB] text-white">Chỉnh sửa</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1 sm:gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-[#00B4DB] hover:text-[#0083B0]' : 'text-gray-500 hover:text-[#00B4DB]'}`}
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-gray-500 hover:text-[#00B4DB]" 
                    onClick={handleFocusCommentTextarea}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Bình luận ({comments.length})</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  {/* <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500 hover:text-[#00B4DB]">
                    <Share2 className="h-4 w-4" />
                    <span>Chia sẻ</span>
                  </Button> */}
                  {/* <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500 hover:text-[#00B4DB]">
                    <Bookmark className="h-4 w-4" />
                    <span>Lưu</span>
                  </Button> */}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                {post.images && post.images.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {post.images.slice(0, 2).map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-video cursor-pointer group"
                          onClick={() => {
                            setImageViewerImages(post.images!);
                            setCurrentImageIndex(index);
                            setShowImageViewer(true);
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Ảnh ${index + 1} của bài viết`}
                            className="rounded-lg object-cover w-full h-full shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {post.images.length > 2 && (
                      <div className="mt-2 text-center">
                        <Button variant="outline" className="text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10" onClick={() => { setImageViewerImages(post.images!); setCurrentImageIndex(0); setShowImageViewer(true); }}>
                          Xem thêm {post.images.length - 2} ảnh
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
              </div>

              {/* Author Section */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-[#00B4DB]/20">
                    <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white text-lg">
                      {post.authorName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/forum/user/${post.authorId}`} className="hover:text-[#00B4DB] transition-colors">
                      <h3 className="font-semibold text-gray-800">{post.authorName}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">
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

          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-800">Bình luận ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div ref={commentSectionRef} className="flex gap-4">
                <Avatar className="ring-2 ring-[#00B4DB]/20">
                  <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                    {user?.fullName ? user.fullName[0].toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    ref={commentTextareaRef}
                    placeholder="Viết bình luận của bạn..." 
                    className="mb-2 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button 
                    onClick={handleCommentSubmit}
                    className="bg-[#00B4DB] hover:bg-[#0083B0] text-white"
                  >
                    Đăng bình luận
                  </Button>
                </div>
              </div>

              <Separator />

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
              )}

              {comments.length === 0 ? (
                <div className="text-center text-gray-500">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-4 border-b border-gray-100 pb-4 mb-4 last:border-0">
                      <div className="flex gap-4">
                        <Avatar className="ring-2 ring-[#00B4DB]/20">
                          <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                            {comment.authorName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/forum/user/${comment.id}`} className="font-medium text-gray-800 hover:text-[#00B4DB] transition-colors">
                              {comment.authorName}
                            </Link>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700">{comment.content}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-gray-500 hover:text-[#00B4DB]"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            Trả lời
                          </Button>
                        </div>
                      </div>

                      <div className="ml-12 space-y-4">
                        {replyingTo === comment.id && (
                          <div className="flex gap-4 border-l-2 border-gray-200 pl-4">
                            <Avatar className="ring-2 ring-[#00B4DB]/20">
                              <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                                {user?.fullName ? user.fullName[0].toUpperCase() : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea 
                                placeholder="Viết trả lời của bạn..." 
                                className="mb-2 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
                                value={newReply[comment.id] || ""}
                                onChange={(e) => setNewReply({ ...newReply, [comment.id]: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleReplySubmit(comment.id)}
                                  className="bg-[#00B4DB] hover:bg-[#0083B0] text-white"
                                >
                                  Đăng trả lời
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setReplyingTo(null)}
                                  className="text-gray-500 hover:text-[#00B4DB] border-gray-200"
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
                                  <Avatar className="ring-2 ring-[#00B4DB]/20">
                                    <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                                      {reply.authorName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Link href={`/forum/user/${reply.id}`} className="font-medium text-gray-800 hover:text-[#00B4DB] transition-colors">
                                        {reply.authorName}
                                      </Link>
                                      <span className="text-sm text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString('vi-VN', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-gray-700">{reply.content}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="mt-2 text-gray-500 hover:text-[#00B4DB]"
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
                                    <Avatar className="ring-2 ring-[#00B4DB]/20">
                                      <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                                        {user?.fullName ? user.fullName[0].toUpperCase() : '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <Textarea 
                                        placeholder="Viết trả lời của bạn..." 
                                        className="mb-2 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30"
                                        value={newNestedReply[reply.id] || ""}
                                        onChange={(e) => setNewNestedReply({ ...newNestedReply, [reply.id]: e.target.value })}
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          onClick={() => handleNestedReplySubmit(comment.id, reply.id)}
                                          className="bg-[#00B4DB] hover:bg-[#0083B0] text-white"
                                        >
                                          Đăng trả lời
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setReplyingToReply(null)}
                                          className="text-gray-500 hover:text-[#00B4DB] border-gray-200"
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
                                        <Avatar className="ring-2 ring-[#00B4DB]/20">
                                          <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                                            {nestedReply.authorName[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <Link href={`/forum/user/${nestedReply.id}`} className="font-medium text-gray-800 hover:text-[#00B4DB] transition-colors">
                                              {nestedReply.authorName}
                                            </Link>
                                            <span className="text-sm text-gray-500">
                                              {new Date(nestedReply.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <p className="mt-1 text-gray-700">{nestedReply.content}</p>
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
          <Card className="sticky top-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-800">Bài viết liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="text-center text-gray-500">
                Chưa có bài viết liên quan
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10">
                Xem thêm bài viết
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal chỉnh sửa bài viết */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <EditPostForm
                post={post}
                onClose={() => setShowEditModal(false)}
                onUpdated={(updatedPost) => {
                  setPost(updatedPost);
                  setShowEditModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal xem ảnh chi tiết */}
      {showImageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button className="absolute top-4 right-4 text-white text-2xl z-10" onClick={() => setShowImageViewer(false)}>×</button>
          <div className="flex items-center gap-4 w-full max-w-2xl px-4">
            <button
              className="text-white text-3xl px-2 py-1 bg-black/30 rounded-full disabled:opacity-30"
              onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
              disabled={currentImageIndex === 0}
              aria-label="Trước"
            >&#8592;</button>
            <img
              src={imageViewerImages[currentImageIndex]}
              alt={`Ảnh ${currentImageIndex + 1}`}
              className="rounded-lg object-contain max-h-[80vh] max-w-full mx-auto"
              style={{ background: '#eee' }}
            />
            <button
              className="text-white text-3xl px-2 py-1 bg-black/30 rounded-full disabled:opacity-30"
              onClick={() => setCurrentImageIndex(i => Math.min(imageViewerImages.length - 1, i + 1))}
              disabled={currentImageIndex === imageViewerImages.length - 1}
              aria-label="Sau"
            >&#8594;</button>
          </div>
          <div className="absolute bottom-6 left-0 right-0 text-center text-white">
            {currentImageIndex + 1} / {imageViewerImages.length}
          </div>
        </div>
      )}
    </div>
  )
} 