'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { BillService, CreateBillData } from '@/lib/bills'
import { RoomMember } from '@/lib/supabase'
import { ArrowLeft, Receipt, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CreateBillForm {
  title: string
  description: string
  totalAmount: number
  participantIds: string[]
}

export default function CreateBillPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string

  const [members, setMembers] = useState<RoomMember[]>([])
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<CreateBillForm>({
    defaultValues: {
      participantIds: []
    }
  })

  const selectedParticipants = watch('participantIds')

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
    } catch (error) {
      toast.error('Failed to load room data')
      console.error('Error loading room data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CreateBillForm) => {
    if (data.participantIds.length === 0) {
      toast.error('Please select at least one participant')
      return
    }

    setIsSubmitting(true)
    try {
      const billData: CreateBillData = {
        roomId,
        title: data.title,
        description: data.description || undefined,
        totalAmount: data.totalAmount,
        currency: room.currency,
        createdBy: user!.id,
        participantIds: data.participantIds
      }

      const bill = await BillService.createBill(billData)
      toast.success('Bill created successfully!')
      router.push(`/rooms/${roomId}/bills/${bill.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create bill')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleParticipant = (userId: string, currentIds: string[]) => {
    if (currentIds.includes(userId)) {
      return currentIds.filter(id => id !== userId)
    } else {
      return [...currentIds, userId]
    }
  }

  const selectAllParticipants = (currentIds: string[]) => {
    if (currentIds.length === members.length) {
      return []
    } else {
      return members.map(m => m.user_id)
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
        <header className="mobile-header">
          <Link href={`/rooms/${roomId}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Create Bill</h1>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="mobile-container">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Bill</h2>
              <p className="text-gray-600">Add a shared expense for {room.name}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Bill Details */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="form-label">
                    Bill Title *
                  </label>
                  <input
                    {...register('title', {
                      required: 'Bill title is required',
                      minLength: {
                        value: 3,
                        message: 'Title must be at least 3 characters'
                      }
                    })}
                    type="text"
                    id="title"
                    className="form-input"
                    placeholder="e.g., Dinner at Pizza Place, Grocery Shopping"
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    className="form-input"
                    placeholder="Add any additional details about this bill..."
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="totalAmount" className="form-label">
                    Total Amount ({room.currency}) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('totalAmount', {
                        required: 'Total amount is required',
                        min: {
                          value: 0.01,
                          message: 'Amount must be greater than 0'
                        },
                        max: {
                          value: 999999,
                          message: 'Amount is too large'
                        }
                      })}
                      type="number"
                      step="0.01"
                      id="totalAmount"
                      className="form-input pl-10"
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.totalAmount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.totalAmount.message}</p>
                  )}
                </div>
              </div>

              {/* Participants Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label mb-0">
                    Who's participating? *
                  </label>
                  <Controller
                    name="participantIds"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <button
                        type="button"
                        onClick={() => onChange(selectAllParticipants(value))}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        disabled={isSubmitting}
                      >
                        {value.length === members.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  />
                </div>

                <Controller
                  name="participantIds"
                  control={control}
                  rules={{
                    validate: value => value.length > 0 || 'Please select at least one participant'
                  }}
                  render={({ field: { value, onChange } }) => (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div 
                          key={member.user_id}
                          className={`card cursor-pointer transition-colors ${
                            value.includes(member.user_id)
                              ? 'bg-primary-50 border-primary-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => !isSubmitting && onChange(toggleParticipant(member.user_id, value))}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value.includes(member.user_id)}
                              onChange={() => onChange(toggleParticipant(member.user_id, value))}
                              className="mr-3 text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting}
                            />
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 font-semibold">
                                {member.user?.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {member.user?.username}
                                {member.user_id === user?.id && (
                                  <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                    You
                                  </span>
                                )}
                              </h4>
                            </div>
                            {selectedParticipants.length > 0 && (
                              <div className="text-sm text-gray-600">
                                Share: {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: room.currency
                                }).format((watch('totalAmount') || 0) / selectedParticipants.length)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {errors.participantIds && (
                  <p className="mt-1 text-sm text-danger-600">{errors.participantIds.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Create Bill
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-6 card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How bill splitting works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The total amount is divided equally among all participants</li>
              <li>• You can add payments after creating the bill</li>
              <li>• RoomLedger automatically calculates who owes what</li>
              <li>• Bills are marked as settled when fully paid</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}