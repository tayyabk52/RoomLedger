'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { BillService, CreatePaymentData } from '@/lib/bills'
import { RoomService } from '@/lib/rooms'
import { Bill, BillParticipant, Payment } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Trash2, 
  Edit,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function BillDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string
  const billId = params.billId as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [participants, setParticipants] = useState<BillParticipant[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  useEffect(() => {
    if (roomId && billId && user) {
      loadData()
    }
  }, [roomId, billId, user])

  const loadData = async () => {
    try {
      const [billDetails, userRooms] = await Promise.all([
        BillService.getBillDetails(billId),
        RoomService.getUserRooms(user!.id)
      ])

      setBill(billDetails.bill)
      setParticipants(billDetails.participants)
      setPayments(billDetails.payments)

      const currentRoom = userRooms.find(r => r.room_id === roomId)
      setRoom(currentRoom?.room)
    } catch (error) {
      toast.error('Failed to load bill details')
      console.error('Error loading bill details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    setIsSubmittingPayment(true)
    try {
      const paymentData: CreatePaymentData = {
        billId,
        payerId: user!.id,
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod || undefined,
        notes: paymentNotes || undefined
      }

      await BillService.addPayment(paymentData)
      toast.success('Payment added successfully!')
      
      // Reset form
      setPaymentAmount('')
      setPaymentMethod('')
      setPaymentNotes('')
      setShowPaymentForm(false)
      
      // Reload data
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add payment')
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return
    }

    try {
      await BillService.deletePayment(paymentId)
      toast.success('Payment deleted successfully!')
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete payment')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getUserPaymentTotal = (): number => {
    return payments
      .filter(p => p.payer_id === user?.id)
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getUserShare = (): number => {
    const userParticipant = participants.find(p => p.user_id === user?.id)
    return userParticipant?.share_amount || 0
  }

  const getUserBalance = (): number => {
    return getUserPaymentTotal() - getUserShare()
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

  if (!bill || !room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Bill not found</p>
            <Link href={`/rooms/${roomId}/bills`} className="btn-primary">
              Go to Bills
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
          <Link href={`/rooms/${roomId}/bills`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold truncate">Bill Details</h1>
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <Edit className="w-5 h-5" />
          </button>
        </header>

        <main className="mobile-container pb-20">
          {/* Bill Overview */}
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{bill.title}</h2>
                {bill.description && (
                  <p className="text-gray-600 mb-3">{bill.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(bill.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {participants.length} people
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(bill.total_amount, room.currency)}
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  bill.is_settled 
                    ? 'bg-success-100 text-success-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {bill.is_settled ? 'Settled' : 'Active'}
                </div>
              </div>
            </div>

            {!bill.is_settled && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    Paid: {formatCurrency(bill.total_paid || 0, room.currency)}
                  </span>
                  <span className="text-gray-600">
                    Remaining: {formatCurrency(bill.remaining_amount || 0, room.currency)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(((bill.total_paid || 0) / bill.total_amount) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Your Summary */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Your Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(getUserShare(), room.currency)}
                </div>
                <div className="text-sm text-gray-600">Your Share</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(getUserPaymentTotal(), room.currency)}
                </div>
                <div className="text-sm text-gray-600">You Paid</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${
                  getUserBalance() > 0 ? 'text-success-600' : 
                  getUserBalance() < 0 ? 'text-danger-600' : 'text-gray-900'
                }`}>
                  {getUserBalance() === 0 ? 'Even' : 
                   formatCurrency(Math.abs(getUserBalance()), room.currency)}
                </div>
                <div className="text-sm text-gray-600">
                  {getUserBalance() > 0 ? 'You are owed' :
                   getUserBalance() < 0 ? 'You owe' : 'Balance'}
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Participants</h3>
            <div className="space-y-3">
              {participants.map((participant) => {
                const userPayments = payments
                  .filter(p => p.payer_id === participant.user_id)
                  .reduce((sum, p) => sum + p.amount, 0)
                const balance = userPayments - participant.share_amount

                return (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold text-sm">
                          {participant.user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {participant.user?.username}
                          {participant.user_id === user?.id && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Share: {formatCurrency(participant.share_amount, room.currency)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        Paid: {formatCurrency(userPayments, room.currency)}
                      </div>
                      <div className={`text-sm ${
                        balance > 0 ? 'text-success-600' : 
                        balance < 0 ? 'text-danger-600' : 'text-gray-600'
                      }`}>
                        {balance === 0 ? 'Even' : 
                         `${balance > 0 ? '+' : ''}${formatCurrency(balance, room.currency)}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payments */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Payments</h3>
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Payment
              </button>
            </div>

            {/* Payment Form */}
            {showPaymentForm && (
              <form onSubmit={handleAddPayment} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Amount ({room.currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="form-input"
                      placeholder="0.00"
                      required
                      disabled={isSubmittingPayment}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Payment Method (Optional)</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-input"
                      disabled={isSubmittingPayment}
                    >
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="venmo">Venmo</option>
                      <option value="paypal">PayPal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Notes (Optional)</label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="form-input"
                      placeholder="Add a note..."
                      disabled={isSubmittingPayment}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="btn-primary flex-1"
                    >
                      {isSubmittingPayment ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                      Add Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="btn-secondary"
                      disabled={isSubmittingPayment}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Payments List */}
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
                        <CreditCard className="w-4 h-4 text-success-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {payment.payer?.username}
                          {payment.payer_id === user?.id && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </h4>
                        <div className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                          {payment.payment_method && (
                            <span className="ml-2 capitalize">• {payment.payment_method}</span>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-gray-500 italic">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-right mr-2">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount, room.currency)}
                        </div>
                      </div>
                      
                      {payment.payer_id === user?.id && (
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-danger-600 hover:text-danger-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">No payments recorded yet</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}