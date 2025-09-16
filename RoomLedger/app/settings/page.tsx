'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ArrowLeft, User, LogOut, Shield, HelpCircle, Info } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
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
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="mobile-container pb-20">
          {/* User Profile */}
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary-600 font-bold text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* Account Settings */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
              <div className="space-y-2">
                <Link 
                  href="/settings/profile" 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Edit Profile</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </Link>
                
                <Link 
                  href="/settings/security" 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Security</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <div className="space-y-2">
                <Link 
                  href="/settings/help" 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <HelpCircle className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Help & FAQ</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </Link>
                
                <Link 
                  href="/settings/about" 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">About</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Logout */}
            <div className="card">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>RoomLedger v1.0.0</p>
            <p>Made with ❤️ for roommates</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}