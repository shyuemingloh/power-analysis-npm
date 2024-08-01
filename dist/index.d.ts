declare type PowerAnalysisParams = {
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
declare type SampleSizeDurationConversionParams = {
    sample_size?: number | null;
    duration?: number | null;
    exposure_rate?: number | null;
    output?: 'duration' | 'sample_size';
    round?: boolean;
    decimal?: number;
};
declare function powerAnalysis({ effect, sample_size, control_mean, control_sd, output, analysis_type, effect_type, alternative, alpha, power, treat_prop, round, decimal, }?: PowerAnalysisParams): number;
declare function sampleSizeDurationConversion({ sample_size, duration, exposure_rate, output, round, decimal, }?: SampleSizeDurationConversionParams): number;
export { powerAnalysis, sampleSizeDurationConversion };
