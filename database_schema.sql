-- RoomLedger Enhanced Database Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- Create groups table
CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    password TEXT NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'PKR',
    timezone VARCHAR(50) DEFAULT 'Asia/Karachi',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, username)
);

-- Create expense_categories table (for future categorization)
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#667eea',
    icon TEXT DEFAULT '💰',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table (enhanced)
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES expense_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    notes TEXT,
    from_member_id BIGINT REFERENCES group_members(id),
    to_member_id BIGINT REFERENCES group_members(id),
    amount DECIMAL(15,2) NOT NULL,
    original_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'PKR',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    settled BOOLEAN DEFAULT FALSE,
    transaction_type VARCHAR(20) DEFAULT 'expense', -- 'expense', 'payment', 'transfer'
    payment_method VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'mobile_payment'
    receipt_url TEXT,
    location TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT REFERENCES group_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settlements table (enhanced)
CREATE TABLE settlements (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    settlement_data JSONB NOT NULL,
    algorithm_used VARCHAR(50) DEFAULT 'greedy',
    optimization_metrics JSONB,
    total_amount DECIMAL(15,2),
    transaction_count INTEGER,
    efficiency_percentage DECIMAL(5,2),
    notes TEXT,
    created_by BIGINT REFERENCES group_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_expenses table (future feature)
CREATE TABLE recurring_expenses (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES expense_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    frequency_interval INTEGER DEFAULT 1, -- every X days/weeks/months
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE,
    auto_create BOOLEAN DEFAULT FALSE,
    split_equally BOOLEAN DEFAULT TRUE,
    assigned_members JSONB, -- Array of member IDs
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES group_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table (future feature)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES group_members(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'expense_added', 'settlement_due', 'payment_received', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table (for tracking changes)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES group_members(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'settle'
    entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'member', 'settlement'
    entity_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_invites table (future feature for better onboarding)
CREATE TABLE group_invites (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    invited_by BIGINT REFERENCES group_members(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by BIGINT REFERENCES group_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Groups are viewable by anyone" ON groups FOR SELECT USING (true);
CREATE POLICY "Groups can be inserted by anyone" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Groups can be updated by anyone" ON groups FOR UPDATE USING (true);

CREATE POLICY "Group members are viewable by anyone" ON group_members FOR SELECT USING (true);
CREATE POLICY "Group members can be inserted by anyone" ON group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Group members can be updated by anyone" ON group_members FOR UPDATE USING (true);
CREATE POLICY "Group members can be deleted by anyone" ON group_members FOR DELETE USING (true);

CREATE POLICY "Categories are viewable by anyone" ON expense_categories FOR SELECT USING (true);
CREATE POLICY "Categories can be managed by anyone" ON expense_categories FOR ALL USING (true);

CREATE POLICY "Transactions are viewable by anyone" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions can be inserted by anyone" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Transactions can be updated by anyone" ON transactions FOR UPDATE USING (true);

CREATE POLICY "Settlements are viewable by anyone" ON settlements FOR SELECT USING (true);
CREATE POLICY "Settlements can be inserted by anyone" ON settlements FOR INSERT WITH CHECK (true);

CREATE POLICY "Recurring expenses are manageable by anyone" ON recurring_expenses FOR ALL USING (true);
CREATE POLICY "Notifications are manageable by anyone" ON notifications FOR ALL USING (true);
CREATE POLICY "Audit log is viewable by anyone" ON audit_log FOR SELECT USING (true);
CREATE POLICY "Audit log can be inserted by anyone" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Group invites are manageable by anyone" ON group_invites FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_username ON group_members(group_id, username);
CREATE INDEX idx_group_members_active ON group_members(group_id, is_active);

CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_settled ON transactions(group_id, settled);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_member ON transactions(from_member_id);
CREATE INDEX idx_transactions_member_to ON transactions(to_member_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);

CREATE INDEX idx_settlements_group_id ON settlements(group_id);
CREATE INDEX idx_settlements_created_at ON settlements(created_at DESC);

CREATE INDEX idx_categories_group_id ON expense_categories(group_id);
CREATE INDEX idx_recurring_group_id ON recurring_expenses(group_id);
CREATE INDEX idx_recurring_active ON recurring_expenses(group_id, is_active);
CREATE INDEX idx_recurring_due_date ON recurring_expenses(next_due_date);

CREATE INDEX idx_notifications_member ON notifications(member_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX idx_audit_log_group_id ON audit_log(group_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

CREATE INDEX idx_invites_code ON group_invites(invite_code);
CREATE INDEX idx_invites_group ON group_invites(group_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON group_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default expense categories
INSERT INTO expense_categories (group_id, name, description, color, icon, is_default) VALUES
(NULL, 'Food & Dining', 'Restaurants, groceries, takeout', '#ff6b6b', '🍽️', true),
(NULL, 'Transportation', 'Uber, gas, parking, public transport', '#4ecdc4', '🚗', true),
(NULL, 'Utilities', 'Electricity, water, internet, phone', '#45b7d1', '💡', true),
(NULL, 'Entertainment', 'Movies, games, events, subscriptions', '#96ceb4', '🎬', true),
(NULL, 'Shopping', 'Clothes, electronics, household items', '#feca57', '🛍️', true),
(NULL, 'Health & Medical', 'Doctor visits, medicines, gym', '#ff9ff3', '🏥', true),
(NULL, 'Travel', 'Hotels, flights, vacation expenses', '#54a0ff', '✈️', true),
(NULL, 'Other', 'Miscellaneous expenses', '#5f27cd', '📝', true);

-- Create function to automatically create default categories for new groups
CREATE OR REPLACE FUNCTION create_default_categories_for_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO expense_categories (group_id, name, description, color, icon, is_default)
    SELECT NEW.id, name, description, color, icon, false
    FROM expense_categories 
    WHERE group_id IS NULL AND is_default = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create categories for new groups
CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION create_default_categories_for_group();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (group_id, member_id, action, entity_type, entity_id, new_data)
        VALUES (NEW.group_id, NEW.created_by, 'create', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (group_id, member_id, action, entity_type, entity_id, old_data, new_data)
        VALUES (NEW.group_id, NEW.created_by, 'update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (group_id, action, entity_type, entity_id, old_data)
        VALUES (OLD.group_id, 'delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_settlements_trigger
    AFTER INSERT OR UPDATE OR DELETE ON settlements
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create views for common queries
CREATE VIEW member_balances AS
SELECT 
    gm.group_id,
    gm.id as member_id,
    gm.username,
    gm.display_name,
    COALESCE(owed_to_me.amount, 0) - COALESCE(i_owe.amount, 0) as net_balance,
    COALESCE(owed_to_me.amount, 0) as total_owed_to_me,
    COALESCE(i_owe.amount, 0) as total_i_owe
FROM group_members gm
LEFT JOIN (
    SELECT to_member_id, SUM(amount) as amount
    FROM transactions 
    WHERE settled = false
    GROUP BY to_member_id
) owed_to_me ON gm.id = owed_to_me.to_member_id
LEFT JOIN (
    SELECT from_member_id, SUM(amount) as amount
    FROM transactions 
    WHERE settled = false
    GROUP BY from_member_id
) i_owe ON gm.id = i_owe.from_member_id
WHERE gm.is_active = true;

-- Create view for recent activity
CREATE VIEW recent_activity AS
SELECT 
    'transaction' as activity_type,
    t.id as activity_id,
    t.group_id,
    t.description as title,
    'Transaction added: ' || t.description as description,
    t.amount,
    fm.username as from_member,
    tm.username as to_member,
    t.created_at,
    t.created_by
FROM transactions t
LEFT JOIN group_members fm ON t.from_member_id = fm.id
LEFT JOIN group_members tm ON t.to_member_id = tm.id
UNION ALL
SELECT 
    'settlement' as activity_type,
    s.id as activity_id,
    s.group_id,
    'Settlement completed' as title,
    'Smart settlement with ' || s.transaction_count || ' payments' as description,
    s.total_amount,
    NULL as from_member,
    NULL as to_member,
    s.created_at,
    s.created_by
FROM settlements s
ORDER BY created_at DESC;
