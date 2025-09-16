'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { RoomMember, UserBalance } from '@/lib/supabase'
import { Plus, Users, LogOut, Settings, Home, Receipt } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [rooms, setRooms] = useState<RoomMember[]>([])
  const [balances, setBalances] = useState<{ [roomId: string]: UserBalance[] }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserRooms()
    }
  }, [user])

  const loadUserRooms = async () => {
    try {
      const userRooms = await RoomService.getUserRooms(user!.id)
      setRooms(userRooms)

      // Load balances for each room
      const balancePromises = userRooms.map(async (roomMember) => {
        const roomBalances = await RoomService.getRoomBalances(roomMember.room_id)
        return { roomId: roomMember.room_id, balances: roomBalances }
      })

      const balanceResults = await Promise.all(balancePromises)
      const balanceMap = balanceResults.reduce((acc, { roomId, balances }) => {
        acc[roomId] = balances
        return acc
      }, {} as { [roomId: string]: UserBalance[] })

      setBalances(balanceMap)
    } catch (error) {
      toast.error('Failed to load rooms')
      console.error('Error loading rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const getUserBalance = (roomId: string): number => {
    const roomBalances = balances[roomId] || []
    const userBalance = roomBalances.find(b => b.user_id === user?.id)
    return userBalance?.balance || 0
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getBalanceClass = (balance: number) => {
    if (balance > 0) return 'balance-positive'
    if (balance < 0) return 'balance-negative'
    return 'balance-zero'
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="mobile-header bg-white shadow-sm">
          <div className="flex items-center">
            <Home className="w-6 h-6 text-primary-600 mr-2" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="mobile-container pb-20">
          {/* Welcome Section */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Welcome, {user?.username}!
                </h2>
                <p className="text-gray-600 mt-1">
                  {rooms.length === 0 
                    ? 'Create or join a room to get started'
                    : `You're in ${rooms.length} room${rooms.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <div className="text-right">
                <Link href="/rooms/create" className="btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  New Room
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/rooms/join" className="card hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Join Room</h3>
                <p className="text-sm text-gray-600">Enter room code</p>
              </div>
            </Link>

            <Link href="/rooms/create" className="card hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Create Room</h3>
                <p className="text-sm text-gray-600">Start new group</p>
              </div>
            </Link>
          </div>

          {/* Rooms List */}
          {rooms.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rooms</h3>
              {rooms.map((roomMember) => {
                const room = roomMember.room!
                const balance = getUserBalance(room.id)
                
                return (
                  <Link 
                    key={room.id} 
                    href={`/rooms/${room.id}`}
                    className="card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h4 className="font-semibold text-gray-900">{room.name}</h4>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {room.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Joined {new Date(roomMember.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={getBalanceClass(balance)}>
                          {balance === 0 ? 'Settled' : formatCurrency(Math.abs(balance), room.currency)}
                        </div>
                        {balance !== 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {balance > 0 ? 'You are owed' : 'You owe'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rooms Yet</h3>
              <p className="text-gray-600 mb-6">
                Create a new room or join an existing one to start splitting bills with your roommates.
              </p>
              <div className="space-y-3">
                <Link href="/rooms/create" className="btn-primary w-full">
                  Create Your First Room
                </Link>
                <Link href="/rooms/join" className="btn-secondary w-full">
                  Join Existing Room
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="mobile-nav">
          <div className="flex items-center justify-around">
            <Link href="/dashboard" className="flex flex-col items-center text-primary-600">
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link href="/bills" className="flex flex-col items-center text-gray-500">
              <Receipt className="w-6 h-6" />
              <span className="text-xs mt-1">Bills</span>
            </Link>
            
            <Link href="/settings" className="flex flex-col items-center text-gray-500">
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  )
}