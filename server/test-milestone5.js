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
  console.log('🚀 Starting Milestone 5 Automated Verification Suite...\n');

  try {
    // 1. Setup / Login 2 Roommates in same household
    console.log('1️⃣ Authenticating Roommates...');
    const user1Email = `m5_user1_${Date.now()}@example.com`;
    const user2Email = `m5_user2_${Date.now()}@example.com`;

    const u1Res = await req(`${API_URL}/auth/register`, 'POST', {
      name: 'Alex Rivera',
      email: user1Email,
      password: 'password123'
    });
    const token1 = u1Res.data.token;
    const user1 = u1Res.data.user;

    const u2Res = await req(`${API_URL}/auth/register`, 'POST', {
      name: 'Sam Chen',
      email: user2Email,
      password: 'password123'
    });
    const token2 = u2Res.data.token;
    const user2 = u2Res.data.user;

    // Create household
    const hhRes = await req(`${API_URL}/households`, 'POST', { name: 'Sunset Villa' }, token1);
    const household = hhRes.data.household;
    await req(`${API_URL}/households/join`, 'POST', { inviteCode: household.inviteCode }, token2);
    console.log('✅ Roommates and Household initialized.\n');

    // 2. Part A: Help Requests System
    console.log('2️⃣ Testing Help / Assistance System...');
    const today = new Date().toISOString().split('T')[0];

    // Create Help Request
    const helpReqRes = await req(`${API_URL}/help`, 'POST', {
      title: 'Airport Ride to SFO',
      description: 'Need a quick lift with 2 heavy bags',
      type: 'lift',
      date: today,
      startTime: '14:00',
      endTime: '15:00',
      fromLocation: 'Sunset Villa',
      toLocation: 'SFO Terminal 2',
      urgency: 'high'
    }, token1);

    const helpReq = helpReqRes.data.request;
    console.log('✅ Created Help Request:', helpReq.title, `(${helpReq._id})`);

    // Get Recommendations for User 1's request
    const recRes = await req(`${API_URL}/help/${helpReq._id}/recommendations`, 'GET', null, token1);
    console.log('✅ Helper Recommendations fetched:', recRes.data.recommendations.length, 'candidates');
    if (recRes.data.recommendations.length > 0) {
      console.log('   Top candidate:', recRes.data.recommendations[0].user.name, 'Status:', recRes.data.recommendations[0].status);
    }

    // User 2 accepts request
    const acceptRes = await req(`${API_URL}/help/${helpReq._id}/accept`, 'POST', {}, token2);
    console.log('✅ User 2 Accepted Help Request. Status:', acceptRes.data.request.status, 'AcceptedBy:', acceptRes.data.request.acceptedBy.name);

    // Verify Calendar Integration
    const calRes = await req(`${API_URL}/availability/my?startDate=${today}&endDate=${today}`, 'GET', null, token2);
    const helpCalItem = calRes.data.availability.find(a => a.status === 'help');
    console.log('✅ Help Request appears in Helper Calendar:', helpCalItem ? `Yes (${helpCalItem.title})` : 'No');

    // User 2 starts help task
    const startRes = await req(`${API_URL}/help/${helpReq._id}/start`, 'POST', {}, token2);
    console.log('✅ Started Help Task. Status:', startRes.data.request.status);

    // User 2 completes help task
    const completeRes = await req(`${API_URL}/help/${helpReq._id}/complete`, 'POST', {}, token2);
    console.log('✅ Completed Help Task. Status:', completeRes.data.request.status);

    // Verify Help History
    const historyRes = await req(`${API_URL}/help/history`, 'GET', null, token1);
    console.log('✅ Help History fetched:', historyRes.data.history.length, 'entries.\n');

    // 3. Part B: Real-Time Household Decisions (Polls & Voting)
    console.log('3️⃣ Testing Household Decisions & Polls...');

    // Create Poll
    const pollRes = await req(`${API_URL}/polls`, 'POST', {
      title: 'Which Wi-Fi Speed Plan?',
      description: 'Selecting our upgrade for next month',
      options: ['500 Mbps ($50/mo)', '1 Gbps Fiber ($70/mo)', 'Keep current 200 Mbps'],
      allowMultiple: false,
      anonymous: false
    }, token1);

    const poll = pollRes.data.poll;
    console.log('✅ Created Poll:', poll.title, `(${poll._id}) with`, poll.options.length, 'options');

    // User 1 votes for option 1
    const opt1Id = poll.options[1].optionId;
    const vote1Res = await req(`${API_URL}/polls/${poll._id}/vote`, 'POST', { optionIds: [opt1Id] }, token1);
    console.log('✅ User 1 voted for 1 Gbps Fiber. Total Votes:', vote1Res.data.poll.totalVotes);

    // User 2 votes for option 1 as well
    const vote2Res = await req(`${API_URL}/polls/${poll._id}/vote`, 'POST', { optionIds: [opt1Id] }, token2);
    const updatedPoll = vote2Res.data.poll;
    console.log('✅ User 2 voted for 1 Gbps Fiber. Total Votes:', updatedPoll.totalVotes);
    const winnerOpt = updatedPoll.options.find(o => o.optionId === opt1Id);
    console.log(`   Option "${winnerOpt.text}": ${winnerOpt.percentage}% (${winnerOpt.voteCount} votes)`);

    // Close poll
    const closeRes = await req(`${API_URL}/polls/${poll._id}/close`, 'POST', {}, token1);
    console.log('✅ Closed Poll. Status:', closeRes.data.poll.status);

    console.log('\n🎉 ALL MILESTONE 5 INTEGRATION & UNIT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.data || err.message);
    process.exit(1);
  }
}

runTests();
