"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/page/components/ui/card"
import { Separator } from "@/app/page/components/ui/separator"
import { Calendar, User, ThumbsUp, MessageSquare, Eye, Flame, UserPlus, Users, Search, MoreHorizontal, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar"
import { Input } from "@/app/page/components/ui/input"
import { Badge } from "@/app/page/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/page/components/ui/dropdown-menu"
import { debounce } from 'lodash';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import React from "react"
import { toast } from 'sonner'; // Corrected import if it's a package
import { BoxChat } from "@/app/page/components/Forum/message"
import { CreateGroupDialog } from "./components/create-group-dialog"
import { AddMembersDialog } from "./components/add-members-dialog"

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

interface Friend {
  id: number;
  fullName: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'away';
  mutualFriends?: number;
  lastActive?: string;
  isFavorite?: boolean;
}

interface FriendRequest {
  id: number;
  senderId: number;
  senderFullName: string;
  senderAvatar?: string;
  requestDate: string;
  mutualFriends?: number;
}

// Interface cho kết quả tìm kiếm bạn bè
interface SearchResultUser {
  id: number;
  email: string;
  fullName: string;
  alreadyFriend: boolean;
  requestPending: boolean;
  requestSent?: boolean;
}

// Define interfaces for raw API data
interface ApiFriendData {
  id: string;
  fullName: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  mutualFriends?: number;
  lastActive?: string;
  isFavorite?: boolean;
}

interface ApiRequestData {
  id: string;
  senderId?: string; // Allow for potential missing senderId if nested
  sender?: { // Allow for nested sender object
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  senderFullName?: string; // Allow for direct fullName
  senderAvatarUrl?: string; // Allow for direct avatar
  requestTime: string;
  mutualFriends?: number;
}

// Thêm interface cho tin nhắn nhóm
interface GroupMessage {
  id: number;
  groupId: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  avatarUrl?: string;
  isAdmin?: boolean;
}

// Thêm interface cho response API của nhóm
interface ApiGroupData {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
  avatarUrl?: string;
  isAdmin?: boolean;
}

// Thêm interface cho response tin nhắn từ API
interface ChatRoomMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    fullName: string;
    email: string;
  };
}

// Thêm interface cho response API private message
interface PrivateMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    fullName: string;
    email: string;
  };
  receiver: {
    id: number;
    fullName: string;
    email: string;
  };
}

export default function ForumHome() {
  const [posts, setPosts] = useState<Post[]>([])
  const [hotPosts, setHotPosts] = useState<HotPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hotPostsError, setHotPostsError] = useState("")
  
  // State cho chức năng bạn bè
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultUser[]>([]); // State cho kết quả tìm kiếm
  const [isSearching, setIsSearching] = useState(false); // State cho trạng thái đang tìm kiếm
  const [searchError, setSearchError] = useState<string | null>(null); // State cho lỗi tìm kiếm

  // State cho nhóm
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // State cho tin nhắn nhóm
  const [groupMessages, setGroupMessages] = useState<{ [key: number]: GroupMessage[] }>({});

  const { token } = useAuth(); // Lấy token
  
  const [selectedChat, setSelectedChat] = useState<Friend | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<Group | null>(null);
  const [activeChat, setActiveChat] = useState<'friend' | 'group' | null>(null);
  
  // Thêm state cho dialog thêm thành viên
  const [addMembersDialogState, setAddMembersDialogState] = useState<{
    isOpen: boolean;
    roomId: number | null;
  }>({
    isOpen: false,
    roomId: null
  });

  // Thêm state để lưu interval ID
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Thêm state để lưu tin nhắn cá nhân
  const [privateMessages, setPrivateMessages] = useState<{ [key: number]: PrivateMessageResponse[] }>({});

  // --- Define fetch functions ---
  const fetchFriends = useCallback(async () => {
    if (!token) {
      setIsLoadingFriends(false);
      return;
    }
    setIsLoadingFriends(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8081/indentity/api/friends", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: Không thể tải danh sách bạn bè`);
      }
      const data = await response.json();
      if (data.code === 200 && Array.isArray(data.result)) {
        // Map using ApiFriendData type
        setFriends(data.result.map((friend: ApiFriendData) => ({ 
          id: friend.id,
          fullName: friend.fullName || 'Người dùng ẩn danh', // Provide fallback
          avatarUrl: friend.avatarUrl || '/placeholder-user.jpg',
          status: friend.status || 'offline',
          mutualFriends: friend.mutualFriends || 0,
          lastActive: friend.lastActive || '',
          isFavorite: friend.isFavorite || false
        })) || []);
      } else {
        console.error("API Error fetching friends:", data.message);
        setFriends([]);
      }
    } catch (err) {
      console.error("Network Error fetching friends:", err);
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [token]);

  const fetchFriendRequests = useCallback(async () => {
    if (!token) {
      setIsLoadingRequests(false);
      return;
    }
    setIsLoadingRequests(true);
    try {
      const requestsResponse = await fetch("http://localhost:8081/indentity/api/friends/requests", {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!requestsResponse.ok) {
        throw new Error(`Lỗi ${requestsResponse.status}: Không thể tải danh sách yêu cầu`);
      }
      const requestsData = await requestsResponse.json();
      if (requestsData.code === 200 && Array.isArray(requestsData.result)) {
        // Map using ApiRequestData type
        setFriendRequests(requestsData.result.map((req: ApiRequestData) => ({
          id: req.id,
          // Handle both direct properties and nested sender object
          senderId: req.sender?.id ?? req.senderId ?? 'unknown',
          senderFullName: req.sender?.fullName ?? req.senderFullName ?? 'Người dùng ẩn danh',
          senderAvatarUrl: req.sender?.avatarUrl ?? req.senderAvatarUrl ?? '/placeholder-user.jpg',
          requestDate: req.requestTime ?? new Date().toISOString(), // Use current date as fallback
          mutualFriends: req.mutualFriends ?? 0
        })) || []);
      } else {
          console.error("API Error fetching friend requests:", requestsData.message);
          setFriendRequests([]);
      }
    } catch (requestsErr) {
        console.error("Network Error fetching friend requests:", requestsErr);
        setFriendRequests([]);
    } finally {
        setIsLoadingRequests(false);
    }
  }, [token]);

  // Thêm hàm fetchGroups
  const fetchGroups = useCallback(async () => {
    if (!token) {
      setIsLoadingGroups(false);
      return;
    }
    
    setIsLoadingGroups(true);
    try {
      const response = await fetch("http://localhost:8081/indentity/api/chatrooms/my-rooms", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: Không thể tải danh sách nhóm`);
      }
      
      const data = await response.json();
      if (data.code === 200 && Array.isArray(data.result)) {
        setGroups(data.result.map((group: ApiGroupData) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: group.memberCount || 0,
          avatarUrl: group.avatarUrl,
          isAdmin: group.isAdmin || false
        })));
      } else {
        console.error("API Error fetching groups:", data.message);
        setGroups([]);
      }
    } catch (err) {
      console.error("Network Error fetching groups:", err);
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [token]);

  // Sửa lại hàm fetchGroupMessages để sắp xếp tin nhắn
  const fetchGroupMessages = async (roomId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8081/indentity/api/chatrooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
        // Chuyển đổi và sắp xếp tin nhắn theo thời gian tăng dần
        const formattedMessages = data.result
          .map((msg: ChatRoomMessageResponse) => ({
            id: msg.id,
            groupId: roomId,
            content: msg.content,
            senderId: msg.sender.id,
            senderName: msg.sender.fullName,
            createdAt: msg.createdAt
          }))
          .sort((a: GroupMessage, b: GroupMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setGroupMessages(prev => ({
          ...prev,
          [roomId]: formattedMessages
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn nhóm:", error);
      toast.error("Không thể tải tin nhắn nhóm");
    }
  };

  // Thêm hàm fetchPrivateMessages
  const fetchPrivateMessages = async (userId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8081/indentity/api/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
        // Format và sắp xếp tin nhắn theo thời gian
        const formattedMessages = data.result.map((msg: PrivateMessageResponse) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender.id,
          senderName: msg.sender.fullName,
          createdAt: msg.createdAt
        })).sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setPrivateMessages(prev => ({
          ...prev,
          [userId]: formattedMessages
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn cá nhân:", error);
      toast.error("Không thể tải tin nhắn. Vui lòng thử lại sau.");
    }
  };

  // Fetch data ban đầu (bài viết, bạn bè, lời mời)
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      setError("")
      setHotPostsError("")

      try {
        // Fetch posts và hot posts (giữ nguyên)
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

        // Fetch friends, friend requests và groups
        if (token) {
          await Promise.all([
            fetchFriends(),
            fetchFriendRequests(),
            fetchGroups()
          ]);
        } else {
           setIsLoadingFriends(false);
           setIsLoadingRequests(false);
           setIsLoadingGroups(false);
           setFriends([]);
           setFriendRequests([]);
           setGroups([]);
        }

      } catch (err) {
        console.error("Error fetching forum data:", err)
        setError("Có lỗi mạng xảy ra khi tải dữ liệu diễn đàn.")
        setIsLoadingFriends(false);
        setIsLoadingRequests(false);
        setIsLoadingGroups(false);
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [token, fetchFriends, fetchFriendRequests, fetchGroups])

  // Hàm gọi API tìm kiếm bạn bè
  const fetchSearchResults = async (keyword: string) => {
    if (!keyword.trim() || !token) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`http://localhost:8081/indentity/api/friends/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        setSearchResults(data.result || []);
      } else {
        setSearchResults([]);
        setSearchError(data.message || 'Lỗi tìm kiếm bạn bè.');
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm bạn bè:', error);
      setSearchResults([]);
      setSearchError('Không thể kết nối đến máy chủ tìm kiếm.');
    } finally {
      setIsSearching(false);
    }
  };

  // Sử dụng useCallback và debounce để tối ưu việc gọi API
  const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), [token]);

  // useEffect để theo dõi searchQuery và gọi hàm tìm kiếm đã debounce
  useEffect(() => {
    debouncedSearch(searchQuery);
    // Hủy debounce khi component unmount hoặc searchQuery thay đổi
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);


  // Hàm xử lý chấp nhận lời mời kết bạn
  const handleAcceptRequest = useCallback(async (requestId: number) => {
    if (!token) return toast.error("Vui lòng đăng nhập.");

    const requestToAccept = friendRequests.find(req => req.id === requestId);
    if (!requestToAccept) {
      console.error("FE: Không tìm thấy lời mời ID:", requestId, "trong state.");
      toast.warning("Không tìm thấy lời mời. Đang tải lại...");
      fetchFriendRequests(); // Call the defined function
      return;
    }
    const senderId = requestToAccept.senderId;
    if (!senderId) {
        console.error("FE: Không tìm thấy senderId trong lời mời:", requestToAccept);
        toast.error("Lỗi: Không tìm thấy ID người gửi.");
        return;
    }

    try {
      console.log(`FE: Chấp nhận lời mời ID: ${requestId} từ sender ID: ${senderId}`);
      const response = await fetch(`http://localhost:8081/indentity/api/friends/accept/${requestId
      }`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        toast.success("Đã chấp nhận lời mời kết bạn!");
        // --- Refresh data after success ---
        fetchFriendRequests(); // Call the defined function
        fetchFriends(); // Call the defined function
      } else {
        toast.error(data.message || "Không thể chấp nhận lời mời.");
        console.error("FE: Lỗi chấp nhận (API):", data, "Status:", response.status);
        // Optionally refresh requests even on failure if state might be inconsistent
        if (response.status === 404 || response.status === 400) {
           fetchFriendRequests(); // Call the defined function
        }
      }
    } catch (error) {
      console.error("FE: Lỗi chấp nhận (Fetch):", error);
      toast.error("Lỗi mạng khi chấp nhận lời mời.");
    }
  }, [token, friendRequests, fetchFriends, fetchFriendRequests]); // Add fetch functions to deps

  // Hàm xử lý từ chối lời mời kết bạn
  const handleDeclineRequest = useCallback(async (requestId: number) => {
    if (!token) return toast.error("Vui lòng đăng nhập.");
    try {
      console.log(`FE: Từ chối lời mời ID: ${requestId}`);
      const response = await fetch(`http://localhost:8081/indentity/api/friends/reject/${requestId}`, {
          method: 'POST', // or DELETE if your API uses DELETE
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
          toast.success("Đã từ chối lời mời kết bạn.");
          // --- Refresh data after success ---
          fetchFriendRequests(); // Call the defined function
      } else {
          toast.error(data.message || "Không thể từ chối lời mời.");
          console.error("FE: Lỗi từ chối (API):", data, "Status:", response.status);
           // Optionally refresh requests even on failure
          if (response.status === 404 || response.status === 400) {
              fetchFriendRequests(); // Call the defined function
          }
      }
    } catch (error) {
        console.error("FE: Lỗi từ chối (Fetch):", error);
        toast.error("Lỗi mạng khi từ chối lời mời.");
    }
  }, [token, fetchFriendRequests]); // Add fetch function to deps
  
  // Hàm xử lý hủy kết bạn
  const handleRemoveFriend = useCallback(async (friendId: number) => {
    const proceedRemove = async () => {
        if (!token) return toast.error("Vui lòng đăng nhập.");

        try {
            console.log(`FE: Hủy kết bạn ID: ${friendId}`);
            const response = await fetch(`http://localhost:8081/indentity/api/friends/${friendId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.code === 200) {
                toast.success("Đã hủy kết bạn thành công.");
                 // --- Refresh data after success ---
                fetchFriends(); // Call the defined function
            } else {
                toast.error(data.message || "Không thể hủy kết bạn.");
                console.error("FE: Lỗi hủy kết bạn (API):", data, "Status:", response.status);
                 // Optionally refresh friends even on failure
                if (response.status === 404) {
                    fetchFriends(); // Call the defined function
                }
            }
        } catch (error) {
            console.error("FE: Lỗi hủy kết bạn (Fetch):", error);
            toast.error("Lỗi mạng khi hủy kết bạn.");
        }
    };

    // Show confirmation toast
    toast("Xác nhận hủy kết bạn", {
        description: "Bạn có chắc chắn muốn hủy kết bạn với người này?",
        action: {
            label: "Xác nhận",
            onClick: () => proceedRemove(),
        },
        cancel: {
            label: "Hủy",
            onClick: () => {}, // Do nothing on cancel
        },
        duration: 10000, // Keep toast longer for confirmation
    });
  }, [token, fetchFriends]); // Add fetch function to deps
  
  // Hàm xử lý chặn người dùng
  const handleBlockUser = useCallback(async (userId: number) => {
    if (!token) return toast.error("Vui lòng đăng nhập.");
    try {
      console.log(`Chặn user ID: ${userId}`);
       // --- Gọi API backend để chặn --- 
      setFriends(prev => prev.filter(friend => friend.id !== userId));
      toast.success("Đã chặn người dùng thành công (API chưa tích hợp)");
    } catch (error) {
      console.error("Lỗi khi chặn người dùng:", error);
      toast.error("Không thể chặn người dùng. Vui lòng thử lại sau.");
    }
  }, []);
  
  // Hàm đánh dấu bạn thân
  const handleToggleFavorite = useCallback(async (friendId: number) => {
    if (!token) return toast.error("Vui lòng đăng nhập.");
    try {
      console.log(`Thay đổi trạng thái bạn thân cho user ID: ${friendId}`);
       // Optimistic UI update
      setFriends(prev => prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isFavorite: !friend.isFavorite } 
          : friend
      ));
       toast.success("Đã thay đổi trạng thái bạn thân (API chưa tích hợp)");
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái bạn thân:", error);
      toast.error("Không thể thay đổi trạng thái. Vui lòng thử lại sau.");
    }
  }, []);

  // Hàm xử lý gửi lời mời kết bạn từ kết quả tìm kiếm
  const handleAddFriend = useCallback(async (userToAdd: SearchResultUser) => {
    if (!token) return toast.error("Vui lòng đăng nhập để gửi lời mời kết bạn.");
    try {
      console.log(`Gửi lời mời kết bạn tới user ID: ${userToAdd.id}, Email: ${userToAdd.email}`);
      
      // --- Gọi API backend để gửi lời mời kết bạn --- 
      const response = await fetch('http://localhost:8081/indentity/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Đảm bảo gửi token
        },
        body: JSON.stringify({
          receiverId: userToAdd.id // Sử dụng ID từ kết quả tìm kiếm
        })
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
          // Cập nhật UI khi thành công
          toast.success(`Đã gửi lời mời kết bạn tới ${userToAdd.fullName}`);
          setSearchResults(prev => prev.map(user => 
            user.id === userToAdd.id ? { ...user, requestPending: true } : user
          ));
      } else {
          // Xử lý lỗi từ API
          toast.error(data.message || "Không thể gửi lời mời kết bạn. Vui lòng thử lại sau.");
          console.error("Lỗi khi gửi lời mời kết bạn (API):", data);
      }

    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn (Network/Fetch):", error);
      toast.error("Không thể gửi lời mời kết bạn do lỗi mạng hoặc hệ thống. Vui lòng thử lại sau.");
    }
  }, [token]);

  // Filter friends based on search query (Using useMemo for derived state)
  const filteredFriends = useMemo(() => {
    let filtered = friends;
    if (searchQuery) {
      filtered = filtered.filter(friend =>
        friend.fullName && typeof friend.fullName === 'string' && friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [friends, searchQuery]);
  
  // Giữ lại màu trạng thái cơ bản
  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'; 
      case 'away': return 'bg-yellow-500'; 
      case 'offline': return 'bg-gray-400';
    }
  };

  // Component HotPostItem (giữ nguyên)
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

  // Hàm xử lý khi click vào bạn bè
  const handleFriendClick = (friend: Friend) => {
    setSelectedChat(friend);
    setSelectedGroupChat(null);
    setActiveChat('friend');
    
    // Fetch tin nhắn cá nhân lần đầu
    fetchPrivateMessages(friend.id);
    
    // Cleanup polling cũ
    cleanupPolling();
    
    // Bắt đầu polling mới cho tin nhắn cá nhân
    const interval = setInterval(() => {
      fetchPrivateMessages(friend.id);
    }, 3000); // Poll mỗi 3 giây
    
    setPollingInterval(interval);
  };

  // Thêm hàm cleanup polling khi unmount hoặc đóng chat
  const cleanupPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Sửa lại hàm handleGroupClick để bắt đầu polling
  const handleGroupClick = (group: Group) => {
    setSelectedGroupChat(group);
    setSelectedChat(null);
    setActiveChat('group');
    
    // Fetch tin nhắn lần đầu
    fetchGroupMessages(group.id);
    
    // Cleanup polling cũ nếu có
    cleanupPolling();
    
    // Bắt đầu polling mới
    const interval = setInterval(() => {
      fetchGroupMessages(group.id);
    }, 3000); // Poll mỗi 3 giây
    
    setPollingInterval(interval);
  };

  // Sửa lại hàm đóng chat để cleanup polling
  const handleCloseChat = () => {
    cleanupPolling();
    setSelectedChat(null);
    setSelectedGroupChat(null);
    setActiveChat(null);
  };

  // Thêm useEffect để cleanup khi component unmount
  useEffect(() => {
    return () => {
      cleanupPolling();
    };
  }, []);

  // Thêm hàm xử lý tạo nhóm mới
  const handleCreateGroup = async (name: string, memberIds: number[]) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để tạo nhóm");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/indentity/api/chatrooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          memberIds
        })
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
        // Refresh danh sách nhóm sau khi tạo thành công
        await fetchGroups();
      } else {
        throw new Error(data.message || "Không thể tạo nhóm");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      throw error; // Throw lại error để dialog có thể xử lý
    }
  };

  // Hàm xử lý thêm thành viên vào nhóm
  const handleAddMembers = async (memberIds: number[]) => {
    if (!token || !addMembersDialogState.roomId) return;

    try {
      const response = await fetch("http://localhost:8081/indentity/api/chatrooms/members/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: addMembersDialogState.roomId,
          memberIds: memberIds
        })
      });

      const data = await response.json();
      if (response.ok && data.code === 200) {
        // Refresh danh sách nhóm sau khi thêm thành viên thành công
        await fetchGroups();
      } else {
        throw new Error(data.message || "Không thể thêm thành viên");
      }
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      throw error; // Throw lại error để dialog có thể xử lý
    }
  };

  // --- Phần JSX --- 
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8 flex">
      <div className="flex-grow lg:pr-8">
        {/* Header và Sections bài viết (giữ nguyên) */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">FinTrip Forum</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Chia sẻ và khám phá những trải nghiệm du lịch tuyệt vời từ cộng đồng.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/forum/create-post">
              <Button size="lg">
                <MessageSquare className="mr-2 h-5 w-5"/> Tạo bài viết mới
              </Button>
            </Link>
          </div>
        </header>

        {/* Bài viết nổi bật */} 
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

        {/* Bài viết mới nhất */} 
        <section>
          <h2 className="text-3xl font-semibold mb-8">Bài viết mới nhất</h2>
            
          {isLoading && (
              <div className="text-center py-10 text-muted-foreground">Đang tải bài viết...</div>
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
                              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
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

      {/* Sidebar bạn bè và nhóm */}
      <div className="w-80 flex-shrink-0 lg:pl-8 hidden lg:block">
        <div className="sticky top-6 bg-card border rounded-xl shadow-sm overflow-hidden h-[calc(100vh-3rem)] flex flex-col">
          <div className="p-4 border-b bg-muted/30 dark:bg-muted/20">
            <h2 className="text-xl font-semibold flex items-center gap-2.5">
              <Users className="h-5 w-5" /> Bạn bè & Nhóm
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm bạn bè hoặc nhóm..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Lời mời kết bạn */}
            {!searchQuery && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Lời mời kết bạn
                  {!isLoadingRequests && friendRequests.length > 0 && (
                    <Badge className="ml-1">{friendRequests.length}</Badge>
                  )}
                </h3>
                {isLoadingRequests ? (
                  <p className="text-sm text-center text-muted-foreground py-2">Đang tải lời mời...</p>
                ) : friendRequests.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-2">Không có lời mời kết bạn nào.</p>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.senderAvatar} />
                            <AvatarFallback>
                              {request.senderFullName && typeof request.senderFullName === 'string'
                                ? request.senderFullName.substring(0, 2).toUpperCase()
                                : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{request.senderFullName || 'Người dùng ẩn danh'}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2" 
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Đồng ý
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-2" 
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tin nhắn nhóm gần đây */}
            {!searchQuery && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Danh sách nhóm
                  </h3>
                </div>
                <div className="space-y-3">
                  {isLoadingGroups ? (
                    <p className="text-sm text-center text-muted-foreground py-2">Đang tải danh sách nhóm...</p>
                  ) : groups.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-2">Bạn chưa tham gia nhóm nào.</p>
                  ) : (
                    <>
                      {groups.map((group) => (
                        <div 
                          key={group.id} 
                          className="group hover:bg-muted/60 dark:hover:bg-muted/40 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => handleGroupClick(group)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={group.avatarUrl} />
                                <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{group.name}</h4>
                                {/* <p className="text-xs text-muted-foreground">
                                  {group.memberCount} thành viên
                                </p> */}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="sr-only">Mở menu nhóm</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleGroupClick(group)}>
                                  Nhắn tin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Xem thông tin nhóm ${group.name}`)}>
                                  Xem thông tin nhóm
                                </DropdownMenuItem>
                                {group.isAdmin && (
                                  <DropdownMenuItem onClick={() => alert(`Quản lý nhóm ${group.name}`)}>
                                    Quản lý nhóm
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setAddMembersDialogState({
                                  isOpen: true,
                                  roomId: group.id
                                })}>
                                  Thêm thành viên
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100/80 dark:focus:bg-red-700/20" onClick={() => alert(`Rời nhóm ${group.name}`)}>
                                  Rời nhóm
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                      <CreateGroupDialog friends={friends} onCreateGroup={handleCreateGroup} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Danh sách bạn bè hoặc kết quả tìm kiếm */}
            <div className="p-4 flex-grow overflow-y-auto">
              {searchQuery ? (
                // Existing search results content
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" /> Kết quả tìm kiếm cho &quot;{searchQuery}&quot;
                  </h3>
                  {isSearching && <p className="text-sm text-center text-muted-foreground py-4">Đang tìm kiếm...</p>}
                  {searchError && <p className="text-sm text-center text-red-500 py-4">{searchError}</p>}
                  {!isSearching && !searchError && searchResults.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">Không tìm thấy người dùng nào.</p>
                  )}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="space-y-3">
                      {searchResults.map(userResult => (
                        <div key={userResult.id} className="flex items-center justify-between group hover:bg-muted/60 dark:hover:bg-muted/40 p-1.5 -m-1.5 rounded-md transition-colors duration-150">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {userResult.fullName && typeof userResult.fullName === 'string'
                                  ? userResult.fullName.substring(0, 2).toUpperCase()
                                  : '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{userResult.fullName || 'Người dùng ẩn danh'}</p>
                              <p className="text-xs text-muted-foreground">{userResult.email}</p>
                            </div>
                          </div>
                          <div>
                            {userResult.alreadyFriend ? (
                              <Badge variant="secondary" className="cursor-default">
                                <CheckCircle className="h-3 w-3 mr-1" /> Bạn bè
                              </Badge>
                            ) : userResult.requestPending || userResult.requestSent ? (
                              <Badge variant="outline" className="cursor-default text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" /> Đã gửi yêu cầu
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => handleAddFriend(userResult)}
                              >
                                <UserPlus className="h-4 w-4 mr-1"/> Thêm bạn
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Danh sách bạn bè
                  </h3>
                  {isLoadingFriends ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Đang tải danh sách bạn bè...</p>
                  ) : filteredFriends.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Bạn chưa có bạn bè nào.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredFriends.map((friend: Friend) => (
                        <div key={friend.id} className="flex items-center justify-between group hover:bg-muted/60 dark:hover:bg-muted/40 p-1.5 -m-1.5 rounded-md transition-colors duration-150">
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => handleFriendClick(friend)}
                          >
                            <div className="relative">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={friend.avatarUrl} />
                                <AvatarFallback>
                                  {friend.fullName && typeof friend.fullName === 'string'
                                    ? friend.fullName.substring(0, 2).toUpperCase()
                                    : '??'}
                                </AvatarFallback>
                              </Avatar>
                              <span 
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(friend.status)}`}
                                title={friend.status === 'online' ? 'Trực tuyến' : friend.status === 'away' ? 'Vắng mặt' : 'Ngoại tuyến'}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{friend.fullName || 'Người dùng ẩn danh'}</p>
                              <p className="text-xs text-muted-foreground">
                                {friend.status === 'online' 
                                  ? 'Đang trực tuyến' 
                                  : friend.lastActive ? `Hoạt động ${friend.lastActive}` : 'Ngoại tuyến'}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleFriendClick(friend)}>
                                Nhắn tin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert(`Xem trang cá nhân của ${friend.fullName}`)}>
                                Xem trang cá nhân
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlockUser(friend.id)}>
                                Chặn người dùng
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100/80 dark:focus:bg-red-700/20" onClick={() => handleRemoveFriend(friend.id)}>
                                Hủy kết bạn
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFavorite(friend.id)}>
                                {friend.isFavorite ? 'Bỏ bạn thân' : 'Đánh dấu bạn thân'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat box */}
      {(activeChat === 'friend' || activeChat === 'group') && (
        <div className="fixed bottom-0 right-4 z-50">
          <div className="relative mb-0">
            <BoxChat 
              user={activeChat === 'friend' && selectedChat ? {
                id: selectedChat.id,
                fullName: selectedChat.fullName,
                avatarUrl: selectedChat.avatarUrl,
                status: selectedChat.status
              } : undefined}
              group={activeChat === 'group' && selectedGroupChat ? {
                id: selectedGroupChat.id,
                name: selectedGroupChat.name,
                avatarUrl: selectedGroupChat.avatarUrl,
                memberCount: selectedGroupChat.memberCount,
                isAdmin: selectedGroupChat.isAdmin
              } : undefined}
              messages={
                activeChat === 'group' && selectedGroupChat 
                  ? groupMessages[selectedGroupChat.id] || []
                  : activeChat === 'friend' && selectedChat
                    ? privateMessages[selectedChat.id] || []
                    : []
              }
              onClose={handleCloseChat}
            />
          </div>
        </div>
      )}

      <AddMembersDialog
        isOpen={addMembersDialogState.isOpen}
        onClose={() => setAddMembersDialogState({ isOpen: false, roomId: null })}
        roomId={addMembersDialogState.roomId || 0}
        friends={friends}
        onAddMembers={handleAddMembers}
      />
    </div>
  )
} 