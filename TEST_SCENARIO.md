# 🧪 RoomLedger Test Scenario

## 📋 **Test Scenario: Roommate Expense Tracking**

### **Scenario Setup:**
4 roommates sharing an apartment with various expenses

### **Characters:**
- **Ali** (Admin) - Computer Science student
- **Sara** - Medical student  
- **Ahmed** - Engineering student
- **Fatima** - Business student

---

## 🏠 **Step 1: Create Group**

1. **Go to RoomLedger app**
2. **Click "Create Group"**
3. **Fill in details:**
   - **Group Name:** Room 101
   - **Admin Name:** Ali
   - **Group Password:** roommates2024
   - **Default Currency:** PKR — Pakistani Rupee
4. **Add Members:**
   - Sara
   - Ahmed  
   - Fatima
5. **Click "Create Group & Start Tracking"**

---

## 💰 **Step 2: Add Expenses**

### **Expense #1: Groceries**
- **Description:** Weekly groceries
- **Who Paid:** Ali
- **Amount:** PKR 2,000
- **Split Between:** Ali, Sara, Ahmed, Fatima (all 4)
- **Result:** Each owes Ali PKR 500

### **Expense #2: Electricity Bill**
- **Description:** Monthly electricity
- **Who Paid:** Sara
- **Amount:** PKR 1,600
- **Split Between:** Ali, Sara, Ahmed, Fatima (all 4)
- **Result:** Each owes Sara PKR 400

### **Expense #3: Internet Bill**
- **Description:** Monthly internet
- **Who Paid:** Ahmed
- **Amount:** PKR 1,200
- **Split Between:** Ali, Sara, Ahmed, Fatima (all 4)
- **Result:** Each owes Ahmed PKR 300

### **Expense #4: Cleaning Supplies**
- **Description:** Household cleaning items
- **Who Paid:** Fatima
- **Amount:** PKR 800
- **Split Between:** Ali, Sara, Ahmed, Fatima (all 4)
- **Result:** Each owes Fatima PKR 200

---

## 📊 **Expected Balances After All Expenses:**

| Person | Paid For | Owed To Others | Net Balance |
|--------|----------|----------------|-------------|
| **Ali** | PKR 2,000 | PKR 1,400 | **+PKR 600** |
| **Sara** | PKR 1,600 | PKR 1,400 | **+PKR 200** |
| **Ahmed** | PKR 1,200 | PKR 1,400 | **-PKR 200** |
| **Fatima** | PKR 800 | PKR 1,400 | **-PKR 600** |

---

## 🧮 **Step 3: Smart Settlement**

### **Expected Settlement Result:**
The smart algorithm should calculate **2 optimal payments** instead of 4 separate transactions:

1. **Ahmed pays Ali PKR 200**
2. **Fatima pays Ali PKR 600**

### **Why This is Optimal:**
- **Without Smart Settlement:** 4 separate payments needed
- **With Smart Settlement:** Only 2 payments needed
- **Efficiency:** 50% reduction in transactions

---

## ✅ **Step 4: Verify Results**

### **Check Current Balances Tab:**
- Should show Ali: +PKR 600 (is owed)
- Should show Sara: +PKR 200 (is owed)  
- Should show Ahmed: -PKR 200 (owes)
- Should show Fatima: -PKR 600 (owes)

### **Check Settlement Calculation:**
- Should show 2 payment steps
- Should show total amount: PKR 800
- Should show optimization statistics

### **Check History Tab:**
- Should show settlement record
- Should show transaction count: 2
- Should show total amount: PKR 800

---

## 🎯 **Test Additional Features:**

### **Member Management:**
1. **Add new member:** "Zara"
2. **Remove member:** Try removing "Ahmed" (should fail if not admin)
3. **Verify member list** shows all 5 members

### **Edge Cases:**
1. **Zero balance:** Add expense where everyone pays equal amounts
2. **Single payer:** Add expense where only one person pays
3. **Large amounts:** Test with PKR 10,000+ expenses

---

## 🚨 **Expected Error Handling:**

### **Form Validation:**
- Empty fields should show error messages
- Invalid amounts should be rejected
- Duplicate member names should be prevented

### **Network Errors:**
- Supabase connection issues should show helpful messages
- Serverless function errors should be handled gracefully

---

## 📱 **Mobile Testing:**

### **Responsive Design:**
- App should work on mobile browsers
- Touch interactions should be smooth
- Text should be readable on small screens

---

## 🎨 **UI/UX Testing:**

### **Visual Feedback:**
- Loading states should be clear
- Success/error messages should be prominent
- Color coding should be intuitive (green for positive, red for negative)

### **Accessibility:**
- Tab navigation should work
- Screen readers should work
- Keyboard navigation should work

---

## 📈 **Performance Testing:**

### **Load Times:**
- Initial page load: < 3 seconds
- Settlement calculation: < 2 seconds
- Member operations: < 1 second

### **Data Handling:**
- Large groups (10+ members) should work
- Many transactions should not slow down
- Settlement calculation should remain fast

---

## 🏆 **Success Criteria:**

✅ **All expenses recorded correctly**  
✅ **Balances calculated accurately**  
✅ **Smart settlement finds optimal solution**  
✅ **UI is intuitive and beautiful**  
✅ **Mobile experience is smooth**  
✅ **Error handling is graceful**  
✅ **Performance is fast**  

**Your RoomLedger app should handle this scenario perfectly! 🎉** 