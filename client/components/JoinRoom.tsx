"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface JoinRoomDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinRoomDialog({ isOpen, onClose }: JoinRoomDialogProps) {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()
  

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Join Existing Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="roomId" className="text-sm font-medium text-gray-300">
              Room ID
            </label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleJoinRoom} className="bg-blue-500 hover:bg-blue-600 text-white">
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
