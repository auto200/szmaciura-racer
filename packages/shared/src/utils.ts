import texts from "./texts.json";

const getParsedTexts = () => {
  const tmp: { [key: string]: string[] } = {};
  for (const [key, value] of Object.entries(texts)) {
    tmp[key] = value.trim().split(" ");
  }
  return tmp;
};

export const parsedTexts = getParsedTexts();

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimePassedInSecAndMs = (startTS: number, digits: number = 2): string => {
  const msPassed = Date.now() - startTS;
  const seconds = msPassed / 1000;
  return seconds.toFixed(digits);
};
