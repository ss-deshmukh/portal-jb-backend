const { performance } = require('perf_hooks');

// Test timing and reporting
const testMetrics = {
  startTime: null,
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: []
};

// Initialize metrics
const initializeTestMetrics = () => {
  testMetrics.startTime = performance.now();
  testMetrics.totalTests = 0;
  testMetrics.passedTests = 0;
  testMetrics.failedTests = 0;
  testMetrics.results = [];
};

// Record test result
const recordTestResult = (name, status, error = null) => {
  testMetrics.totalTests++;
  if (status === 'passed') {
    testMetrics.passedTests++;
  } else {
    testMetrics.failedTests++;
  }
  testMetrics.results.push({ name, status, error });
};

// Generate test report
const generateReport = () => {
  testMetrics.endTime = performance.now();
  const totalDuration = testMetrics.endTime - testMetrics.startTime;

  console.log('\n=== Integration Test Report ===');
  console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
  console.log(`Total Tests: ${testMetrics.totalTests}`);
  console.log(`Passed: ${testMetrics.passedTests}`);
  console.log(`Failed: ${testMetrics.failedTests}`);
  console.log('\nDetailed Results:');
  
  testMetrics.results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  Status: ${result.status}`);
    if (result.error) {
      console.log(`  Error: ${result.error.message}`);
    }
  });
};

module.exports = {
  initializeTestMetrics,
  recordTestResult,
  generateReport
}; 