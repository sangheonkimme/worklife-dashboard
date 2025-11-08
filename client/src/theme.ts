import { type MantineColorsTuple, createTheme } from "@mantine/core";

const worklifeNavy: MantineColorsTuple = [
  "#f2f4f8",
  "#d7ddea",
  "#bcc4d9",
  "#a1abc8",
  "#8591b4",
  "#6b78a0",
  "#526086",
  "#3a476c",
  "#1e2a47",
  "#0b1323",
];

const worklifeMint: MantineColorsTuple = [
  "#effaf8",
  "#d6f2ec",
  "#bce9de",
  "#a1dfd1",
  "#87d6c4",
  "#6dcdb8",
  "#54b39e",
  "#3c8c7a",
  "#266559",
  "#143d35",
];

const skyBlue: MantineColorsTuple = [
  "#f0fbfd",
  "#d8f2f6",
  "#c0e8ef",
  "#a7dee9",
  "#8ed4e2",
  "#75cadb",
  "#5ab0c2",
  "#408898",
  "#27606e",
  "#0f3843",
];

const deepGray: MantineColorsTuple = [
  "#f4f4f4",
  "#dfdfdf",
  "#c9c9c9",
  "#b3b3b3",
  "#9d9d9d",
  "#868686",
  "#707070",
  "#595959",
  "#434343",
  "#2d2d2d",
];

const lightGray: MantineColorsTuple = [
  "#fdfdfd",
  "#f7f8fa",
  "#f1f2f5",
  "#e9ecf0",
  "#e1e4e9",
  "#d9dce1",
  "#cfd3d8",
  "#c3c7cc",
  "#b6babf",
  "#a7abb0",
];

const successGreen: MantineColorsTuple = [
  "#f1fbef",
  "#dbf4d7",
  "#c4edbe",
  "#ace5a4",
  "#94dc8b",
  "#7bd471",
  "#61ba57",
  "#49903f",
  "#316727",
  "#1a3e10",
];

const warningOrange: MantineColorsTuple = [
  "#fff8ef",
  "#ffedda",
  "#ffe1c2",
  "#ffd4a9",
  "#ffc890",
  "#ffbb76",
  "#e6a25d",
  "#b87e45",
  "#8a5a2d",
  "#5c3816",
];

const errorRed: MantineColorsTuple = [
  "#fff0f0",
  "#ffd9d9",
  "#ffc2c2",
  "#ffaaaa",
  "#ff9393",
  "#ff7b7b",
  "#e66262",
  "#b84949",
  "#8a3131",
  "#5c1919",
];

export const worklifeTheme = createTheme({
  colors: {
    "worklife-navy": worklifeNavy,
    "worklife-mint": worklifeMint,
    "sky-blue": skyBlue,
    "deep-gray": deepGray,
    "light-gray": lightGray,
    "success-green": successGreen,
    "warning-orange": warningOrange,
    "error-red": errorRed,
  },
  primaryColor: "worklife-navy",
  primaryShade: { light: 8, dark: 4 },
  fontFamily:
    'Pretendard, "Poppins", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
  headings: {
    fontFamily:
      '"Poppins", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    sizes: {
      h1: { fontSize: "36px", lineHeight: "1.5", fontWeight: "700" },
      h2: { fontSize: "28px", lineHeight: "1.4", fontWeight: "600" },
      h3: { fontSize: "22px", lineHeight: "1.4", fontWeight: "500" },
      h4: { fontSize: "18px", lineHeight: "1.4", fontWeight: "500" },
      h5: { fontSize: "16px", lineHeight: "1.5", fontWeight: "500" },
      h6: { fontSize: "14px", lineHeight: "1.5", fontWeight: "500" },
    },
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "22px",
  },
  lineHeights: {
    xs: "1.7",
    sm: "1.7",
    md: "1.6",
    lg: "1.6",
    xl: "1.5",
  },
  spacing: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "64px",
  },
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  defaultRadius: "md",
  shadows: {
    xs: "0 1px 3px rgba(0, 0, 0, 0.06)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  defaultGradient: {
    from: "worklife-mint.5",
    to: "sky-blue.5",
    deg: 135,
  },
  other: {
    layout: {
      containerWidth: "1200px",
      gridGap: "24px",
      sectionSpacing: "64px",
      cardPadding: "16px",
    },
  },
});
