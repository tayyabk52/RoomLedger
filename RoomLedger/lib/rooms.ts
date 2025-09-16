import { supabase, Room, RoomMember, UserBalance } from './supabase'

export class RoomService {
  static async createRoom(name: string, code: string, currency: string = 'USD'): Promise<Room> {
    // Check if room code already exists
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (existingRoom) {
      throw new Error('Room code already exists')
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert([
        {
          name,
          code: code.toUpperCase(),
          currency
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async joinRoom(userId: string, roomCode: string): Promise<RoomMember> {
    // Find room by code
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single()

    if (roomError || !room) {
      throw new Error('Room not found')
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      if (!existingMember.is_active) {
        // Reactivate membership
        const { data, error } = await supabase
          .from('room_members')
          .update({ is_active: true })
          .eq('id', existingMember.id)
          .select()
          .single()

        if (error) {
          throw new Error(error.message)
        }
        return data
      }
      throw new Error('You are already a member of this room')
    }

    // Add user to room
    const { data, error } = await supabase
      .from('room_members')
      .insert([
        {
          room_id: room.id,
          user_id: userId
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async getUserRooms(userId: string): Promise<RoomMember[]> {
    const { data, error } = await supabase
      .from('room_members')
      .select(`
        *,
        room:rooms(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  static async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const { data, error } = await supabase
      .from('room_members')
      .select(`
        *,
        user:users(id, username, email)
      `)
      .eq('room_id', roomId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  static async getRoomBalances(roomId: string): Promise<UserBalance[]> {
    const { data, error } = await supabase
      .from('user_balances')
      .select('*')
      .eq('room_id', roomId)
      .order('username', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  static async leaveRoom(userId: string, roomId: string): Promise<void> {
    const { error } = await supabase
      .from('room_members')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('room_id', roomId)

    if (error) {
      throw new Error(error.message)
    }
  }

  static async updateRoomSettings(roomId: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}