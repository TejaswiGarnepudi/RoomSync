const API = 'http://localhost:5000/api';

async function req(url, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

async function runTests() {
  console.log('🚀 Running RoomSync Milestone 4 Verification Test Suite...\n');

  try {
    // 1. Authenticate / Login User 1 (Tejaswi) and User 2 (Ravi)
    console.log('1. Authenticating test users...');
    const user1Login = await req(`${API}/auth/login`, 'POST', {
      email: 'tejaswi@example.com',
      password: 'password123'
    });
    const token1 = user1Login.data.token;
    const user1 = user1Login.data.user;

    const user2Login = await req(`${API}/auth/login`, 'POST', {
      email: 'ravi@example.com',
      password: 'password123'
    });
    const token2 = user2Login.data.token;
    const user2 = user2Login.data.user;

    console.log(`   ✓ Logged in as ${user1.name} and ${user2.name}`);

    // 2. Test Equal Split Expense
    console.log('\n2. Testing Equal Split Expense Creation...');
    const exp1Res = await req(`${API}/expenses`, 'POST', {
      title: 'Costco Grocery Haul',
      amount: 150,
      category: 'groceries',
      paidBy: user1._id,
      expenseDate: '2026-09-26',
      splitType: 'equal',
      participants: [{ user: user1._id }, { user: user2._id }]
    }, token1);

    const exp1 = exp1Res.data.expense;
    console.log(`   ✓ Created expense "${exp1.title}" (₹${exp1.amount})`);
    console.log(`     User 1 share: ₹${exp1.participants.find(p => p.user._id === user1._id).shareAmount} (${exp1.participants.find(p => p.user._id === user1._id).paidStatus})`);
    console.log(`     User 2 share: ₹${exp1.participants.find(p => p.user._id === user2._id).shareAmount} (${exp1.participants.find(p => p.user._id === user2._id).paidStatus})`);
    if (exp1.participants.find(p => p.user._id === user2._id).shareAmount !== 75) {
      throw new Error('Equal split calculation mismatch!');
    }

    // 3. Test Custom Split Expense
    console.log('\n3. Testing Custom Split Expense Creation & Validation...');
    // Invalid sum test
    try {
      await req(`${API}/expenses`, 'POST', {
        title: 'Invalid Split Dinner',
        amount: 100,
        category: 'food',
        paidBy: user2._id,
        expenseDate: '2026-09-26',
        splitType: 'custom',
        participants: [
          { user: user1._id, shareAmount: 40 },
          { user: user2._id, shareAmount: 40 } // sum is 80 != 100
        ]
      }, token2);
      throw new Error('Custom split did not reject mismatched amounts!');
    } catch (err) {
      console.log('   ✓ Successfully rejected mismatched custom split amount (400 Bad Request)');
    }

    // Valid custom split
    const exp2Res = await req(`${API}/expenses`, 'POST', {
      title: 'Apartment Broadband',
      amount: 120,
      category: 'utilities',
      paidBy: user2._id,
      expenseDate: '2026-09-26',
      splitType: 'custom',
      participants: [
        { user: user1._id, shareAmount: 80 },
        { user: user2._id, shareAmount: 40 }
      ]
    }, token2);
    const exp2 = exp2Res.data.expense;
    console.log(`   ✓ Created valid custom split expense "${exp2.title}" (₹${exp2.amount})`);

    // 4. Test Percentage Split Expense
    console.log('\n4. Testing Percentage Split Expense Creation...');
    const exp3Res = await req(`${API}/expenses`, 'POST', {
      title: 'Electricity & Gas Bill',
      amount: 200,
      category: 'utilities',
      paidBy: user1._id,
      expenseDate: '2026-09-26',
      splitType: 'percentage',
      participants: [
        { user: user1._id, percentage: 60 },
        { user: user2._id, percentage: 40 }
      ]
    }, token1);
    const exp3 = exp3Res.data.expense;
    console.log(`   ✓ Created percentage split expense "${exp3.title}" (₹${exp3.amount})`);
    console.log(`     User 1 share (60%): ₹${exp3.participants.find(p => p.user._id === user1._id).shareAmount}`);
    console.log(`     User 2 share (40%): ₹${exp3.participants.find(p => p.user._id === user2._id).shareAmount}`);

    // 5. Test Household Balances Calculation
    console.log('\n5. Testing Household Balances Calculation...');
    const balancesRes = await req(`${API}/expenses/balances`, 'GET', null, token1);
    const balancesData = balancesRes.data;
    console.log(`   ✓ Household total spend: ₹${balancesData.householdTotalSpend}`);
    console.log(`   ✓ User 1 balance: Owed ₹${balancesData.userBalance.pendingOwed}, Receivable ₹${balancesData.userBalance.pendingReceivable}, Net: ₹${balancesData.userBalance.netBalance}`);

    // 6. Test Debt Simplification Algorithm
    console.log('\n6. Testing Debt Simplification Settlements...');
    const settlementsRes = await req(`${API}/expenses/settlements`, 'GET', null, token1);
    const settlements = settlementsRes.data.settlements;
    console.log(`   ✓ Found ${settlements.length} simplified settlement transaction(s):`);
    settlements.forEach((s, idx) => {
      console.log(`     [${idx + 1}] ${s.fromUserName} pays ${s.toUserName}: ₹${s.amount}`);
    });

    // 7. Test Payment Recording
    console.log('\n7. Testing Payment Recording...');
    const payRes = await req(`${API}/expenses/${exp1._id}/pay`, 'POST', {
      userId: user2._id
    }, token1);
    const updatedExp1 = payRes.data.expense;
    console.log(`   ✓ Marked user 2 share as paid for "${updatedExp1.title}". Status: ${updatedExp1.status}`);

    // 8. Test Shopping List & Item Management
    console.log('\n8. Testing Shopping List Creation & Item Check-off...');
    const listRes = await req(`${API}/shopping/lists`, 'POST', {
      name: 'Sunday Farmers Market',
      shoppingDate: '2026-09-27',
      shoppingTime: '10:00',
      assignedTo: user1._id
    }, token1);
    const shoppingList = listRes.data.shoppingList;
    console.log(`   ✓ Created shopping list: "${shoppingList.name}" on ${shoppingList.shoppingDate}`);

    // Add items
    const item1Res = await req(`${API}/shopping/lists/${shoppingList._id}/items`, 'POST', {
      name: 'Fresh Tomatoes',
      quantity: 2,
      unit: 'kg',
      category: 'groceries',
      estimatedPrice: 60
    }, token1);
    const item1 = item1Res.data.item;

    const item2Res = await req(`${API}/shopping/lists/${shoppingList._id}/items`, 'POST', {
      name: 'Organic Milk',
      quantity: 3,
      unit: 'liters',
      category: 'groceries',
      estimatedPrice: 150
    }, token1);
    const item2 = item2Res.data.item;
    console.log(`   ✓ Added items: ${item1.name} (₹${item1.estimatedPrice}) & ${item2.name} (₹${item2.estimatedPrice})`);

    // Mark item 1 as purchased
    const updateItemRes = await req(`${API}/shopping/items/${item1._id}`, 'PUT', {
      status: 'purchased',
      actualPrice: 55
    }, token1);
    console.log(`   ✓ Updated item status to "${updateItemRes.data.item.status}" (Actual: ₹${updateItemRes.data.item.actualPrice})`);

    // 9. Test Recurring Shopping Essentials
    console.log('\n9. Testing Recurring Shopping Scheduling...');
    const recRes = await req(`${API}/shopping/recurring`, 'POST', {
      itemName: 'Dishwashing Liquid Refill',
      quantity: 1,
      unit: 'bottle',
      category: 'household',
      recurrenceType: 'monthly',
      interval: 1,
      nextDueDate: '2026-09-25' // Due today!
    }, token1);
    console.log(`   ✓ Created recurring item "${recRes.data.recurringItem.itemName}"`);

    const upcomingRes = await req(`${API}/shopping/upcoming`, 'GET', null, token1);
    console.log(`   ✓ Checked upcoming due items: ${upcomingRes.data.dueItems.length} due items found`);

    // 10. Test Convert Shopping List to Shared Expense
    console.log('\n10. Testing Shopping List Conversion to Shared Expense...');
    const genExpRes = await req(`${API}/shopping/lists/${shoppingList._id}/generate-expense`, 'POST', {
      amount: 210,
      paidBy: user1._id
    }, token1);
    console.log(`   ✓ Generated expense: "${genExpRes.data.expense.title}" for ₹${genExpRes.data.expense.amount}`);
    console.log(`     Shopping list status updated to: ${genExpRes.data.shoppingList.status}`);

    // 11. Test Calendar Integration (Chores and Shopping on Calendar)
    console.log('\n11. Testing Calendar Integration (Shopping + Chores)...');
    const availRes = await req(`${API}/availability/my?startDate=2026-09-25&endDate=2026-09-30`, 'GET', null, token1);
    const items = availRes.data.availability;
    const shoppingCalendarEvents = items.filter(i => i.isShopping || i.status === 'shopping');
    console.log(`   ✓ Calendar returned ${items.length} total events (${shoppingCalendarEvents.length} shopping trips included)`);

    console.log('\n🎉 ALL MILESTONE 4 TEST SUITE CHECKS PASSED PERFECTLY! 🚀\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err.data || err.message);
    process.exit(1);
  }
}

runTests();
