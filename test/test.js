const { powerAnalysis, sampleSizeDurationConversion } = require('../index');
const assert = require('assert');

// Examples 1a and 1b
try {
  const params = {
    effect: 0.01, control_mean: 100, control_sd: 10,
    alpha: 0.05, power: 0.80, round: true, decimal: 4
  }
  const result1a = powerAnalysis(params);
  assert.strictEqual(result1a, 3139.5519);
  console.log('Test 1a passed')
} catch (error) {
  console.error('Test 1a failed', error);
}
try {
  const params = {
    sample_size: 3139.5519, output: "effect", 
    control_mean: 100, control_sd: 10,
    alpha: 0.05, power: 0.80, round: true, decimal: 2
  }
  const result1b = powerAnalysis(params);
  assert.strictEqual(result1b, 0.01);
  console.log('Test 1b passed')
} catch (error) {
  console.error('Test 1b failed', error);
}
try {
  const params = {
    sample_size: 3139.5519, exposure_rate: 100,
    round: true, decimal: 4
  }
  const result1c = sampleSizeDurationConversion(params);
  assert.strictEqual(result1c, 31.3955);
  console.log('Test 1c passed')
} catch (error) {
  console.error('Test 1c failed', error);
}
try {
  const params = {
    duration: 31.3955, exposure_rate: 100,
    output: "sample_size", round: true, decimal: 2
  }
  const result1c = sampleSizeDurationConversion(params);
  assert.strictEqual(result1c, 3139.55);
  console.log('Test 1d passed')
} catch (error) {
  console.error('Test 1d failed', error);
}

// Examples 2a and 2b
try {
  const params = {
    effect: 0.01, control_mean: 100, control_sd: 10,
    alpha: 0.05, power: 0.80, treat_prop: 0.70,
    round: true, decimal: 4
  }
  const result = powerAnalysis(params);
  assert.strictEqual(result, 3737.5618);
  console.log('Test 2a passed')
} catch (error) {
  console.error('Test 2a failed', error);
}
try {
  const params = {
    sample_size: 3737.5618, output: "effect",
    control_mean: 100, control_sd: 10,
    alpha: 0.05, power: 0.80, treat_prop: 0.70,
    round: true, decimal: 2
  }
  const result = powerAnalysis(params);
  assert.strictEqual(result, 0.01);
  console.log('Test 2b passed')
} catch (error) {
  console.error('Test 2b failed', error);
}
