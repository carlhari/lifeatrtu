import { tlWords } from "@/utils/profanity";
const vader = require("crowd-sentiment");

export const sentimentAnalyzer = async (text: string, origText: string) => {
  const translated = await vader.SentimentIntensityAnalyzer.polarity_scores(
    text
  );
  const orig = await vader.SentimentIntensityAnalyzer.polarity_scores(origText);

  let intensity = translated.compound + orig.compound / 2;

  const translatedBooster = tlWords.some((word) =>
    text.toLowerCase().includes(word)
  );

  const origBooster = tlWords.some((word) =>
    origText.toLowerCase().includes(word)
  );

  if (translatedBooster && origBooster) {
    intensity -= 0.2; //Both negative
  } else if (translatedBooster || origBooster) {
    intensity -= 0.1; //just one negative
  }

  if (intensity >= 0.05) {
    return "p"; // positive
  } else if (intensity <= -0.05) {
    return "n"; // negative
  } else {
    return "m"; // median/neutral
  }
};
