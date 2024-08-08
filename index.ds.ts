declare module 'power-analysis-npm' {
  export function powerAnalysis({
    effect,
    sample_size,
    control_mean,
    control_sd,
    output,
    analysis_type,
    effect_type,
    distribution,
    r_squared,
    alternative,
    alpha,
    power,
    treat_prop,
    round,
    decimal,
  }: {
    effect?: number | null;
    sample_size?: number | null;
    control_mean?: number | null;
    control_sd?: number | null;
    output?: string;
    analysis_type?: string;
    effect_type?: string;
    distribution?: string;
    r_squared?: number;
    alternative?: string;
    alpha?: number;
    power?: number;
    treat_prop?: number;
    round?: boolean;
    decimal?: number;
  }): number;

  export function sampleSizeDurationConversion({
    sample_size,
    duration,
    exposure_rate,
    output,
    round,
    decimal,
  }: {
    sample_size?: number | null;
    duration?: number | null;
    exposure_rate?: number | null;
    output?: string;
    round?: boolean;
    decimal?: number;
  }): number;
}
