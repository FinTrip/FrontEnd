"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/page/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/page/components/ui/card";
import { Button } from "@/app/page/components/ui/button";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar";
import { Badge } from "@/app/page/components/ui/badge";
import { Calendar, MapPin, Clock, Users, User } from "lucide-react";
import { useRouter } from "next/navigation";


interface UserProfile {
  email?: string;
  fullName?: string;
}


interface Friend {
  id?: number;
  fullName?: string;
  email?: string;
}


export default function UserProfileTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState("");
  const [friendsError, setFriendsError] = useState("");


  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Bạn cần đăng nhập để xem thông tin này");
          setLoading(false);
          return;
        }


        const response = await fetch("http://localhost:8081/indentity/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });


        const data = await response.json();
        console.log("API Response:", data);
       
        if (response.ok && data.code === 200) {
          setUser({
            email: data.result.email,
            fullName: data.result.fullName
          });
        } else {
          setError(data.message || "Không thể tải thông tin người dùng");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Đã xảy ra lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };


    fetchUserProfile();
  }, []);


  useEffect(() => {
    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFriendsError("Bạn cần đăng nhập để xem danh sách bạn bè");
          setLoadingFriends(false);
          return;
        }


        const response = await fetch("http://localhost:8081/indentity/api/friends", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });


        const data = await response.json();
        console.log("Friends API Response:", data);
       
        if (response.ok && data.code === 200) {
          setFriends(data.result || []);
        } else {
          setFriendsError(data.message || "Không thể tải danh sách bạn bè");
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
        setFriendsError("Đã xảy ra lỗi khi tải danh sách bạn bè");
      } finally {
        setLoadingFriends(false);
      }
    };


    // Load friends when component mounts
    fetchFriends();
  }, []);


  const handleViewFriendProfile = (friend: Friend) => {
    if (!friend.id) return;
    // Chuyển đến trang profile của người bạn với userId
    router.push(`/forum/user/${friend.id}`);
  };


  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="plans">Plans</TabsTrigger>
      </TabsList>


      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Đang tải thông tin...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/images/avatar.png" />
                    <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={user.fullName || ""} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email || ""} readOnly />
                  </div>
                </div>


                {/* Friends List Section */}
                <div className="mt-8 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Friends
                  </h3>
                 
                  {loadingFriends ? (
                    <div className="text-center py-4">Đang tải danh sách bạn bè...</div>
                  ) : friendsError ? (
                    <div className="text-center py-4 text-red-500">{friendsError}</div>
                  ) : friends.length > 0 ? (
                    <div className="grid gap-3">
                      {friends.map((friend, index) => (
                        <div
                          key={friend.id || index}
                          className="flex items-center p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleViewFriendProfile(friend)}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src="/images/avatar.png" />
                            <AvatarFallback>{friend.fullName?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{friend.fullName}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">Chưa có bạn bè nào</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">Không có thông tin người dùng</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>


      <TabsContent value="posts">
        <Card>
          <CardHeader>
            <CardTitle>My Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src="/images/avatar.png" />
                  <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Exploring Ha Giang</h4>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A beautiful journey through the northern mountains...
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>


      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <CardTitle>My Travel Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Weekend in Da Nang</h4>
                    <Badge>Active</Badge>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Mar 15-17, 2024</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>Da Nang, Vietnam</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>3 days</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      <span>2 participants</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
