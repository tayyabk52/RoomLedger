'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { BillService } from '@/lib/bills'
import { RoomMember, UserBalance, Bill } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Receipt, 
  Settings,
  Copy,
  Check,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function RoomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string

  const [room, setRoom] = useState<any>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (roomId && user) {
      loadRoomData()
    }
  }, [roomId, user])

  const loadRoomData = async () => {
    try {
      const [roomMembers, roomBalances, roomBills] = await Promise.all([
        RoomService.getRoomMembers(roomId),
        RoomService.getRoomBalances(roomId),
        BillService.getRoomBills(roomId)
      ])

      setMembers(roomMembers)
      setBalances(roomBalances)
      setBills(roomBills)

      // Set room info from the first member's room data
      if (roomMembers.length > 0) {
        const userMember = roomMembers.find(m => m.user_id === user?.id)
        if (!userMember) {
          toast.error('You are not a member of this room')
          router.push('/dashboard')
          return
        }
        // We need to get room info separately since members query doesn't include room details
        const userRooms = await RoomService.getUserRooms(user!.id)
        const currentRoom = userRooms.find(r => r.room_id === roomId)
        setRoom(currentRoom?.room)
      }
    } catch (error) {
      toast.error('Failed to load room data')
      console.error('Error loading room data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyRoomCode = async () => {
    if (room?.code) {
      try {
        await navigator.clipboard.writeText(room.code)
        setCopied(true)
        toast.success('Room code copied!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy room code')
      }
    }
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

  const getUserBalance = (): number => {
    const userBalance = balances.find(b => b.user_id === user?.id)
    return userBalance?.balance || 0
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
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold truncate">{room.name}</h1>
          <Link href={`/rooms/${roomId}/settings`} className="flex items-center text-gray-600 hover:text-gray-900">
            <Settings className="w-5 h-5" />
          </Link>
        </header>

        <main className="mobile-container pb-20">
          {/* Room Info & Balance */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600 mr-2">Code: {room.code}</span>
                  <button
                    onClick={copyRoomCode}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Your Balance</div>
                <div className={getBalanceClass(getUserBalance())}>
                  {getUserBalance() === 0 
                    ? 'Settled' 
                    : formatCurrency(Math.abs(getUserBalance()), room.currency)
                  }
                </div>
                {getUserBalance() !== 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {getUserBalance() > 0 ? 'You are owed' : 'You owe'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                {members.length} member{members.length !== 1 ? 's' : ''}
              </div>
              
              <Link href={`/rooms/${roomId}/bills/create`} className="btn-primary">
                <Plus className="w-4 h-4 mr-1" />
                New Bill
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">
                {bills.length}
              </div>
              <div className="text-sm text-gray-600">Total Bills</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">
                {bills.filter(b => !b.is_settled).length}
              </div>
              <div className="text-sm text-gray-600">Active Bills</div>
            </div>
          </div>

          {/* Recent Bills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bills</h3>
              <Link href={`/rooms/${roomId}/bills`} className="text-primary-600 text-sm">
                View All
              </Link>
            </div>

            {bills.length > 0 ? (
              <div className="space-y-3">
                {bills.slice(0, 3).map((bill) => (
                  <Link 
                    key={bill.id}
                    href={`/rooms/${roomId}/bills/${bill.id}`}
                    className="card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{bill.title}</h4>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span>By {bill.created_by_username}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(bill.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(bill.total_amount, room.currency)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          bill.is_settled 
                            ? 'bg-success-100 text-success-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {bill.is_settled ? 'Settled' : 'Active'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">No Bills Yet</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Create your first bill to start splitting expenses
                </p>
                <Link href={`/rooms/${roomId}/bills/create`} className="btn-primary">
                  Create First Bill
                </Link>
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Members</h3>
            <div className="space-y-2">
              {members.map((member) => {
                const balance = balances.find(b => b.user_id === member.user_id)?.balance || 0
                return (
                  <div key={member.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-semibold">
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
                      
                      <div className={getBalanceClass(balance)}>
                        {balance === 0 
                          ? 'Settled' 
                          : formatCurrency(Math.abs(balance), room.currency)
                        }
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="mobile-nav">
          <div className="flex items-center justify-around">
            <Link href="/dashboard" className="flex flex-col items-center text-gray-500">
              <Receipt className="w-6 h-6" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            
            <Link href={`/rooms/${roomId}/bills`} className="flex flex-col items-center text-primary-600">
              <Receipt className="w-6 h-6" />
              <span className="text-xs mt-1">Bills</span>
            </Link>
            
            <Link href={`/rooms/${roomId}/settings`} className="flex flex-col items-center text-gray-500">
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  )
}