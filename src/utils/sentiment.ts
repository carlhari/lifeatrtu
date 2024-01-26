const vader = require("crowd-sentiment");

export const sentimentAnalyzer = async (text: string, origText: string) => {
  const translated = await vader.SentimentIntensityAnalyzer.polarity_scores(
    text
  );
  const orig = await vader.SentimentIntensityAnalyzer.polarity_scores(origText);

  const intensity = translated.compound + orig.compound / 2;
  if (intensity >= 0.05) {
    return "p"; // positive
  } else if (intensity <= -0.05) {
    return "n"; // negative
  } else {
    return "m"; // median/neutral
  }
};
