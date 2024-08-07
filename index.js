const jStat = require('jstat');

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
 * r_squared: The common R-squared for the analysis of covariance (ANCOVA) model for each
 *   experiment arm. 
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
function powerAnalysis({ effect = null, sample_size = null, control_mean = null, control_sd = null,
                         output = "sample_size", analysis_type = "power", effect_type = "relative",
                         distribution = "normal", r_squared = 0, alternative = "two-sided",
                         alpha = 0.05, power = 0.80, treat_prop = 0.50,
                         round = true, decimal = 0 } = {}) {
  // Check output argument
  if (output !== "sample_size" && output !== "effect") {
    throw new Error("Invalid 'output' argument: must be 'sample_size' or 'effect'");
  } 
  // Check analysis type argument and update power if precision analysis is chosen
  if (analysis_type == "precision") {
    power = 0.50;
  } else if (analysis_type != "power") {
    throw new Error("Invalid 'analysis_type' argument: must be 'power' or 'precision'");
  }
  // Check effect type argument and calculate the effect factor
  // i.e., what is multiplied to effect to obtain an effect size
  var effect_factor = null;
  if (effect_type == "relative") {
    effect_factor = control_mean / control_sd;
  } else if (effect_type == "absolute") {
    effect_factor = 1 / control_sd;
  } else if (effect_type == "effect_size") {
    effect_factor = 1
  } else {
    throw new Error("Invalid 'effect_type' argument: must be 'relative', 'absolute', or 'effect_size'");
  } 
  // Check range of control and treatment means for binomial distribution 
  if (control_mean < 0 || control_mean > 1) {
    ("Invalid 'alpha' argument: must be >= 0 and <= 1");
  }
  // Check alternative argument and calculate significance divisor
  var signif_divisor = null;
  if (alternative == "one-sided") {
    signif_divisor = 1; 
  } else if (alternative == "two-sided") {
    signif_divisor = 2;
  } else {
    throw new Error("Invalid 'alternative' argument: must be 'one-sided' or 'two-sided'");
  }
  // Check alpha (significance) and power arguments
  if (alpha < 0 || alpha > 1) {
    throw new Error("Invalid 'alpha' argument: must be >= 0 and <= 1");
  }
  if (power < 0 || power > 1) {
    throw new Error("Invalid 'power' argument: must be >= 0 and <= 1");
  }
  // Check treatment proportion argument and calculate imbalance design effect
  if (treat_prop < 0 || treat_prop > 1) {
    throw new Error("Invalid 'treat_prop' argument: must be >= 0 and <= 1");
  } else {
    imbalance_deff = 0.25 / (treat_prop * (1 - treat_prop))
  }
  // Check R-squared argument and calculate ANCOVA design effect
  if (r_squared < 0) {
    throw new Error("Invalid 'r_squared' argument: must be >= 0");
  } else {
    ancova_deff = 1 - r_squared
  }

  // Calculate multiplier
  const multiplier = Math.abs(zQuantile(power) + zQuantile(1 - alpha / signif_divisor))

  // Calculate power analysis output
  var out = null;
  // (a) Calculate sample size given effect
  if (output == "sample_size") {
    const effect_size = effect * effect_factor;
    out = (2 * multiplier / effect_size) ** 2 * imbalance_deff * ancova_deff;
  }
  // (b) Calculate effect given sample size 
  else {
    out = 2 * multiplier * Math.sqrt(imbalance_deff * ancova_deff) /
      (effect_factor * Math.sqrt(sample_size)) 
  }
  if (round) {
    out = roundNumber(out, decimal)
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
function sampleSizeDurationConversion({ sample_size = null, duration = null,
                                        exposure_rate = null, output = "duration",
                                        round = true, decimal = 0 } = {}) {
  // Check output argument
  if (output !== "duration" && output !== "sample_size") {
    throw new Error("Invalid 'output' argument: must be 'duration' or 'sample_size'");
  }
  // Calculate output
  var out = null;
  if (output == "duration") {
    out = sample_size / exposure_rate;
  } else {
    out = duration * exposure_rate;
  }
  if (round) {
    out = roundNumber(out, decimal)
  }
  return(out);
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
  return Math.round(x * (10 ** n)) / (10 ** n);
}

module.exports = {
  powerAnalysis,
  sampleSizeDurationConversion
};
