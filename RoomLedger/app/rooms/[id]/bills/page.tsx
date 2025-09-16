'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { BillService } from '@/lib/bills'
import { RoomService } from '@/lib/rooms'
import { Bill } from '@/lib/supabase'
import { ArrowLeft, Plus, Receipt, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function RoomBillsPage() {
  const params = useParams()
  const { user } = useAuth()
  const roomId = params.id as string

  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'settled'>('all')

  useEffect(() => {
    if (roomId && user) {
      loadData()
    }
  }, [roomId, user])

  useEffect(() => {
    filterBills()
  }, [bills, searchTerm, filterStatus])

  const loadData = async () => {
    try {
      const [roomBills, userRooms] = await Promise.all([
        BillService.getRoomBills(roomId),
        RoomService.getUserRooms(user!.id)
      ])

      setBills(roomBills)
      
      const currentRoom = userRooms.find(r => r.room_id === roomId)
      setRoom(currentRoom?.room)
    } catch (error) {
      toast.error('Failed to load bills')
      console.error('Error loading bills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBills = () => {
    let filtered = bills

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bill => 
        bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(bill => !bill.is_settled)
    } else if (filterStatus === 'settled') {
      filtered = filtered.filter(bill => bill.is_settled)
    }

    setFilteredBills(filtered)
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusBadge = (bill: Bill) => {
    if (bill.is_settled) {
      return (
        <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">
          Settled
        </span>
      )
    } else {
      const paidPercentage = ((bill.total_paid || 0) / bill.total_amount) * 100
      if (paidPercentage === 0) {
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
            Unpaid
          </span>
        )
      } else if (paidPercentage < 100) {
        return (
          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
            Partial
          </span>
        )
      } else {
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            Overpaid
          </span>
        )
      }
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="mobile-header bg-white shadow-sm">
          <Link href={`/rooms/${roomId}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Bills</h1>
          <Link href={`/rooms/${roomId}/bills/create`} className="flex items-center text-primary-600 hover:text-primary-700">
            <Plus className="w-5 h-5" />
          </Link>
        </header>

        <main className="mobile-container pb-20">
          {/* Search and Filter */}
          <div className="card mb-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterStatus === 'all'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All ({bills.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterStatus === 'active'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Active ({bills.filter(b => !b.is_settled).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('settled')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterStatus === 'settled'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Settled ({bills.filter(b => b.is_settled).length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bills List */}
          {filteredBills.length > 0 ? (
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <Link 
                  key={bill.id}
                  href={`/rooms/${roomId}/bills/${bill.id}`}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{bill.title}</h3>
                      {bill.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {bill.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <span>By {bill.created_by_username}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(bill.created_at).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{bill.participant_count} participant{bill.participant_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900 mb-1">
                        {formatCurrency(bill.total_amount, room?.currency)}
                      </div>
                      {getStatusBadge(bill)}
                    </div>
                  </div>

                  {!bill.is_settled && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Paid: {formatCurrency(bill.total_paid || 0, room?.currency)}
                        </span>
                        <span className="text-gray-600">
                          Remaining: {formatCurrency(bill.remaining_amount || 0, room?.currency)}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(((bill.total_paid || 0) / bill.total_amount) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No Bills Found' : 'No Bills Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first bill to start splitting expenses'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link href={`/rooms/${roomId}/bills/create`} className="btn-primary">
                  Create First Bill
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}