const math = require('mathjs');
const jStat = require('jstat');

function powerAnalysis({ effect = null, sample_size = null, control_mean = null, control_sd = null,
                         output = "sample_size", effect_type = "relative", alternative = "two-sided",
                         alpha = 0.05, power = 0.80, treat_prop = 0.50, round = true, decimal = 0 } = {}) {
  // Check output argument
  if (output !== "sample_size" && output !== "effect") {
    throw new Error("Invalid 'output' argument: must be 'sample_size' or 'effect'");
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

  // Calculate multiplier
  const multiplier = Math.abs(zQuantile(power) + zQuantile(1 - alpha / signif_divisor))

  // Calculate power analysis output
  var out = null;
  // (a) Calculate sample size given effect
  if (output == "sample_size") {
    const effect_size = effect * effect_factor;
    out = (2 * multiplier / effect_size) ** 2 * imbalance_deff;
  }
  // (b) Calculate effect given sample size 
  else {
    out = 2 * multiplier * Math.sqrt(imbalance_deff) /
      (effect_factor * Math.sqrt(sample_size)) 
  }
  if (round) {
    out = math.round(out, decimal)
  }
  return out;
}

// Quantile of the standard normal distribution
function zQuantile(p) {
  return jStat.normal.inv(p, 0, 1);
}

module.exports = powerAnalysis
