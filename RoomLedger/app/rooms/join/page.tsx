'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { ArrowLeft, Users, Hash } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface JoinRoomForm {
  code: string
}

export default function JoinRoomPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<JoinRoomForm>()

  const onSubmit = async (data: JoinRoomForm) => {
    setIsLoading(true)
    try {
      const roomMember = await RoomService.joinRoom(user!.id, data.code)
      toast.success('Joined room successfully!')
      router.push(`/rooms/${roomMember.room_id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="mobile-header">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Join Room</h1>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="mobile-container">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Room</h2>
              <p className="text-gray-600">Enter the room code shared by your roommate</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="code" className="form-label">
                  Room Code
                </label>
                <div className="relative">
                  <input
                    {...register('code', {
                      required: 'Room code is required',
                      minLength: {
                        value: 4,
                        message: 'Room code must be at least 4 characters'
                      },
                      pattern: {
                        value: /^[A-Z0-9]+$/i,
                        message: 'Room code can only contain letters and numbers'
                      }
                    })}
                    type="text"
                    id="code"
                    className="form-input pl-10"
                    placeholder="Enter room code (e.g., ROOM101)"
                    disabled={isLoading}
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                    }}
                  />
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.code && (
                  <p className="mt-1 text-sm text-danger-600">{errors.code.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Ask your roommate for the room code
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Join Room
              </button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 mt-6">
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">What is a room code?</h3>
              <p className="text-sm text-green-800">
                A room code is a unique identifier that allows you to join a specific group of roommates. 
                The person who created the room can share this code with you.
              </p>
            </div>

            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Don't have a room code?</h3>
              <p className="text-sm text-blue-800 mb-3">
                If your roommates haven't created a room yet, you can create one and share the code with them.
              </p>
              <Link href="/rooms/create" className="btn-primary text-sm">
                Create New Room
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}