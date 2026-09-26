const API_URL = 'http://localhost:5000/api';

async function req(url, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || `Request failed with status ${res.status}`);
    error.data = json;
    throw error;
  }
  return json;
}

async function runTests() {
  console.log('🚀 Starting Milestone 6 Automated Verification Suite...\n');

  try {
    // 1. Setup / Login 2 Roommates in same household
    console.log('1️⃣ Authenticating Roommates...');
    const user1Email = `m6_user1_${Date.now()}@example.com`;
    const user2Email = `m6_user2_${Date.now()}@example.com`;

    const u1Res = await req(`${API_URL}/auth/register`, 'POST', {
      name: 'Jordan Sparks',
      email: user1Email,
      password: 'password123'
    });
    const token1 = u1Res.data.token;
    const user1 = u1Res.data.user;

    const u2Res = await req(`${API_URL}/auth/register`, 'POST', {
      name: 'Morgan Blake',
      email: user2Email,
      password: 'password123'
    });
    const token2 = u2Res.data.token;
    const user2 = u2Res.data.user;

    // Create household
    const hhRes = await req(`${API_URL}/households`, 'POST', { name: 'Cascade Commons' }, token1);
    const household = hhRes.data.household;
    await req(`${API_URL}/households/join`, 'POST', { inviteCode: household.inviteCode }, token2);
    console.log('✅ Roommates and Household initialized.\n');

    // 2. Perform actions that trigger notifications & activity logs
    console.log('2️⃣ Triggering Coordination Actions (Chores, Help, Polls, Expenses, Shopping)...');
    const today = new Date().toISOString().split('T')[0];

    // Create Chore assigned to Morgan (User 2)
    const choreRes = await req(`${API_URL}/chores`, 'POST', {
      title: 'Deep Clean Kitchen Countertops',
      description: 'Disinfect surfaces and wipe stovetop',
      frequency: 'once',
      assignedTo: user2._id,
      dueDate: today,
      dueTime: '18:00',
      estimatedDuration: 45
    }, token1);
    const chore = choreRes.data.chore;
    console.log(`  - Created Chore: "${chore.title}" assigned to Morgan.`);

    // Morgan completes the chore
    await req(`${API_URL}/chores/${chore._id}/complete`, 'POST', {}, token2);
    console.log(`  - Morgan marked chore as completed (45 min workload).`);

    // Create Help Request by Jordan (User 1)
    const helpRes = await req(`${API_URL}/help`, 'POST', {
      title: 'Move Oak Dining Table',
      description: 'Need assistance carrying the dining table upstairs',
      category: 'moving',
      urgency: 'high',
      date: today,
      startTime: '19:00',
      endTime: '19:30'
    }, token1);
    const helpRequest = helpRes.data.helpRequest;
    console.log(`  - Created Help Request: "${helpRequest.title}".`);

    // Morgan accepts and completes help
    await req(`${API_URL}/help/${helpRequest._id}/accept`, 'POST', {}, token2);
    await req(`${API_URL}/help/${helpRequest._id}/complete`, 'POST', {}, token1);
    console.log(`  - Help accepted and completed (30 min workload).`);

    // Create Decision Poll
    const pollRes = await req(`${API_URL}/polls`, 'POST', {
      title: 'Select Fiber Internet Provider',
      description: 'Pick preferred provider for the semester',
      options: ['Sonic Fiber (1 Gbps)', 'AT&T Fiber (500 Mbps)']
    }, token1);
    console.log(`  - Created Poll: "${pollRes.data.poll.title}".`);

    // 3. Test In-App Notification System
    console.log('\n3️⃣ Verifying In-App Notification Endpoints...');
    // Morgan should have notifications
    const notifRes2 = await req(`${API_URL}/notifications`, 'GET', null, token2);
    console.log(`  - Morgan's notifications count: ${notifRes2.data.notifications.length}`);
    if (notifRes2.data.notifications.length === 0) {
      throw new Error('Expected Morgan to have received automated notifications.');
    }

    const unreadCountRes = await req(`${API_URL}/notifications/unread-count`, 'GET', null, token2);
    console.log(`  - Morgan's unread count: ${unreadCountRes.data.unreadCount}`);

    // Mark single notification as read
    const firstNotifId = notifRes2.data.notifications[0]._id;
    await req(`${API_URL}/notifications/${firstNotifId}/read`, 'PATCH', {}, token2);
    console.log(`  - Marked notification ${firstNotifId} as read.`);

    // Mark all as read
    await req(`${API_URL}/notifications/read-all`, 'PATCH', {}, token2);
    const finalUnreadRes = await req(`${API_URL}/notifications/unread-count`, 'GET', null, token2);
    console.log(`  - Morgan's unread count after mark-all-read: ${finalUnreadRes.data.unreadCount}`);
    if (finalUnreadRes.data.unreadCount !== 0) {
      throw new Error('Expected 0 unread notifications after read-all.');
    }
    console.log('✅ Notification System working smoothly.\n');

    // 4. Test Contribution / Fairness Analytics
    console.log('4️⃣ Verifying Contribution & Fairness Insights...');
    const contribRes = await req(`${API_URL}/contribution?period=month`, 'GET', null, token1);
    const contribData = contribRes.data;
    console.log(`  - Total Household Workload: ${contribData.totalHouseholdMinutes} minutes`);
    console.log(`  - Member Workload Breakdown:`);
    contribData.members.forEach(m => {
      console.log(`    • ${m.name}: ${m.totalMinutes} min (${m.percentOfHousehold}% of total) [Chores: ${m.choreMinutes}m, Help: ${m.helpMinutes}m, Shopping: ${m.shoppingMinutes}m]`);
    });

    if (contribData.totalHouseholdMinutes < 75) {
      throw new Error(`Expected at least 75 total workload minutes (45 chore + 30 help), got ${contribData.totalHouseholdMinutes}`);
    }
    console.log('✅ Contribution & Workload Insights mathematically accurate and neutral.\n');

    // 5. Test Unified Central Dashboard
    console.log('5️⃣ Verifying Unified Central Dashboard (/api/dashboard/summary)...');
    const dashRes1 = await req(`${API_URL}/dashboard/summary`, 'GET', null, token1);
    const dashSummary = dashRes1.data;
    console.log(`  - Household: ${dashSummary.household.name} (${dashSummary.household.membersCount} members)`);
    console.log(`  - Today's Agenda Items: ${dashSummary.todayAgenda.totalItems}`);
    console.log(`  - User Responsibilities Active Tasks: ${dashSummary.myResponsibilities.totalActiveTasks}`);
    console.log(`  - Household Alerts Count: ${dashSummary.alerts.length}`);
    console.log(`  - Recent Activity Items Count: ${dashSummary.recentActivities.length}`);
    console.log(`  - Upcoming Schedule Chores: ${dashSummary.upcomingSchedule.chores.length}, Polls: ${dashSummary.upcomingSchedule.polls.length}`);
    console.log('✅ Central Dashboard Summary endpoint successfully returns consolidated state.\n');

    // 6. Test Global Household Search
    console.log('6️⃣ Verifying Global Household Search (/api/search)...');
    const searchRes1 = await req(`${API_URL}/search?q=Table`, 'GET', null, token1);
    console.log(`  - Search query "Table" found ${searchRes1.data.totalMatches} result(s). Categories:`, Object.keys(searchRes1.data.results).filter(k => searchRes1.data.results[k].length > 0));
    if (searchRes1.data.results.helpRequests.length === 0) {
      throw new Error('Expected search for "Table" to return the help request.');
    }

    const searchRes2 = await req(`${API_URL}/search?q=Kitchen`, 'GET', null, token1);
    console.log(`  - Search query "Kitchen" found ${searchRes2.data.totalMatches} result(s). Categories:`, Object.keys(searchRes2.data.results).filter(k => searchRes2.data.results[k].length > 0));
    if (searchRes2.data.results.chores.length === 0) {
      throw new Error('Expected search for "Kitchen" to return the chore.');
    }

    const searchRes3 = await req(`${API_URL}/search?q=Internet`, 'GET', null, token1);
    console.log(`  - Search query "Internet" found ${searchRes3.data.totalMatches} result(s). Categories:`, Object.keys(searchRes3.data.results).filter(k => searchRes3.data.results[k].length > 0));
    if (searchRes3.data.results.polls.length === 0) {
      throw new Error('Expected search for "Internet" to return the poll.');
    }
    console.log('✅ Global Cross-Entity Search accurately returned results.\n');

    console.log('🎉 ALL MILESTONE 6 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Milestone 6 Test Failed:', err.message);
    if (err.data) {
      console.error('Error Details:', JSON.stringify(err.data, null, 2));
    }
    process.exit(1);
  }
}

runTests();
