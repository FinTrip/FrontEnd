"use client"

import { useState } from "react"
import { Button } from "@/app/page/components/ui/button"
import { Input } from "@/app/page/components/ui/input"
import { Label } from "@/app/page/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/page/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/page/components/ui/avatar"
import { Checkbox } from "@/app/page/components/ui/checkbox"
import { ScrollArea } from "@/app/page/components/ui/scroll-area"
import { Users, Plus } from "lucide-react"
import { toast } from "sonner"

interface Friend {
  id: number
  fullName: string
  avatarUrl: string
  status: "online" | "offline" | "away"
}

interface CreateGroupDialogProps {
  friends: Friend[]
  onCreateGroup: (name: string, memberIds: number[]) => Promise<void>
}

export function CreateGroupDialog({ friends, onCreateGroup }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState<number[]>([])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError("Vui lòng nhập tên nhóm")
      return
    }

    if (selectedFriends.length === 0) {
      setError("Vui lòng chọn ít nhất một thành viên")
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateGroup(groupName, selectedFriends)
      setOpen(false)
      resetForm()
      toast.success("Tạo nhóm thành công!")
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error)
      toast.error("Không thể tạo nhóm. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setGroupName("")
    setSelectedFriends([])
    setError("")
  }

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Tạo nhóm mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Tạo nhóm mới</DialogTitle>
          <DialogDescription className="text-gray-500">
            Tạo một nhóm chat mới và thêm bạn bè vào nhóm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">Tên nhóm</Label>
            <Input
              id="name"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Users className="h-4 w-4" />
              Chọn thành viên
            </Label>
            <ScrollArea className="h-[300px] rounded-md border border-gray-300 bg-white">
              <div className="p-4 space-y-2">
                {friends.map((friend) => (
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
              </div>
            </ScrollArea>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 