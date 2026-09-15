import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting HeritageVault Automated API & RBAC Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail ? JSON.stringify(detail) : '');
      failed++;
    }
  }

  // 1. Health & Public Showcase
  const health = await request('/api/health');
  assert(health.status === 200 && health.data.status === 'healthy', 'Health check /api/health returns 200 healthy');

  const publicShowcase = await request('/api/public/showcase');
  assert(
    publicShowcase.status === 200 && publicShowcase.data.museum?.museum_code === 'CHN-MUS-001',
    'Public Showcase /api/public/showcase returns Government Museum Chennai',
    publicShowcase.data
  );
  assert(
    publicShowcase.data.featuredArtifacts?.length > 0,
    `Public Showcase returned ${publicShowcase.data.featuredArtifacts?.length} featured artifacts`
  );

  // 2. Authentication Tests
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@heritagevault.com', password: 'Admin@123' },
  });
  assert(adminLogin.status === 200 && adminLogin.data.user?.role === 'admin', 'Admin login successful');
  const adminToken = adminLogin.data.token;

  const curatorLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'curator@heritagevault.com', password: 'Curator@123' },
  });
  assert(curatorLogin.status === 200 && curatorLogin.data.user?.role === 'curator', 'Curator login successful');
  const curatorToken = curatorLogin.data.token;

  const conservatorLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'conservator@heritagevault.com', password: 'Conservator@123' },
  });
  assert(conservatorLogin.status === 200 && conservatorLogin.data.user?.role === 'conservator', 'Conservator login successful');
  const conservatorToken = conservatorLogin.data.token;

  const staffLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'staff@heritagevault.com', password: 'Staff@123' },
  });
  assert(staffLogin.status === 200 && staffLogin.data.user?.role === 'staff', 'Staff login successful');
  const staffToken = staffLogin.data.token;

  // Invalid password test
  const invalidLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@heritagevault.com', password: 'WrongPassword' },
  });
  assert(invalidLogin.status === 401, 'Invalid password correctly returns 401 Unauthorized');

  // 3. RBAC Enforcement Tests (Specified in User Requirements)
  // Conservator attempting POST /api/artifacts -> MUST return 403
  const conservatorArtifactAttempt = await request('/api/artifacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${conservatorToken}` },
    body: { name: 'Test Artifact', category: 'Sculpture', location: 'Gallery A' },
  });
  assert(
    conservatorArtifactAttempt.status === 403,
    'Conservator attempting POST /api/artifacts returns 403 Forbidden'
  );

  // Curator attempting POST /api/conservation -> MUST return 403
  const curatorConservationAttempt = await request('/api/conservation', {
    method: 'POST',
    headers: { Authorization: `Bearer ${curatorToken}` },
    body: { artifact_id: 1, conservation_date: '2026-09-15', conservator: 'Test', treatment: 'Test' },
  });
  assert(
    curatorConservationAttempt.status === 403,
    'Curator attempting POST /api/conservation returns 403 Forbidden'
  );

  // Curator attempting POST /api/restoration -> MUST return 403
  const curatorRestorationAttempt = await request('/api/restoration', {
    method: 'POST',
    headers: { Authorization: `Bearer ${curatorToken}` },
    body: { artifact_id: 1, restoration_date: '2026-09-15', restored_by: 'Test', restoration_type: 'Test' },
  });
  assert(
    curatorRestorationAttempt.status === 403,
    'Curator attempting POST /api/restoration returns 403 Forbidden'
  );

  // Staff attempting POST /api/artifacts -> MUST return 403
  const staffArtifactAttempt = await request('/api/artifacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: { name: 'Staff Artifact', category: 'Sculpture', location: 'Gallery B' },
  });
  assert(
    staffArtifactAttempt.status === 403,
    'Staff attempting POST /api/artifacts returns 403 Forbidden'
  );

  // Staff attempting GET /api/reports -> MUST return 403 (Admin only)
  const staffReportAttempt = await request('/api/reports', {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(
    staffReportAttempt.status === 403,
    'Staff attempting GET /api/reports returns 403 Forbidden (Admin only)'
  );

  // Unauthenticated request attempting GET /api/artifacts without token -> MUST return 401
  const unauthArtifactAttempt = await request('/api/artifacts');
  assert(
    unauthArtifactAttempt.status === 401,
    'Unauthenticated request to protected endpoint returns 401 Unauthorized'
  );

  // 4. Artifact CRUD Operations (Curator / Admin)
  const createArtRes = await request('/api/artifacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${curatorToken}` },
    body: {
      name: 'Pallava Bronze Somaskanda',
      category: 'Sculpture',
      period: 'Pallava Dynasty (8th Century CE)',
      origin: 'Kanchipuram, Tamil Nadu',
      material: 'Bronze',
      condition: 'Good',
      location: 'Bronze Wing - Showcase 12',
      acquisition_date: '1965-05-20',
      description: 'Rare early Pallava bronze casting portraying Shiva and Uma with infant Skanda.',
    },
  });
  assert(createArtRes.status === 201 && createArtRes.data.artifact?.id, 'Curator created new artifact record');
  const newArtId = createArtRes.data.artifact?.id;

  // Edit Artifact
  const editArtRes = await request(`/api/artifacts/${newArtId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${curatorToken}` },
    body: {
      name: 'Pallava Bronze Somaskanda (Restored)',
      category: 'Sculpture',
      period: 'Pallava Dynasty (8th Century CE)',
      origin: 'Kanchipuram, Tamil Nadu',
      material: 'Bronze (Panchaloha)',
      condition: 'Pristine',
      location: 'Bronze Wing - Showcase 12',
      acquisition_date: '1965-05-20',
      description: 'Rare early Pallava bronze casting portraying Shiva and Uma with infant Skanda.',
    },
  });
  assert(editArtRes.status === 200 && editArtRes.data.artifact?.name.includes('Restored'), 'Artifact updated successfully');

  // 5. Conservation Record Operations (Conservator)
  const createConsRes = await request('/api/conservation', {
    method: 'POST',
    headers: { Authorization: `Bearer ${conservatorToken}` },
    body: {
      artifact_id: newArtId,
      conservation_date: '2026-09-15',
      conservator: 'Arunmozhi Varman',
      condition_before: 'Fair',
      condition_after: 'Good',
      treatment: 'Ultrasonic passivation and benzotriazole stabilization on bronze alloy surface.',
      notes: 'Maintained at 42% Relative Humidity.',
    },
  });
  assert(createConsRes.status === 201, 'Conservator logged conservation record successfully');

  // 6. Restoration Record Operations (Conservator)
  const createRestRes = await request('/api/restoration', {
    method: 'POST',
    headers: { Authorization: `Bearer ${conservatorToken}` },
    body: {
      artifact_id: newArtId,
      restoration_date: '2026-09-15',
      restored_by: 'State Metallurgy Lab',
      restoration_type: 'Micro-patina stabilization',
      description: 'Laser cleaning of cuprite encrustation.',
      cost: 15000,
      status: 'Completed',
    },
  });
  assert(createRestRes.status === 201, 'Conservator logged restoration project successfully');

  // 7. Visitor Record Operations (Staff)
  const createVisRes = await request('/api/visitors', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: {
      visit_date: '2026-09-15',
      visitor_count: 520,
    },
  });
  assert(createVisRes.status === 201, 'Staff logged daily visitor count');

  // 8. Analytics & Summary
  const summaryRes = await request('/api/analytics/summary', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    summaryRes.status === 200 && summaryRes.data.summary?.totalArtifacts > 0,
    'Analytics summary retrieved with real database aggregates'
  );

  const visAnalytics = await request('/api/analytics/visitors', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    visAnalytics.status === 200 && visAnalytics.data.weekdayAverages?.length === 7,
    'Visitor analytics calculates day-of-week distributions'
  );

  // 9. Reports Generation (Admin)
  const reportRes = await request('/api/reports?reportType=artifacts', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    reportRes.status === 200 && reportRes.data.report?.museum?.code === 'CHN-MUS-001',
    'Official Artifact Inventory Report generated for Government Museum Chennai'
  );

  // 10. Clean up test artifact (Curator / Admin)
  const deleteArtRes = await request(`/api/artifacts/${newArtId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteArtRes.status === 200, 'Admin deleted test artifact record');

  console.log('\n====================================================');
  console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
