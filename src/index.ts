import { round as mathRound } from 'mathjs';
// @ts-ignore
import { jStat } from 'jstat';

/**
 * Perform power analysis to compute sample size given effect or effect given sample size.
 * Parameters are passed as an object with the following components:
 * effect: Minimum detectable effect (MDE) to compute the minimum required sample size (MRSS)
 *   when output = "sample_size".
 * sample_size: MRSS to compute the MDE when output = "effect".
 * control_mean: Mean of the control arm.
 * control_sd: Standard deviation (SD) of the control arm.
 * output: Output type for the power analysis; specify:
 *   "sample_size" to compute sample size given effect (default); or
 *   "effect" to compute effect given sample size.
 * analysis_type: Type of analysis; specify:
 *   "power" for power analysis (default); or
 *   "precision" for precision analysis (can be thought of as a power analysis with power = 0.50).
 * effect_type: Type of effect; specify:
 *   "absolute" for absolute effect, treatment mean minus control mean;
 *   "relative" for relative effect, absolute effect / control mean (default); or
 *   "effect_size" for effect size, absolute effect / control SD.
 * alternative: Type of alternative for hypothesis test; specify:
 *   "one_sided" for a one-sided alternative hypothesis; or
 *   "two_sided" for a two-sided alternative hypothesis (default).
 * alpha: The significance level (upper limit of the false positive rate) of the hypothesis test
 *   (defaults to 0.05).
 * power: The power (one minus the false negative rate) of the hypothesis test (default to 0.80).
 * treat_prop: Proportion of traffic allocation to treatment arm; we assume there are only two
 *   experiment arms—the treatment and control arms.
 * round: Whether to round the output value.
 * decimal: Number of decimal places to round the output value.
 */
function powerAnalysis({
  effect = null,
  sample_size = null,
  control_mean = null,
  control_sd = null,
  output = 'sample_size',
  analysis_type = 'power',
  effect_type = 'relative',
  alternative = 'two_sided',
  alpha = 0.05,
  power = 0.8,
  treat_prop = 0.5,
  round = true,
  decimal = 0,
}: {
  effect?: number | null;
  sample_size?: number | null;
  control_mean?: number | null;
  control_sd?: number | null;
  output?: 'sample_size' | 'effect';
  analysis_type?: 'power' | 'precision';
  effect_type?: 'absolute' | 'relative' | 'effect_size';
  alternative?: 'one_sided' | 'two_sided';
  alpha?: number;
  power?: number;
  treat_prop?: number;
  round?: boolean;
  decimal?: number;
}): number {
  if (analysis_type === 'precision') {
    power = 0.5;
  }

  let effect_factor: number | null = null;
  if (effect_type === 'relative') {
    effect_factor = control_mean! / control_sd!;
  } else if (effect_type === 'absolute') {
    effect_factor = 1 / control_sd!;
  } else if (effect_type === 'effect_size') {
    effect_factor = 1;
  }

  let signif_divisor: number = alternative === 'one_sided' ? 1 : 2;

  if (alpha < 0 || alpha > 1) {
    throw new Error("Invalid 'alpha' argument: must be >= 0 and <= 1");
  }
  if (power < 0 || power > 1) {
    throw new Error("Invalid 'power' argument: must be >= 0 and <= 1");
  }
  if (treat_prop < 0 || treat_prop > 1) {
    throw new Error("Invalid 'treat_prop' argument: must be >= 0 and <= 1");
  }

  const imbalance_deff = 0.25 / (treat_prop * (1 - treat_prop));
  const multiplier = Math.abs(
    zQuantile(power) + zQuantile(1 - alpha / signif_divisor)
  );

  let out: number | null = null;
  if (output === 'sample_size') {
    const effect_size = effect! * effect_factor!;
    out = ((2 * multiplier) / effect_size) ** 2 * imbalance_deff;
  } else {
    out =
      (2 * multiplier * Math.sqrt(imbalance_deff)) /
      (effect_factor! * Math.sqrt(sample_size!));
  }

  if (round) {
    out = mathRound(out, decimal);
  }
  return out;
}
/**
 * Convert between sample size and duration given exposure rate.
 * Parameters are passed as an object with the following components:
 * sample_size: Sample size to compute duration when output = "duration".
 * duration: Duration to compute sample size when output = "sample_size".
 * exposure_rate: Rate of accumulating exposures, i.e., exposures per time unit.
 * output: Output type for the conversion; specify:
 *   "duration" to convert sample size to duration (default); or
 *   "sample_size" to convert duration to sample size.
 * round: Whether to round the output value.
 * decimal: Number of decimal places to round the output value.
 */
function sampleSizeDurationConversion({
  sample_size = null,
  duration = null,
  exposure_rate = null,
  output = 'duration',
  round = true,
  decimal = 0,
}: {
  sample_size?: number | null;
  duration?: number | null;
  exposure_rate?: number | null;
  output?: 'duration' | 'sample_size';
  round?: boolean;
  decimal?: number;
}): number {
  let out: number | null = null;
  if (output === 'duration') {
    out = sample_size! / exposure_rate!;
  } else {
    out = duration! * exposure_rate!;
  }

  if (round) {
    out = mathRound(out, decimal);
  }
  return out;
}

function zQuantile(p: number): number {
  return jStat.normal.inv(p, 0, 1);
}

export { powerAnalysis, sampleSizeDurationConversion };
