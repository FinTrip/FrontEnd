"use client"

import { useRef, useState, useEffect } from "react"
import { Send, X, Users, Loader2, Video } from "lucide-react"
import { Button } from "@/app/page/components/ui/button"
import { Input } from "@/app/page/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar"
import { Badge } from "@/app/page/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ChatUser {
  id: number;
  fullName: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
}

interface ChatGroup {
  id: number;
  name: string;
  avatarUrl?: string;
  memberCount: number;
  isAdmin?: boolean;
}

interface BoxChatProps {
  user?: ChatUser;
  group?: ChatGroup;
  messages?: GroupMessage[];
  onClose?: () => void;
}

interface GroupMessage {
  id: number;
  groupId: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

export function BoxChat({ user, group, messages = [], onClose }: BoxChatProps) {
  const { user: currentUser, token } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [callLoading, setCallLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSending(true);
    try {
      let response;
      if (group) {
        // Gửi tin nhắn nhóm
        response = await fetch("http://localhost:8081/indentity/api/chatrooms/send-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            roomId: group.id,
            content: messageInput.trim()
          })
        });
      } else if (user) {
        // Gửi tin nhắn cá nhân
        response = await fetch("http://localhost:8081/indentity/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            receiverId: user.id,
            content: messageInput.trim()
          })
        });
      }

      if (response) {
        const data = await response.json();
        if (response.ok && data.code === 200) {
          setMessageInput("");
          scrollToBottom();
        } else {
          throw new Error(data.message || "Không thể gửi tin nhắn");
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVideoCall = async () => {
    if (!currentUser || (!user && !group)) return;
    
    setCallLoading(true);
    try {
      // Tạo ID phòng duy nhất
      const roomId = user 
        ? `room_${currentUser.id}_${user.id}_${Date.now()}` // Chat cá nhân
        : `room_group_${group!.id}_${Date.now()}`; // Chat nhóm
      
      const callLink = `${window.location.origin}/callvideo?roomID=${roomId}`;
      
      try {
        if (user) {
          // Gửi tin nhắn thông báo cho chat cá nhân
          await fetch("http://localhost:8081/indentity/api/messages/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              receiverId: user.id,
              content: `Hiện tại người này đang tạo 1 phòng họp với bạn. Vui lòng bấm vào <a href="${callLink}" class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none">Tham gia</a>`
            })
          });
        } else if (group) {
          // Gửi tin nhắn thông báo cho chat nhóm
          await fetch("http://localhost:8081/indentity/api/chatrooms/send-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              roomId: group.id,
              content: `${currentUser.fullName} đã tạo một phòng họp nhóm. Vui lòng bấm vào <a href="${callLink}" class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none">Tham gia</a>`
            })
          });
        }
        
        console.log('Đã gửi tin nhắn thông báo cuộc gọi');
        
        // Thông báo thành công và chuyển đến trang cuộc gọi
        toast.success(`Đã tạo phòng họp và gửi lời mời ${user ? `tới ${user.fullName}` : 'cho cả nhóm'}`);
        router.push(`/callvideo?roomID=${roomId}`);
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn thông báo:", error);
        toast.error("Không thể gửi lời mời tham gia. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi bắt đầu cuộc gọi:", error);
      toast.error("Không thể bắt đầu cuộc gọi. Vui lòng thử lại sau.");
    } finally {
      setCallLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="w-[320px] h-[480px] bg-card rounded-t-lg shadow-lg overflow-hidden flex flex-col border border-b-0">
      {/* Chat header */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || group?.avatarUrl} />
              <AvatarFallback>
                {user?.fullName 
                  ? user.fullName.substring(0, 2).toUpperCase() 
                  : group?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user?.status && (
              <span 
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${getStatusColor(user.status)}`}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">
                {user?.fullName || group?.name || 'Người dùng'}
              </h3>
              {group && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  <Users className="h-3 w-3 mr-1" />
                  {group.memberCount}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {user 
                ? user.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'
                : group?.isAdmin ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-muted text-green-600"
            onClick={handleVideoCall}
            disabled={callLoading}
            title={`Tạo phòng họp ${group ? 'nhóm' : ''}`}
          >
            {callLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = currentUser && message.senderId === currentUser.id;
            
            const hasHtml = message.content.includes('<a') || message.content.includes('<button');
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex items-end gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {message.senderName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
                    isCurrentUser 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-muted rounded-bl-none"
                  )}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      {message.senderName}
                    </p>
                  )}
                  {hasHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div
                    className={cn(
                      "text-[10px] mt-1 flex justify-end",
                      isCurrentUser
                        ? "text-primary-foreground/80" 
                        : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>

                {isCurrentUser && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {currentUser.fullName?.substring(0, 2).toUpperCase() || "ME"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 h-9 text-sm bg-background"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-9 w-9 rounded-full" 
            disabled={!messageInput.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}