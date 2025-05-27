"use client";
import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/page/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/page/components/ui/card";
import { Button } from "@/app/page/components/ui/button";
import { Input } from "@/app/page/components/ui/input";
import { Label } from "@/app/page/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/page/components/ui/avatar";
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

interface Schedule {
  id: number;
  created_at: string;
  name: string;
  user_id: number;
}

interface ScheduleResponse {
  status: string;
  data: {
    schedules: Schedule[];
  };
  message: string;
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [schedulesError, setSchedulesError] = useState("");

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

        const response = await fetch(
          "http://localhost:8081/indentity/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (response.ok && data.code === 200) {
          setUser({
            email: data.result.email,
            fullName: data.result.fullName,
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

        const response = await fetch(
          "http://localhost:8081/indentity/api/friends",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSchedulesError("Bạn cần đăng nhập để xem lịch trình");
          setLoadingSchedules(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/recommend/get-schedule/?user_id=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: ScheduleResponse = await response.json();
        console.log("Schedules API Response:", data);

        if (response.ok && data.status === "success") {
          setSchedules(data.data.schedules);
        } else {
          setSchedulesError(
            data.message || "Không thể tải danh sách lịch trình"
          );
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setSchedulesError("Đã xảy ra lỗi khi tải danh sách lịch trình");
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleViewFriendProfile = (friend: Friend) => {
    if (!friend.id) return;
    // Chuyển đến trang profile của người bạn với userId
    router.push(`/forum/user/${friend.id}`);
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-[#00B4DB] to-[#0083B0] p-1 rounded-lg">
        <TabsTrigger
          value="profile"
          className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB] text-white"
        >
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="posts"
          className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB] text-white"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          className="data-[state=active]:bg-white data-[state=active]:text-[#00B4DB] text-white"
        >
          Plans
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {loading ? (
              <div className="text-center py-4">Đang tải thông tin...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 ring-2 ring-[#00B4DB]/20">
                    <AvatarImage src="/images/avatar.png" />
                    <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                      {user.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={user.fullName || ""}
                      readOnly
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      readOnly
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                {/* Friends List Section */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <Users className="mr-2 h-5 w-5 text-[#00B4DB]" />
                    Friends
                  </h3>

                  {loadingFriends ? (
                    <div className="text-center py-4">
                      Đang tải danh sách bạn bè...
                    </div>
                  ) : friendsError ? (
                    <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                      {friendsError}
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="grid gap-3">
                      {friends.map((friend, index) => (
                        <div
                          key={friend.id || index}
                          className="flex items-center p-3 rounded-lg hover:bg-[#00B4DB]/5 cursor-pointer transition-colors"
                          onClick={() => handleViewFriendProfile(friend)}
                        >
                          <Avatar className="h-10 w-10 mr-3 ring-2 ring-[#00B4DB]/20">
                            <AvatarImage src="/images/avatar.png" />
                            <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                              {friend.fullName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {friend.fullName}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Chưa có bạn bè nào
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Không có thông tin người dùng
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="posts">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
            <CardTitle className="text-white">My Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="ring-2 ring-[#00B4DB]/20">
                  <AvatarImage src="/images/avatar.png" />
                  <AvatarFallback className="bg-gradient-to-br from-[#00B4DB] to-[#0083B0] text-white">
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Exploring Ha Giang
                    </h4>
                    <Badge className="bg-[#00B4DB] text-white">Draft</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    A beautiful journey through the northern mountains...
                  </p>
                  <div className="mt-4 flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10"
                    >
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="plans">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-[#00B4DB] to-[#0083B0]">
            <CardTitle className="text-white">My Travel Plans</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {loadingSchedules ? (
                <div className="text-center py-4">Đang tải lịch trình...</div>
              ) : schedulesError ? (
                <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                  {schedulesError}
                </div>
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">
                          {schedule.name}
                        </h4>
                        <Badge className="bg-[#00B4DB] text-white">
                          Active
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-[#00B4DB]" />
                          <span>
                            {new Date(schedule.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10"
                          onClick={() => {
                            router.push(`/plan/${schedule.id}`);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#00B4DB] border-[#00B4DB] hover:bg-[#00B4DB]/10"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có lịch trình nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
