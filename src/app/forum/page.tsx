import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { MapPin, Calendar, User, ThumbsUp, MessageSquare } from "lucide-react"

export default function ForumHome() {
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
        {samplePosts.map((post) => (
          <Link href={`/forum/posts/${post.id}`} key={post.id} className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="aspect-video rounded-md overflow-hidden mb-2">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {post.destination}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.dates}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments} bình luận</span>
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

const samplePosts = [
  {
    id: 1,
    title: "Khám phá Hội An - Thành phố cổ đầy màu sắc",
    destination: "Hội An, Việt Nam",
    dates: "10/03/2023 - 15/03/2023",
    description:
      "Hội An là một thành phố cổ nằm ở tỉnh Quảng Nam, Việt Nam. Phố cổ Hội An được UNESCO công nhận là Di sản Văn hóa Thế giới. Tôi đã có 5 ngày tuyệt vời khám phá những con phố đầy màu sắc, thưởng thức ẩm thực địa phương và tham gia các hoạt động văn hóa truyền thống.",
    author: "Minh Tuấn",
    image: "/placeholder.svg?height=200&width=400",
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
    image: "/placeholder.svg?height=200&width=400",
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
    image: "/placeholder.svg?height=200&width=400",
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
    image: "/placeholder.svg?height=200&width=400",
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
    image: "/placeholder.svg?height=200&width=400",
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
    image: "/placeholder.svg?height=200&width=400",
    likes: 33,
    comments: 14,
  },
] 