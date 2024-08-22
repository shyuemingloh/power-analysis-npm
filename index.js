const jStat = require('jstat');

/**
 * Perform power analysis to compute sample size given effect or effect given sample size.
 * Parameters are passed as an object with the following components:
 * effect: Minimum detectable effect (MDE) to compute the minimum required sample size (MRSS)
 *   when output = "sample_size". For a one-sided, upper-tailed test, the effect must be
 *   positive. For a one-sided, lower-tailed test, the effect must be negative. For a
 *   two-sided test, the effect can be any real value. See the `alternative` argument for
 *   further details.
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
 * r_squared: The common R-squared for the analysis of covariance (ANCOVA) model for each
 *   experiment arm.
 * alternative: Type of alternative for hypothesis test; specify:
 *   "two_sided" for a two-sided alternative hypothesis (default), or
 *   "upper_tailed" for a one-sided, upper-tailed alternative hypothesis, or
 *   "lower_tailed" for a one-sided, lower-tailed alternative hypothesis.
 * alpha: The significance level (upper limit of the false positive rate) of the hypothesis test
 *   (defaults to 0.05).
 * power: The power (one minus the false negative rate) of the hypothesis test (default to 0.80).
 *   Currently, the false negative rate (one minus power) is restricted to be greater than
 *   alpha, the significance level.
 * treat_prop: Proportion of traffic allocation to treatment arm; we assume there are only two
 *   experiment arms—the treatment and control arms.
 * sd_ratio: The ratio of the treatment arm SD to the control arm SD.
 * var_model: The variance model used; specify:
 *   "absolute" to use the variance of the absolute effect, the variance of the difference of
 *      averages; or
 *   "relative" to use the variance of the relative effect, the variance of a ratio of averages.
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
  distribution = 'normal',
  r_squared = 0,
  alternative = 'two-sided',
  alpha = 0.05,
  power = 0.8,
  treat_prop = 0.5,
  sd_ratio = 1,
  var_model = 'absolute',
  round = true,
  decimal = 0,
} = {}) {
  // Check output argument
  if (output !== 'sample_size' && output !== 'effect') {
    throw new Error(
      "Invalid 'output' argument: must be 'sample_size' or 'effect'"
    );
  }
  // Check analysis type argument and update power if precision analysis is chosen
  if (analysis_type == 'precision') {
    power = 0.5;
  } else if (analysis_type != 'power') {
    throw new Error(
      "Invalid 'analysis_type' argument: must be 'power' or 'precision'"
    );
  }
  // Check effect type and effect arguments and calculate the treatment mean and the effect factor
  // i.e., what is multiplied to effect to obtain an effect size
  var effect_factor = null;
  if (effect_type == 'relative') {
    if (effect < -1) {
      throw new Error(
        "Invalid 'effect' argument: must be >= -1 when effect_type = 'relative'"
      );
    }
    treatment_mean = control_mean * (1 + effect);
    effect_factor = control_mean / control_sd;
  } else if (effect_type == 'absolute') {
    treatment_mean = control_mean + effect;
    effect_factor = 1 / control_sd;
  } else if (effect_type == 'effect_size') {
    treatment_mean = control_mean + effect * control_sd;
    effect_factor = 1;
  } else {
    throw new Error(
      "Invalid 'effect_type' argument: must be 'relative', 'absolute', or 'effect_size'"
    );
  }
  // Check range of control and treatment means for binomial distribution
  if (control_mean < 0 || control_mean > 1) {
    ("Invalid 'control_mean' argument: must be >= 0 and <= 1 when distribution = 'binomial'");
  }
  if (treatment_mean < 0 || treatment_mean > 1) {
    ("Invalid 'effect' and 'control_mean' arguments: treatment mean must be >= 0 and <= 1 when distribution = 'binomial'");
  }
  mean_ratio = treatment_mean / control_mean;
  // Check alternative argument and effect sign and calculate significance divisor
  var signif_divisor = null;
  if (alternative == 'upper-tailed' || alternative == 'lower-tailed') {
    signif_divisor = 1;
    if (alternative == 'upper-tailed' && effect < 0) {
      throw new Error(
        "Invalid 'effect' argument: effect must be > 0 when alternative = 'upper-tailed'"
      );
    } else if (alternative == 'lower-tailed' && effect > 0) {
      throw new Error(
        "Invalid 'effect' argument: effect must be < 0 when alternative = 'lower-tailed'"
      );
    }
  } else if (alternative == 'two-sided') {
    signif_divisor = 2;
  } else {
    throw new Error(
      "Invalid 'alternative' argument: must be 'upper-tailed', 'lower-tailed', or 'two-sided'"
    );
  }
  // Check alpha (significance) and power arguments
  if (alpha < 0 || alpha > 1) {
    throw new Error("Invalid 'alpha' argument: must be >= 0 and <= 1");
  }
  if (power < 0 || power > 1) {
    throw new Error("Invalid 'power' argument: must be >= 0 and <= 1");
  }
  if (alpha >= 1 - power) {
    throw new Error(
      "Invalid 'alpha' and 'power' arguments: must have alpha < 1 - power"
    );
  }
  // Check treatment proportion argument and calculate imbalance design effect
  if (treat_prop < 0 || treat_prop > 1) {
    throw new Error("Invalid 'treat_prop' argument: must be >= 0 and <= 1");
  } else if (sd_ratio < 0) {
    throw new Error("Invalid 'sd_ratio' argument: must be >= 0");
  } else {
    imbalance_deff =
      0.25 *
      (sd_ratio ** 2 / treat_prop +
        (var_model == 'relative' ? mean_ratio ** 2 : 1) / (1 - treat_prop));
  }
  // Check R-squared argument and calculate ANCOVA design effect
  if (r_squared < 0) {
    throw new Error("Invalid 'r_squared' argument: must be >= 0");
  } else {
    ancova_deff = 1 - r_squared;
  }

  // Calculate multiplier
  const multiplier = Math.abs(
    zQuantile(power) + zQuantile(1 - alpha / signif_divisor)
  );

  // Calculate power analysis output
  var out = null;
  // (a) Calculate sample size given effect
  if (output == 'sample_size') {
    const effect_size = effect * effect_factor;
    out = ((2 * multiplier) / effect_size) ** 2 * imbalance_deff * ancova_deff;
  }
  // (b) Calculate effect given sample size
  else {
    out =
      (2 * multiplier * Math.sqrt(imbalance_deff * ancova_deff)) /
      (effect_factor * Math.sqrt(sample_size));
  }
  if (round) {
    out = roundNumber(out, decimal);
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
} = {}) {
  // Check output argument
  if (output !== 'duration' && output !== 'sample_size') {
    throw new Error(
      "Invalid 'output' argument: must be 'duration' or 'sample_size'"
    );
  }
  // Calculate output
  var out = null;
  if (output == 'duration') {
    out = sample_size / exposure_rate;
  } else {
    out = duration * exposure_rate;
  }
  if (round) {
    out = roundNumber(out, decimal);
  }
  return out;
}

/**
 * Compute quantile of the standard normal distribution given probability.
 * p: Probability to compute the quantile.
 */
function zQuantile(p) {
  return jStat.normal.inv(p, 0, 1);
}

/**
 * Round a number x to n decimal places.
 * x: Number to round.
 * n: Number of decimal places.
 */
function roundNumber(x, n) {
  return Math.round(x * 10 ** n) / 10 ** n;
}

module.exports = {
  powerAnalysis,
  sampleSizeDurationConversion,
};
