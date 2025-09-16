-- RoomLedger Database Schema for Supabase
-- This schema supports room-based expense sharing with flexible bill splitting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table - represents shared living spaces
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- Unique room code for joining (e.g., "ROOM101")
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table - roommates who can join rooms
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room members - many-to-many relationship between users and rooms
CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(room_id, user_id)
);

-- Bills table - represents shared expenses
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- Bill participants - who is involved in splitting this bill
CREATE TABLE bill_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Their equal share of the bill
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bill_id, user_id)
);

-- Payments table - tracks who paid what amount for each bill
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50), -- 'cash', 'card', 'upi', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settlements table - tracks debt settlements between users
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_created_by ON bills(created_by);
CREATE INDEX idx_bill_participants_bill_id ON bill_participants(bill_id);
CREATE INDEX idx_bill_participants_user_id ON bill_participants(user_id);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_settlements_room_id ON settlements(room_id);
CREATE INDEX idx_settlements_from_user ON settlements(from_user_id);
CREATE INDEX idx_settlements_to_user ON settlements(to_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user balances in a room
CREATE OR REPLACE FUNCTION calculate_user_balance(
    p_user_id UUID,
    p_room_id UUID
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_paid DECIMAL(10, 2) DEFAULT 0;
    total_owed DECIMAL(10, 2) DEFAULT 0;
    balance DECIMAL(10, 2);
BEGIN
    -- Calculate total amount paid by user
    SELECT COALESCE(SUM(p.amount), 0) INTO total_paid
    FROM payments p
    JOIN bills b ON p.bill_id = b.id
    WHERE p.payer_id = p_user_id AND b.room_id = p_room_id;
    
    -- Calculate total amount user owes (their share of all bills they participated in)
    SELECT COALESCE(SUM(bp.share_amount), 0) INTO total_owed
    FROM bill_participants bp
    JOIN bills b ON bp.bill_id = b.id
    WHERE bp.user_id = p_user_id AND b.room_id = p_room_id;
    
    balance := total_paid - total_owed;
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- View for user balances summary
CREATE VIEW user_balances AS
SELECT 
    rm.room_id,
    rm.user_id,
    u.username,
    r.name as room_name,
    calculate_user_balance(rm.user_id, rm.room_id) as balance,
    r.currency
FROM room_members rm
JOIN users u ON rm.user_id = u.id
JOIN rooms r ON rm.room_id = r.id
WHERE rm.is_active = TRUE;

-- View for bill details with payment status
CREATE VIEW bill_details AS
SELECT 
    b.id,
    b.room_id,
    b.title,
    b.description,
    b.total_amount,
    b.currency,
    b.created_by,
    u.username as created_by_username,
    b.created_at,
    b.is_settled,
    COALESCE(SUM(p.amount), 0) as total_paid,
    b.total_amount - COALESCE(SUM(p.amount), 0) as remaining_amount,
    COUNT(DISTINCT bp.user_id) as participant_count
FROM bills b
JOIN users u ON b.created_by = u.id
LEFT JOIN payments p ON b.id = p.bill_id
LEFT JOIN bill_participants bp ON b.id = bp.bill_id
GROUP BY b.id, b.room_id, b.title, b.description, b.total_amount, 
         b.currency, b.created_by, u.username, b.created_at, b.is_settled;

-- Insert sample data for testing (optional)
-- INSERT INTO rooms (name, code) VALUES ('Apartment 101', 'ROOM101');
-- INSERT INTO users (email, username, password_hash) VALUES 
--     ('user1@example.com', 'Alice', '$2b$10$example_hash_1'),
--     ('user2@example.com', 'Bob', '$2b$10$example_hash_2');