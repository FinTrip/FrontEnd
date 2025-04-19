"use client"

import { useState } from "react"
import { Button } from "@/app/page/components/ui/button"
import { Label } from "@/app/page/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/page/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar"
import { Checkbox } from "@/app/page/components/ui/checkbox"
import { ScrollArea } from "@/app/page/components/ui/scroll-area"
import { Users } from "lucide-react"
import { toast } from "sonner"

interface Friend {
  id: number
  fullName: string
  avatarUrl: string
  status: "online" | "offline" | "away"
}

interface AddMembersDialogProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
  friends: Friend[]
  existingMemberIds?: number[]
  onAddMembers: (memberIds: number[]) => Promise<void>
}

export function AddMembersDialog({ 
  isOpen, 
  onClose, 
 
  friends, 
  existingMemberIds = [],
  onAddMembers 
}: AddMembersDialogProps) {
  const [selectedFriends, setSelectedFriends] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thành viên");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMembers(selectedFriends);
      toast.success("Đã thêm thành viên vào nhóm thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      toast.error("Không thể thêm thành viên. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const resetAndClose = () => {
    setSelectedFriends([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Thêm thành viên</DialogTitle>
          <DialogDescription className="text-gray-500">
            Chọn bạn bè để thêm vào nhóm chat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Users className="h-4 w-4" />
              Chọn thành viên
            </Label>
            <ScrollArea className="h-[300px] rounded-md border border-gray-200 bg-white">
              <div className="p-4 space-y-2">
                {friends
                  .filter(friend => !existingMemberIds.includes(friend.id))
                  .map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Checkbox
                        id={`friend-${friend.id}`}
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => toggleFriendSelection(friend.id)}
                        className="border-gray-300 text-blue-600"
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={friend.avatarUrl} />
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {friend.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={`friend-${friend.id}`}
                          className="text-sm font-medium leading-none cursor-pointer text-gray-900"
                        >
                          {friend.fullName}
                        </Label>
                      </div>
                    </div>
                  ))}
                {friends.filter(friend => !existingMemberIds.includes(friend.id)).length === 0 && (
                  <p className="text-sm text-center text-gray-500 py-2">
                    Tất cả bạn bè đã là thành viên của nhóm.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={resetAndClose}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedFriends.length === 0 || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm thành viên"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 