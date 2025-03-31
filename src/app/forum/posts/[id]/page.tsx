import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Avatar, AvatarFallback } from "@/app/page/components/ui/avatar"
import { Separator } from "@/app/page/components/ui/separator"
import { Textarea } from "@/app/page/components/ui/textarea"
import { MapPin, Calendar, User, ThumbsUp, MessageSquare, Share2, Bookmark, ArrowLeft } from "lucide-react"

export default function PostPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the post data based on the ID
  const postId = Number.parseInt(params.id)
  const post = samplePosts.find((p) => p.id === postId) || samplePosts[0]

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
              <div className="aspect-video rounded-md overflow-hidden mb-4">
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> {post.destination}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.dates}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Thích ({post.likes})</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Bình luận ({post.comments})</span>
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
                <p>{post.description}</p>
                <p>
                  Chuyến đi của tôi đến {post.destination} là một trải nghiệm tuyệt vời mà tôi muốn chia sẻ với mọi
                  người. Từ những cảnh đẹp thiên nhiên đến văn hóa địa phương phong phú, mọi thứ đều khiến tôi ngạc
                  nhiên và thích thú.
                </p>
                <p>
                  Tôi đã có cơ hội thưởng thức ẩm thực địa phương, tham gia các hoạt động văn hóa và gặp gỡ những người
                  dân địa phương thân thiện. Đây thực sự là một chuyến đi đáng nhớ mà tôi sẽ không bao giờ quên.
                </p>

                <h3 className="text-xl font-semibold mt-6">Lời khuyên cho người muốn đến {post.destination}</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Nên đi vào mùa đẹp nhất trong năm để có trải nghiệm tốt nhất</li>
                  <li>Chuẩn bị đầy đủ đồ dùng cá nhân và thuốc men cần thiết</li>
                  <li>Tìm hiểu về văn hóa và phong tục địa phương trước khi đến</li>
                  <li>Đặt phòng và vé máy bay sớm để có giá tốt</li>
                  <li>Mang theo máy ảnh để ghi lại những khoảnh khắc đẹp</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Bình luận ({post.comments})</CardTitle>
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

              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>{comment.authorInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{comment.author}</h4>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                    <div className="flex gap-4 mt-2">
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        Thích
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        Trả lời
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Bài viết liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {samplePosts
                .filter((p) => p.id !== postId)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link href={`/forum/posts/${relatedPost.id}`} key={relatedPost.id} className="block">
                    <div className="flex gap-3 group">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={relatedPost.image || "/placeholder.svg"}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {relatedPost.destination}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
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

const samplePosts = [
  {
    id: 1,
    title: "Khám phá Hội An - Thành phố cổ đầy màu sắc",
    destination: "Hội An, Việt Nam",
    dates: "10/03/2023 - 15/03/2023",
    description:
      "Hội An là một thành phố cổ nằm ở tỉnh Quảng Nam, Việt Nam. Phố cổ Hội An được UNESCO công nhận là Di sản Văn hóa Thế giới. Tôi đã có 5 ngày tuyệt vời khám phá những con phố đầy màu sắc, thưởng thức ẩm thực địa phương và tham gia các hoạt động văn hóa truyền thống. Đèn lồng rực rỡ, những ngôi nhà cổ và không khí yên bình đã tạo nên một trải nghiệm khó quên. Tôi đặc biệt thích thú với việc tham gia các lớp học nấu ăn và may đo quần áo truyền thống.",
    author: "Minh Tuấn",
    image: "/placeholder.svg?height=400&width=800",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "Hành trình khám phá Sapa trong mùa lúa chín",
    destination: "Sapa, Lào Cai",
    dates: "05/09/2023 - 10/09/2023",
    description:
      "Sapa trong mùa lúa chín là một trải nghiệm không thể quên. Những thửa ruộng bậc thang vàng óng ánh dưới ánh mặt trời, không khí trong lành và con người thân thiện đã tạo nên một chuyến đi tuyệt vời. Tôi đã có cơ hội trekking qua các bản làng, giao lưu với đồng bào dân tộc và chụp những bức ảnh đẹp mê hồn.",
    author: "Thu Hà",
    image: "/placeholder.svg?height=400&width=800",
    likes: 36,
    comments: 12,
  },
  {
    id: 3,
    title: "Phú Quốc - Thiên đường biển đảo",
    destination: "Phú Quốc, Kiên Giang",
    dates: "20/07/2023 - 25/07/2023",
    description:
      "Phú Quốc với những bãi biển cát trắng mịn, nước biển trong xanh và hải sản tươi ngon đã mang đến cho tôi một kỳ nghỉ tuyệt vời. Tôi đã thăm Vinpearl Safari, khám phá Hòn Thơm qua cáp treo dài nhất thế giới và thưởng thức những món ăn đặc sản như nước mắm Phú Quốc và hải sản tươi sống.",
    author: "Hoàng Nam",
    image: "/placeholder.svg?height=400&width=800",
    likes: 42,
    comments: 15,
  },
  {
    id: 4,
    title: "Khám phá vẻ đẹp hoang sơ của Mũi Né",
    destination: "Mũi Né, Bình Thuận",
    dates: "15/04/2023 - 20/04/2023",
    description:
      "Mũi Né không chỉ có những bãi biển đẹp mà còn có những đồi cát vàng, đồi cát trắng và suối Tiên độc đáo. Tôi đã có cơ hội trải nghiệm trượt cát, ngắm bình minh trên biển và thưởng thức hải sản tươi ngon. Đây thực sự là một điểm đến lý tưởng cho những ai yêu thích thiên nhiên và muốn tránh xa sự ồn ào của thành phố.",
    author: "Lan Anh",
    image: "/placeholder.svg?height=400&width=800",
    likes: 18,
    comments: 7,
  },
  {
    id: 5,
    title: "Hà Nội - 36 phố phường",
    destination: "Hà Nội, Việt Nam",
    dates: "01/11/2023 - 05/11/2023",
    description:
      "Hà Nội với 36 phố phường cổ kính, những công trình kiến trúc lịch sử và nền ẩm thực phong phú đã mang đến cho tôi những trải nghiệm văn hóa đáng nhớ. Tôi đã thăm Văn Miếu - Quốc Tử Giám, Hồ Hoàn Kiếm, Hoàng Thành Thăng Long và thưởng thức những món ăn đặc sản như phở, bún chả và cà phê trứng.",
    author: "Quang Minh",
    image: "/placeholder.svg?height=400&width=800",
    likes: 29,
    comments: 11,
  },
  {
    id: 6,
    title: "Đà Lạt - Thành phố ngàn hoa",
    destination: "Đà Lạt, Lâm Đồng",
    dates: "10/12/2023 - 15/12/2023",
    description:
      "Đà Lạt với khí hậu mát mẻ, những đồi thông xanh ngát và những vườn hoa rực rỡ đã mang đến cho tôi một kỳ nghỉ thư giãn tuyệt vời. Tôi đã thăm Hồ Xuân Hương, Thung lũng Tình Yêu, Đồi Robin và thưởng thức những món ăn đặc sản như bánh tráng nướng, lẩu bò và cà phê Đà Lạt.",
    author: "Thanh Thảo",
    image: "/placeholder.svg?height=400&width=800",
    likes: 33,
    comments: 9,
  },
]

const comments = [
  {
    id: 1,
    author: "Thu Hà",
    authorInitials: "TH",
    date: "2 giờ trước",
    content: "Bài viết rất hay và chi tiết! Tôi cũng đã từng đến Hội An và rất thích nơi này.",
  },
  {
    id: 2,
    author: "Hoàng Nam",
    authorInitials: "HN",
    date: "5 giờ trước",
    content: "Cảm ơn bạn đã chia sẻ những trải nghiệm tuyệt vời. Tôi sẽ tham khảo bài viết này cho chuyến đi sắp tới.",
  },
  {
    id: 3,
    author: "Lan Anh",
    authorInitials: "LA",
    date: "1 ngày trước",
    content: "Những bức ảnh rất đẹp! Bạn có thể chia sẻ thêm về các địa điểm ăn uống ngon không?",
  },
] 