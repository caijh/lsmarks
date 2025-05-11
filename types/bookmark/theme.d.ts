export type ColorTheme = "default" | "blue" | "green" | "purple" | "red";

export interface ThemePreferences {
  colorTheme: ColorTheme;
  customColors?: Record<string, string>; // 预留自定义颜色接口
}

export interface ThemeContextValue {
  colorTheme: ColorTheme;
  customColors?: Record<string, string>;
  setColorTheme: (theme: ColorTheme) => void;
  setCustomColors?: (colors: Record<string, string>) => void; // 预留自定义颜色接口
}
