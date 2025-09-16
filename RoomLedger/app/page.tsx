'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ArrowRight, Users, Calculator, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="mobile-header bg-transparent border-none">
        <div className="flex items-center">
          <Calculator className="w-8 h-8 text-primary-600 mr-2" />
          <h1 className="text-xl font-bold text-primary-900">RoomLedger</h1>
        </div>
        <Link href="/auth/login" className="btn-primary">
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="mobile-container pt-8">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Split Bills with Your Roommates
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Stop the hassle of calculating who owes what. RoomLedger makes expense sharing simple, fair, and transparent.
          </p>

          <div className="space-y-4">
            <Link href="/auth/register" className="btn-primary w-full py-3 text-base">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <Link href="/auth/login" className="btn-secondary w-full py-3 text-base">
              Sign In to Your Room
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-6 mb-12">
          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Room-Based Groups</h3>
                <p className="text-gray-600 text-sm">Create or join rooms with your roommates using simple room codes.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-success-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Smart Bill Splitting</h3>
                <p className="text-gray-600 text-sm">Automatically calculate fair shares, even when people pay different amounts.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Mobile-First Design</h3>
                <p className="text-gray-600 text-sm">Optimized for mobile use - track expenses on the go.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Scenario */}
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-primary-800">
            <p>• 3 roommates go out to eat (Bill: $60)</p>
            <p>• Alice pays $40, Bob pays $20, Charlie pays $0</p>
            <p>• RoomLedger calculates: Each owes $20</p>
            <p>• Result: Charlie owes Alice $20, Alice gets $20 back</p>
          </div>
        </div>
      </main>
    </div>
  )
}