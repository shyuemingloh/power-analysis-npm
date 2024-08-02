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
type SampleSizeDurationConversionParams = {
    sample_size?: number | null;
    duration?: number | null;
    exposure_rate?: number | null;
    output?: 'duration' | 'sample_size';
    round?: boolean;
    decimal?: number;
};
declare function powerAnalysis({ effect, sample_size, control_mean, control_sd, output, analysis_type, effect_type, alternative, alpha, power, treat_prop, round, decimal, }?: PowerAnalysisParams): number;
declare function sampleSizeDurationConversion({ sample_size, duration, exposure_rate, output, round, decimal, }: SampleSizeDurationConversionParams): number;
export { powerAnalysis, sampleSizeDurationConversion };
