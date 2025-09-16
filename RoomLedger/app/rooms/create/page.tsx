'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { RoomService } from '@/lib/rooms'
import { ArrowLeft, Home, DollarSign } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CreateRoomForm {
  name: string
  code: string
  currency: string
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
]

export default function CreateRoomPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateRoomForm>({
    defaultValues: {
      currency: 'USD'
    }
  })

  const onSubmit = async (data: CreateRoomForm) => {
    setIsLoading(true)
    try {
      const room = await RoomService.createRoom(data.name, data.code, data.currency)
      
      // Join the room as the creator
      await RoomService.joinRoom(user!.id, room.code)
      
      toast.success('Room created successfully!')
      router.push(`/rooms/${room.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const generateRoomCode = () => {
    const code = 'ROOM' + Math.random().toString(36).substr(2, 4).toUpperCase()
    return code
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
          <h1 className="text-lg font-semibold">Create Room</h1>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="mobile-container">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Room</h2>
              <p className="text-gray-600">Set up a room for you and your roommates</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Room Name
                </label>
                <input
                  {...register('name', {
                    required: 'Room name is required',
                    minLength: {
                      value: 3,
                      message: 'Room name must be at least 3 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Room name must be less than 50 characters'
                    }
                  })}
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="e.g., Apartment 101, Beach House"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="form-label">
                  Room Code
                </label>
                <div className="flex space-x-2">
                  <input
                    {...register('code', {
                      required: 'Room code is required',
                      minLength: {
                        value: 4,
                        message: 'Room code must be at least 4 characters'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Room code must be less than 20 characters'
                      },
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: 'Room code can only contain uppercase letters and numbers'
                      }
                    })}
                    type="text"
                    id="code"
                    className="form-input flex-1"
                    placeholder="ROOM101"
                    disabled={isLoading}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const codeInput = document.getElementById('code') as HTMLInputElement
                      if (codeInput) {
                        codeInput.value = generateRoomCode()
                      }
                    }}
                    className="btn-secondary px-3 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Generate
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-sm text-danger-600">{errors.code.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Others will use this code to join your room
                </p>
              </div>

              <div>
                <label htmlFor="currency" className="form-label">
                  Currency
                </label>
                <div className="relative">
                  <select
                    {...register('currency', {
                      required: 'Currency is required'
                    })}
                    id="currency"
                    className="form-input pl-10"
                    disabled={isLoading}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.currency && (
                  <p className="mt-1 text-sm text-danger-600">{errors.currency.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Create Room
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-6 card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll be automatically added to the room</li>
              <li>• Share the room code with your roommates</li>
              <li>• Start creating bills and splitting expenses</li>
              <li>• Track who owes what in real-time</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}