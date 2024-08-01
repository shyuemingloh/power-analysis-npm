import { round as mathRound } from 'mathjs';
// @ts-ignore
import { jStat } from 'jstat';

type PowerAnalysisParams = {
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
};

type SampleSizeDurationConversionParams = {
  sample_size?: number | null;
  duration?: number | null;
  exposure_rate?: number | null;
  output?: 'duration' | 'sample_size';
  round?: boolean;
  decimal?: number;
};

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
}: PowerAnalysisParams = {}): number {
  if (output !== 'sample_size' && output !== 'effect') {
    throw new Error(
      "Invalid 'output' argument: must be 'sample_size' or 'effect'"
    );
  }

  if (analysis_type === 'precision') {
    power = 0.5;
  } else if (analysis_type !== 'power') {
    throw new Error(
      "Invalid 'analysis_type' argument: must be 'power' or 'precision'"
    );
  }

  let effect_factor: number | null = null;
  if (effect_type === 'relative') {
    effect_factor = control_mean! / control_sd!;
  } else if (effect_type === 'absolute') {
    effect_factor = 1 / control_sd!;
  } else if (effect_type === 'effect_size') {
    effect_factor = 1;
  } else {
    throw new Error(
      "Invalid 'effect_type' argument: must be 'relative', 'absolute', or 'effect_size'"
    );
  }

  let signif_divisor: number | null = null;
  if (alternative === 'one_sided') {
    signif_divisor = 1;
  } else if (alternative === 'two_sided') {
    signif_divisor = 2;
  } else {
    throw new Error(
      "Invalid 'alternative' argument: must be 'one_sided' or 'two_sided'"
    );
  }

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

function sampleSizeDurationConversion({
  sample_size = null,
  duration = null,
  exposure_rate = null,
  output = 'duration',
  round = true,
  decimal = 0,
}: SampleSizeDurationConversionParams = {}): number {
  if (output !== 'duration' && output !== 'sample_size') {
    throw new Error(
      "Invalid 'output' argument: must be 'duration' or 'sample_size'"
    );
  }

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
