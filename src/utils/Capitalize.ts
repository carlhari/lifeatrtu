export const Capitalize = (text: any) => {
  return text?.replace(
    /(^\w|\s\w)(\S*)/g,
    (_: any, m1: any, m2: any) => m1.toUpperCase() + m2.toLowerCase()
  );
};
