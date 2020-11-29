import texts from "./texts.json";

const parseText = (text: string): string[] => {
  return text.trim().split(" ");
};
const getParsedTexts = () => {
  const tmp: { [key: string]: string[] } = {};
  for (const [key, value] of Object.entries(texts)) {
    tmp[key] = parseText(value);
  }
  return tmp;
};
export const parsedTexts = getParsedTexts();

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimePassedInSecAndMs = (startTS: number): string => {
  const msPassed = Date.now() - startTS;
  const seconds = msPassed / 1000;
  return seconds.toFixed(2);
};
