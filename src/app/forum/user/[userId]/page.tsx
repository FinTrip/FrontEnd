"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/page/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Badge } from "@/app/page/components/ui/badge";
import { Button } from "@/app/page/components/ui/button";
import { User, UserPlus, UserX, Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface UserProfile {
  id?: number;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  alreadyFriend?: boolean;
  requestPending?: boolean;
  requestSent?: boolean;
}

interface UserPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  views?: number;
  likes?: number;
  images?: string[];
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingFriendAction, setProcessingFriendAction] = useState(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || Array.isArray(userId)) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Bạn cần đăng nhập để xem thông tin này");
          setLoading(false);
          return;
        }

        // Lấy thông tin user profile
        const profileResponse = await fetch(`http://localhost:8081/indentity/api/auth/users/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const profileData = await profileResponse.json();
        console.log("Profile Response:", profileData);

        if (profileResponse.ok && profileData.code === 200) {
          // Sử dụng API search để lấy trạng thái bạn bè
          const searchResponse = await fetch(`http://localhost:8081/indentity/api/friends/search?keyword=${profileData.result.email}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          const searchData = await searchResponse.json();
          console.log("Search Response:", searchData);

          if (searchResponse.ok && searchData.code === 200) {
            // Tìm user trong kết quả search
            const userResult = searchData.result.find((u: any) => u.id === parseInt(userId as string));
            
            setUser({
              id: profileData.result.id,
              email: profileData.result.email,
              fullName: profileData.result.fullName,
              avatarUrl: profileData.result.avatarUrl,
              alreadyFriend: userResult?.alreadyFriend || false,
              requestPending: userResult?.requestPending || false,
              requestSent: userResult?.requestSent || false
            });
          }
        } else {
          setError(profileData.message || "Không thể tải thông tin người dùng");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Đã xảy ra lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const fetchUserPosts = async () => {
    if (!userId || Array.isArray(userId)) return;
    
    setLoadingPosts(true);
    setPostsError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPostsError("Bạn cần đăng nhập để xem thông tin này");
        return;
      }

      const response = await fetch(`http://localhost:8081/indentity/api/blog/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
        setUserPosts(data.result || []);
      } else {
        setPostsError(data.message || "Không thể tải bài viết");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setPostsError("Đã xảy ra lỗi khi tải bài viết");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "posts") {
      fetchUserPosts();
    }
  };

  const handleFriendAction = async (action: 'add' | 'accept' | 'decline' | 'remove') => {
    if (!userId || Array.isArray(userId)) {
      toast.error("ID người dùng không hợp lệ");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }

    setProcessingFriendAction(true);
    try {
      let endpoint = '';
      let method = 'POST';
      let body: string | null = null;

      switch(action) {
        case 'add':
          endpoint = 'http://localhost:8081/indentity/api/friends/request';
          method = 'POST';
          body = JSON.stringify({ receiverId: parseInt(userId as string) });
          break;
        case 'accept':
          endpoint = `http://localhost:8081/indentity/api/friends/accept/${userId}`;
          break;
        case 'decline':
          endpoint = `http://localhost:8081/indentity/api/friends/reject/${userId}`;
          break;
        case 'remove':
          endpoint = `http://localhost:8081/indentity/api/friends/${userId}`;
          method = 'DELETE';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        switch(action) {
          case 'add':
            toast.success("Đã gửi lời mời kết bạn");
            setUser(prev => prev ? { ...prev, requestSent: true } : null);
            break;
          case 'accept':
            toast.success("Đã chấp nhận lời mời kết bạn");
            setUser(prev => prev ? { ...prev, alreadyFriend: true, requestPending: false } : null);
            break;
          case 'decline':
            toast.success("Đã từ chối lời mời kết bạn");
            setUser(prev => prev ? { ...prev, requestPending: false } : null);
            break;
          case 'remove':
            toast.success("Đã hủy kết bạn");
            setUser(prev => prev ? { ...prev, alreadyFriend: false } : null);
            break;
        }
      } else {
        toast.error(data.message || "Không thể thực hiện thao tác");
      }
    } catch (err) {
      console.error("Error performing friend action:", err);
      toast.error("Đã xảy ra lỗi khi thực hiện thao tác");
    } finally {
      setProcessingFriendAction(false);
    }
  };

  const renderFriendButton = () => {
    if (!user) return null;

    console.log("Current friend status:", {
      alreadyFriend: user.alreadyFriend,
      requestPending: user.requestPending,
      requestSent: user.requestSent
    });

    if (user.alreadyFriend) {
      return (
        <div className="flex gap-2">
          {/* <Badge variant="secondary" className="cursor-default">
            <CheckCircle className="h-3 w-3 mr-1" /> Bạn bè
          </Badge> */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleFriendAction('remove')}
            disabled={processingFriendAction}
          >
            <UserX className="h-4 w-4" />
            Hủy kết bạn
          </Button>
        </div>
      );
    }

    if (user.requestSent) {
      return (
        <Badge variant="outline" className="cursor-default text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" /> Đã gửi yêu cầu
        </Badge>
      );
    }

    if (user.requestPending) {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleFriendAction('accept')}
            disabled={processingFriendAction}
          >
            <UserPlus className="h-4 w-4" />
            Chấp nhận
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => handleFriendAction('decline')}
            disabled={processingFriendAction}
          >
            <UserX className="h-4 w-4" />
            Từ chối
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => handleFriendAction('add')}
        disabled={processingFriendAction}
      >
        <UserPlus className="h-4 w-4 mr-1"/> Thêm bạn
      </Button>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center text-gray-800">
        <User className="mr-2 h-7 w-7 text-[#00B4DB]" />
        User Profile
      </h1>
     
      <Tabs defaultValue="profile" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-[#00B4DB] to-[#0083B0] text-white">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB]">Profile</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB]">Posts</TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB]">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-gray-800">Profile Information</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
                  <Lock className="h-3 w-3" />
                  Chỉ xem
                </Badge>
                {!loading && !error && user && renderFriendButton()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Đang tải thông tin...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 ring-2 ring-[#00B4DB]/20">
                      <AvatarImage src={user.avatarUrl || "/images/avatar.png"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-gray-700">Name</Label>
                      <Input 
                        id="name" 
                        value={user.fullName || ""} 
                        readOnly 
                        className="bg-gray-50 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-gray-700">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user.email || ""} 
                        readOnly 
                        className="bg-gray-50 border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/30" 
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-2 flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Bạn chỉ có quyền xem thông tin của người dùng này
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">Không có thông tin người dùng</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-800">Bài viết của {user?.fullName || "người dùng"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingPosts ? (
                <div className="text-center py-4 text-gray-500">Đang tải bài viết...</div>
              ) : postsError ? (
                <div className="text-center py-4 text-red-500">{postsError}</div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Không có bài viết nào
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {userPosts.map((post) => (
                    <Link 
                      href={`/forum/posts/${post.id}`} 
                      key={post.id} 
                      className="block py-4 first:pt-0 last:pb-0 hover:bg-[#00B4DB]/5 transition-colors rounded-lg"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-1 text-gray-800 truncate">{post.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {post.views !== undefined && (
                              <span>• {post.views} lượt xem</span>
                            )}
                            {post.likes !== undefined && (
                              <span>• {post.likes} lượt thích</span>
                            )}
                          </div>
                        </div>
                        {post.images && post.images.length > 0 && (
                          <div className="w-16 h-16 flex-shrink-0 relative group">
                            <img 
                              src={post.images[0]}
                              alt="Ảnh bài viết"
                              className="w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-800">User Travel Plans</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-4 text-gray-500">
                Không có kế hoạch du lịch nào
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



