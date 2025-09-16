'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { ArrowLeft, Settings, Users, DollarSign, Trash2, LogOut } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
]

export default function RoomSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string

  const [room, setRoom] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newCurrency, setNewCurrency] = useState('')
  const [newRoomName, setNewRoomName] = useState('')

  useEffect(() => {
    if (roomId && user) {
      loadRoomData()
    }
  }, [roomId, user])

  const loadRoomData = async () => {
    try {
      const [roomMembers, userRooms] = await Promise.all([
        RoomService.getRoomMembers(roomId),
        RoomService.getUserRooms(user!.id)
      ])

      setMembers(roomMembers)
      
      const currentRoom = userRooms.find(r => r.room_id === roomId)
      if (!currentRoom) {
        toast.error('You are not a member of this room')
        router.push('/dashboard')
        return
      }
      
      setRoom(currentRoom.room)
      setNewCurrency(currentRoom.room.currency)
      setNewRoomName(currentRoom.room.name)
    } catch (error) {
      toast.error('Failed to load room data')
      console.error('Error loading room data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRoomName = async () => {
    if (!newRoomName.trim() || newRoomName === room.name) {
      return
    }

    setIsUpdating(true)
    try {
      await RoomService.updateRoomSettings(roomId, { name: newRoomName.trim() })
      toast.success('Room name updated successfully!')
      await loadRoomData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update room name')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateCurrency = async () => {
    if (!newCurrency || newCurrency === room.currency) {
      return
    }

    setIsUpdating(true)
    try {
      await RoomService.updateRoomSettings(roomId, { currency: newCurrency })
      toast.success('Currency updated successfully!')
      await loadRoomData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update currency')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLeaveRoom = async () => {
    const confirmed = confirm(
      'Are you sure you want to leave this room? You will lose access to all bills and payment history.'
    )
    
    if (!confirmed) return

    try {
      await RoomService.leaveRoom(user!.id, roomId)
      toast.success('Left room successfully')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to leave room')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Room not found</p>
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="mobile-header bg-white shadow-sm">
          <Link href={`/rooms/${roomId}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Room Settings</h1>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="mobile-container pb-20">
          {/* Room Info */}
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Settings className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                <p className="text-gray-600">Code: {room.code}</p>
              </div>
            </div>
          </div>

          {/* Room Settings */}
          <div className="space-y-6">
            {/* Room Name */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Room Name</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Room name"
                  disabled={isUpdating}
                />
                <button
                  onClick={handleUpdateRoomName}
                  disabled={isUpdating || !newRoomName.trim() || newRoomName === room.name}
                  className="btn-primary px-4"
                >
                  {isUpdating ? <LoadingSpinner size="sm" /> : 'Update'}
                </button>
              </div>
            </div>

            {/* Currency */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Currency</h3>
              <div className="flex space-x-2">
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="form-input flex-1"
                  disabled={isUpdating}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateCurrency}
                  disabled={isUpdating || !newCurrency || newCurrency === room.currency}
                  className="btn-primary px-4"
                >
                  {isUpdating ? <LoadingSpinner size="sm" /> : 'Update'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Changing currency will affect all future bills. Existing bills keep their original currency.
              </p>
            </div>

            {/* Members */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Members ({members.length})</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold text-sm">
                          {member.user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {member.user?.username}
                          {member.user_id === user?.id && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-danger-200">
              <h3 className="font-semibold text-danger-900 mb-3">Danger Zone</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLeaveRoom}
                  className="flex items-center justify-center w-full p-3 text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Leave Room
                </button>
                <p className="text-sm text-gray-600">
                  Leaving the room will remove your access to all bills and payment history. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}