import { powerAnalysis, sampleSizeDurationConversion } from './index';
import * as assert from 'assert';

// Examples 1a and 1b
try {
  const params1a = {
    effect: 0.01,
    control_mean: 100,
    control_sd: 10,
    alpha: 0.05,
    power: 0.8,
    round: true,
    decimal: 4,
  };
  const result1a = powerAnalysis(params1a);
  assert.strictEqual(result1a, 3139.5519);
  console.log('Test 1a passed');
} catch (error) {
  console.error('Test 1a failed', error);
}

try {
  const params1b = {
    sample_size: 3139.5519,
    output: 'effect' as const,
    control_mean: 100,
    control_sd: 10,
    alpha: 0.05,
    power: 0.8,
    round: true,
    decimal: 2,
  };
  const result1b = powerAnalysis(params1b);
  assert.strictEqual(result1b, 0.01);
  console.log('Test 1b passed');
} catch (error) {
  console.error('Test 1b failed', error);
}

// Examples 1c and 1d
try {
  const params1c = {
    sample_size: 3139.5519,
    exposure_rate: 100,
    round: true,
    decimal: 4,
  };
  const result1c = sampleSizeDurationConversion(params1c);
  assert.strictEqual(result1c, 31.3955);
  console.log('Test 1c passed');
} catch (error) {
  console.error('Test 1c failed', error);
}

try {
  const params1d = {
    duration: 31.3955,
    exposure_rate: 100,
    output: 'sample_size' as const,
    round: true,
    decimal: 2,
  };
  const result1d = sampleSizeDurationConversion(params1d);
  assert.strictEqual(result1d, 3139.55);
  console.log('Test 1d passed');
} catch (error) {
  console.error('Test 1d failed', error);
}

// Examples 2a and 2b
try {
  const params2a = {
    effect: 0.01,
    control_mean: 100,
    control_sd: 10,
    alpha: 0.05,
    power: 0.8,
    treat_prop: 0.7,
    round: true,
    decimal: 4,
  };
  const result2a = powerAnalysis(params2a);
  assert.strictEqual(result2a, 3737.5618);
  console.log('Test 2a passed');
} catch (error) {
  console.error('Test 2a failed', error);
}

try {
  const params2b = {
    sample_size: 3737.5618,
    output: 'effect' as const,
    control_mean: 100,
    control_sd: 10,
    alpha: 0.05,
    power: 0.8,
    treat_prop: 0.7,
    round: true,
    decimal: 2,
  };
  const result2b = powerAnalysis(params2b);
  assert.strictEqual(result2b, 0.01);
  console.log('Test 2b passed');
} catch (error) {
  console.error('Test 2b failed', error);
}
