import { supabase, Bill, BillParticipant, Payment } from './supabase'

export interface CreateBillData {
  roomId: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  createdBy: string
  participantIds: string[]
}

export interface CreatePaymentData {
  billId: string
  payerId: string
  amount: number
  paymentMethod?: string
  notes?: string
}

export class BillService {
  static async createBill(data: CreateBillData): Promise<Bill> {
    // Create the bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert([
        {
          room_id: data.roomId,
          title: data.title,
          description: data.description,
          total_amount: data.totalAmount,
          currency: data.currency,
          created_by: data.createdBy
        }
      ])
      .select()
      .single()

    if (billError) {
      throw new Error(billError.message)
    }

    // Calculate equal share for each participant
    const shareAmount = data.totalAmount / data.participantIds.length

    // Add participants
    const participantInserts = data.participantIds.map(userId => ({
      bill_id: bill.id,
      user_id: userId,
      share_amount: shareAmount
    }))

    const { error: participantError } = await supabase
      .from('bill_participants')
      .insert(participantInserts)

    if (participantError) {
      // Clean up the bill if participant insertion fails
      await supabase.from('bills').delete().eq('id', bill.id)
      throw new Error(participantError.message)
    }

    return bill
  }

  static async addPayment(data: CreatePaymentData): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([
        {
          bill_id: data.billId,
          payer_id: data.payerId,
          amount: data.amount,
          payment_method: data.paymentMethod,
          notes: data.notes
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Check if bill is fully paid and update settlement status
    await this.updateBillSettlementStatus(data.billId)

    return payment
  }

  static async updateBillSettlementStatus(billId: string): Promise<void> {
    // Get bill total and total payments
    const { data: billData, error: billError } = await supabase
      .from('bill_details')
      .select('*')
      .eq('id', billId)
      .single()

    if (billError || !billData) {
      return
    }

    const isSettled = billData.total_paid >= billData.total_amount

    if (isSettled !== billData.is_settled) {
      await supabase
        .from('bills')
        .update({ 
          is_settled: isSettled,
          settled_at: isSettled ? new Date().toISOString() : null
        })
        .eq('id', billId)
    }
  }

  static async getRoomBills(roomId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bill_details')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  static async getBillDetails(billId: string): Promise<{
    bill: Bill
    participants: BillParticipant[]
    payments: Payment[]
  }> {
    // Get bill details
    const { data: bill, error: billError } = await supabase
      .from('bill_details')
      .select('*')
      .eq('id', billId)
      .single()

    if (billError || !bill) {
      throw new Error('Bill not found')
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('bill_participants')
      .select(`
        *,
        user:users(id, username, email)
      `)
      .eq('bill_id', billId)

    if (participantsError) {
      throw new Error(participantsError.message)
    }

    // Get payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        payer:users(id, username, email)
      `)
      .eq('bill_id', billId)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      throw new Error(paymentsError.message)
    }

    return {
      bill,
      participants: participants || [],
      payments: payments || []
    }
  }

  static async deleteBill(billId: string): Promise<void> {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId)

    if (error) {
      throw new Error(error.message)
    }
  }

  static async updateBill(billId: string, updates: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', billId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async deletePayment(paymentId: string): Promise<void> {
    // Get the bill ID before deleting payment
    const { data: payment } = await supabase
      .from('payments')
      .select('bill_id')
      .eq('id', paymentId)
      .single()

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)

    if (error) {
      throw new Error(error.message)
    }

    // Update bill settlement status
    if (payment?.bill_id) {
      await this.updateBillSettlementStatus(payment.bill_id)
    }
  }
}