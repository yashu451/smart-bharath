const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./server');
const request = require('http');

// Helper to make local requests to Express app
const makeRequest = (server, method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const data = body ? JSON.stringify(body) : null;
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = request.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => {
          resData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(resData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('\n======================================================');
  console.log('STARTING SMART BHARAT FULL PERSISTENCE & ISOLATION E2E TEST');
  console.log('======================================================\n');

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const port = server.address().port;
  console.log(`Test Express server running on ephemeral port ${port}`);

  try {
    const timestamp = Date.now();
    const user1Email = `citizen_${timestamp}@smartbharat.gov.in`;
    const user1Mobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const user1Password = 'SecurePass@123';
    const user1Pin = '123456';

    // 1. REGISTER USER 1
    console.log('\n[TEST 1] Register User 1...');
    const regRes = await makeRequest(server, 'POST', '/api/auth/register', {
      name: 'Ramesh Kumar',
      email: user1Email,
      mobile: user1Mobile,
      password: user1Password,
      pin: user1Pin,
      aadhaar: '998877665544',
    });
    assert.strictEqual(regRes.status, 201, `User 1 registration failed: ${JSON.stringify(regRes.data)}`);
    assert(regRes.data.token, 'Token must be returned');
    const token1 = regRes.data.token;
    const user1Id = regRes.data.user.id;
    console.log(`✓ User 1 registered successfully (ID: ${user1Id})`);

    // 2. LOGIN USER 1
    console.log('\n[TEST 2] Login User 1 with PIN...');
    const loginRes = await makeRequest(server, 'POST', '/api/auth/login', {
      identifier: user1Mobile,
      pin: user1Pin,
    });
    assert.strictEqual(loginRes.status, 200, 'User 1 login failed');
    assert(loginRes.data.token, 'Login must return token');
    console.log('✓ User 1 authenticated successfully');

    // 3. BOOK AN OFFICE VISIT APPOINTMENT
    console.log('\n[TEST 3] Book Office Visit Appointment for User 1...');
    const aptDate = '2026-11-25';
    const aptTime = '10:30 AM';
    const bookRes = await makeRequest(
      server,
      'POST',
      '/api/dashboard/activities',
      {
        type: 'appointment',
        title: 'Regional Passport Office (RPO) - South Wing',
        subtitle: 'Passport Renewal • 2026-11-25, 10:30 AM',
        token: `Token: APT-SB-${timestamp.toString().slice(-6)}`,
        status: 'Upcoming',
        statusColor: '#000080',
        statusBg: '#EEF2FF',
        icon: '🛂',
        route: '/appointments/confirmation',
        metadata: {
          deptId: 'passport',
          service: 'Passport Renewal',
          date: aptDate,
          time: aptTime,
          location: 'Regional Passport Office (RPO) - South Wing',
        },
      },
      token1
    );
    assert.strictEqual(bookRes.status, 201, 'Booking appointment failed');
    const appointmentId = bookRes.data.activity._id;
    console.log(`✓ Appointment recorded (Activity ID: ${appointmentId})`);

    // 4. FILE A CIVIC GRIEVANCE
    console.log('\n[TEST 4] Save Civic Grievance for User 1...');
    const refNumber = `GCC-2026-${timestamp.toString().slice(-5)}`;
    const grievRes = await makeRequest(
      server,
      'POST',
      '/api/grievances',
      {
        title: 'Damaged Road and Potholes on Anna Salai',
        category: 'Roads & Footpaths',
        state: 'Tamil Nadu',
        district: 'Chennai',
        city: 'Chennai',
        exactLocation: 'Near Gemini Flyover, Anna Salai',
        description: 'Large deep potholes causing traffic congestion and accidents.',
        authorityName: 'Greater Chennai Corporation (GCC)',
        portalName: 'Namma Chennai Citizen Grievance Portal',
        portalUrl: 'https://chennaicorporation.gov.in',
        referenceNumber: refNumber,
        expectedTimelineDays: 14,
        officialTimelineNotice: 'GCC Citizen Charter standard resolution time is 14 days.',
        citizenStatus: 'In Review',
        initialNote: 'Filed on official Namma Chennai portal; tracking started.',
      },
      token1
    );
    assert.strictEqual(grievRes.status, 201, 'Creating grievance failed');
    const grievanceId = grievRes.data.grievance._id;
    console.log(`✓ Grievance saved (ID: ${grievanceId}, Ref: ${refNumber})`);

    // 5. UPLOAD A DIGILOCKER DOCUMENT
    console.log('\n[TEST 5] Upload DigiLocker Document for User 1...');
    const dummyBase64 = Buffer.from('Smart Bharat Citizen Verification Document Content').toString('base64');
    const docRes = await makeRequest(
      server,
      'POST',
      '/api/documents',
      {
        name: 'Driving Licence',
        category: 'Driving & Vehicle',
        originalFilename: 'driving_licence.pdf',
        mimeType: 'application/pdf',
        base64Data: dummyBase64,
        description: 'Verified Transport Department Document',
      },
      token1
    );
    assert.strictEqual(docRes.status, 201, 'Uploading document failed');
    const documentId = docRes.data.document._id;
    console.log(`✓ Document uploaded (ID: ${documentId})`);

    // 6. SAVE & APPLY A SCHEME
    console.log('\n[TEST 6] Save and Apply Scheme for User 1...');
    const saveSchemeRes = await makeRequest(
      server,
      'POST',
      '/api/schemes/save',
      {
        schemeId: 'pm-scholarship',
        name: 'PM Scholarship Scheme (PMSS)',
        category: 'Education',
        description: 'Financial assistance for professional higher education.',
        applicationUrl: 'https://scholarships.gov.in',
        officialWebsite: 'https://desw.gov.in',
        benefits: '₹3,000 per month for female students, ₹2,500 per month for male students.',
        hasOnlineApplication: true,
      },
      token1
    );
    assert.strictEqual(saveSchemeRes.status, 201, 'Saving scheme failed');
    console.log('✓ Scheme bookmarked in My Schemes');

    const checkSavedRes = await makeRequest(server, 'GET', '/api/schemes/check/pm-scholarship', null, token1);
    assert.strictEqual(checkSavedRes.status, 200);
    assert.strictEqual(checkSavedRes.data.isSaved, true, 'Scheme must be reported as saved');
    console.log('✓ Scheme check verified (isSaved: true)');

    const applySchemeRes = await makeRequest(
      server,
      'POST',
      '/api/schemes/apply',
      {
        schemeId: 'pm-scholarship',
        name: 'PM Scholarship Scheme (PMSS)',
        category: 'Education',
        applicationUrl: 'https://scholarships.gov.in',
      },
      token1
    );
    assert.strictEqual(applySchemeRes.status, 201, 'Applying scheme failed');
    console.log('✓ Scheme application recorded in Activity history');

    // 7. AI ASSISTANT QUERY
    console.log('\n[TEST 7] Send AI Assistant Query for User 1...');
    const chatRes = await makeRequest(
      server,
      'POST',
      '/api/chat',
      {
        sender: 'user',
        text: 'How do I renew my driving licence in Karnataka?',
        suggestedAction: 'Book Office Visit',
      },
      token1
    );
    assert.strictEqual(chatRes.status, 201, 'Chat message save failed');
    console.log('✓ Chat query saved and recorded in Activity history');

    // 8. VERIFY CENTRALIZED ACTIVITY HISTORY & TYPE FILTERING
    console.log('\n[TEST 8] Verify Centralized Activity History & Type Filtering for User 1...');
    const allActsRes = await makeRequest(server, 'GET', '/api/dashboard/activities', null, token1);
    assert.strictEqual(allActsRes.status, 200);
    const acts = allActsRes.data.activities;
    console.log(`Total activities recorded for User 1: ${acts.length}`);
    assert(acts.length >= 5, `Expected at least 5 activities, got ${acts.length}`);

    const actTypes = new Set(acts.map((a) => a.type));
    console.log('Recorded activity types:', Array.from(actTypes));
    assert(actTypes.has('appointment'), 'Must have appointment activity');
    assert(actTypes.has('grievance'), 'Must have grievance activity');
    assert(actTypes.has('scheme'), 'Must have scheme activity');
    assert(actTypes.has('document'), 'Must have document activity');
    assert(actTypes.has('assistant'), 'Must have assistant activity');

    // Test specific filters
    const filterAptRes = await makeRequest(server, 'GET', '/api/dashboard/activities?type=appointment', null, token1);
    assert(filterAptRes.data.activities.every((a) => a.type === 'appointment'), 'Filter must return only appointments');

    const filterGrievRes = await makeRequest(server, 'GET', '/api/dashboard/activities?type=grievance', null, token1);
    assert(filterGrievRes.data.activities.every((a) => a.type === 'grievance'), 'Filter must return only grievances');

    const filterSchemeRes = await makeRequest(server, 'GET', '/api/dashboard/activities?type=scheme', null, token1);
    assert(filterSchemeRes.data.activities.every((a) => a.type === 'scheme'), 'Filter must return only schemes');

    const filterAssistantRes = await makeRequest(server, 'GET', '/api/dashboard/activities?type=assistant', null, token1);
    assert(filterAssistantRes.data.activities.every((a) => a.type === 'assistant'), 'Filter must return only assistant');
    console.log('✓ Centralized Activity History and all type filters verified');

    // 9. VERIFY DASHBOARD AGGREGATE & COUNTDOWNS
    console.log('\n[TEST 9] Verify Dashboard Stats and Countdowns...');
    const dashRes = await makeRequest(server, 'GET', '/api/dashboard', null, token1);
    assert.strictEqual(dashRes.status, 200);
    assert(dashRes.data.stats.appointments >= 1, 'Appointments count must be >= 1');
    assert(dashRes.data.stats.grievances >= 1, 'Grievances count must be >= 1');
    assert(dashRes.data.stats.schemes >= 1, 'Schemes count must be >= 1');
    assert(dashRes.data.stats.documents >= 1, 'Documents count must be >= 1');
    assert(dashRes.data.upcomingAppointments.length >= 1, 'Must have upcoming appointments');
    assert(dashRes.data.upcomingAppointments[0].countdown, 'Must compute countdown dynamically');
    console.log('✓ Dashboard stats & appointment countdown verified');

    // 10. HISTORICAL MIGRATION
    console.log('\n[TEST 10] Test Historical Records Migration & Deduplication...');
    const mockHistorical = [
      {
        type: 'appointment',
        title: 'Regional Passport Office (RPO) - South Wing',
        subtitle: 'Passport Renewal • 2026-11-25, 10:30 AM',
        token: `Token: APT-SB-${timestamp.toString().slice(-6)}`, // Exact existing duplicate
        metadata: { date: aptDate },
      },
      {
        type: 'appointment',
        title: 'Transport Department (RTO) - North Bay Track',
        subtitle: 'Permanent DL Driving Track Test • 2026-11-28, 11:00 AM',
        token: `Token: APT-HIST-${timestamp.toString().slice(-4)}`,
        metadata: { date: '2026-11-28', time: '11:00 AM' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    const migRes = await makeRequest(server, 'POST', '/api/dashboard/migrate-history', { history: mockHistorical }, token1);
    assert.strictEqual(migRes.status, 200);
    assert.strictEqual(migRes.data.migratedCount, 1, 'Should migrate exactly 1 non-duplicate record');
    console.log('✓ Historical migration verified: duplicate skipped, non-duplicate safely migrated');

    // 11. STRICT USER ISOLATION
    console.log('\n[TEST 11] Test Strict User Isolation with New User 2...');
    const user2Email = `citizen2_${timestamp}@smartbharat.gov.in`;
    const user2Mobile = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const reg2Res = await makeRequest(server, 'POST', '/api/auth/register', {
      name: 'Sunita Sharma',
      email: user2Email,
      mobile: user2Mobile,
      password: 'User2Pass@123',
      pin: '654321',
    });
    assert.strictEqual(reg2Res.status, 201);
    const token2 = reg2Res.data.token;
    const user2Id = reg2Res.data.user.id;
    console.log(`✓ User 2 registered (ID: ${user2Id})`);

    // Verify User 2 has ZERO records
    const u2Acts = await makeRequest(server, 'GET', '/api/dashboard/activities', null, token2);
    assert.strictEqual(u2Acts.data.total, 0, 'New user must start with 0 activities');

    const u2Docs = await makeRequest(server, 'GET', '/api/documents', null, token2);
    assert.strictEqual(u2Docs.data.count, 0, 'New user must start with 0 documents');

    const u2Griev = await makeRequest(server, 'GET', '/api/grievances', null, token2);
    assert.strictEqual(u2Griev.data.count, 0, 'New user must start with 0 grievances');

    const u2Schemes = await makeRequest(server, 'GET', '/api/schemes/saved', null, token2);
    assert.strictEqual(u2Schemes.data.count, 0, 'New user must start with 0 saved schemes');

    const u2Chat = await makeRequest(server, 'GET', '/api/chat', null, token2);
    assert.strictEqual(u2Chat.data.count, 0, 'New user must start with 0 chat messages');
    console.log('✓ New User 2 starts with 100% clean, empty records');

    // 12. LOGOUT & RELOGIN USER 1 -> VERIFY ALL DATA INTACT
    console.log('\n[TEST 12] Logout simulation & re-login User 1...');
    const reloginRes = await makeRequest(server, 'POST', '/api/auth/login', {
      identifier: user1Email,
      password: user1Password,
    });
    assert.strictEqual(reloginRes.status, 200);
    const freshToken1 = reloginRes.data.token;

    const u1RestoredActs = await makeRequest(server, 'GET', '/api/dashboard/activities', null, freshToken1);
    assert(u1RestoredActs.data.total >= 6, `User 1 must retain all records after re-login (got ${u1RestoredActs.data.total})`);

    const u1RestoredDocs = await makeRequest(server, 'GET', '/api/documents', null, freshToken1);
    assert.strictEqual(u1RestoredDocs.data.count, 1, 'User 1 must retain their document');

    const u1RestoredGriev = await makeRequest(server, 'GET', '/api/grievances', null, freshToken1);
    assert.strictEqual(u1RestoredGriev.data.count, 1, 'User 1 must retain their grievance');

    const u1RestoredSchemes = await makeRequest(server, 'GET', '/api/schemes/saved', null, freshToken1);
    assert.strictEqual(u1RestoredSchemes.data.count, 1, 'User 1 must retain their saved scheme');

    const u1RestoredChat = await makeRequest(server, 'GET', '/api/chat', null, freshToken1);
    assert.strictEqual(u1RestoredChat.data.count, 1, 'User 1 must retain their chat message');
    console.log('✓ 100% of User 1 records successfully restored upon re-login!');

    console.log('\n======================================================');
    console.log('ALL PERSISTENCE AND ISOLATION TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED WITH ERROR:');
  console.error(err);
  process.exit(1);
});

