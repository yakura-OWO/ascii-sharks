// UI strings. Language follows the browser unless the user picks one in the settings panel.
const en = {
  pageTitle: "New Tab",
  googleServices: "Google services",
  images: "Images",
  googleApps: "Google apps",
  googleAccount: "Google Account",
  manageAccount: "Manage your Google Account",
  changeAvatar: "Change picture",
  removeAvatar: "Remove picture",
  searchPlaceholder: "Search Google or type a URL",
  search: "Search",
  shortcuts: "Shortcuts",
  customize: "Customize",
  close: "Close",
  appearance: "Appearance",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  language: "Language",
  auto: "Auto",
  ocean: "Ocean",
  swimSpeed: "Swim speed",
  glyphSize: "Character size",
  fishAmount: "Fish amount",
  shimmer: "Shimmer",
  sharks: "Sharks",
  add: "Add",
  resetDefaults: "Reset to defaults",
  addShortcut: "Add shortcut",
  editShortcut: "Edit shortcut",
  edit: "Edit",
  name: "Name",
  url: "URL",
  remove: "Remove",
  cancel: "Cancel",
  save: "Save",
  shortcutError: "Enter a name and a valid http or https URL.",
  color: "Color",
  kind: "Type",
  size: "Size",
  resetColor: "Reset color",
  removeShark: "Remove this shark",
  // Shark kinds
  classic: "Classic",
  hammerhead: "Hammerhead",
  greathammer: "Great hammerhead",
  tiger: "Tiger",
  zebra: "Zebra",
  mako: "Mako",
  thresher: "Thresher",
  nurse: "Nurse",
  // Google apps
  appSearch: "Search",
  appMaps: "Maps",
  appDrive: "Drive",
  appCalendar: "Calendar",
  appTranslate: "Translate",
  appPhotos: "Photos",
  appDocs: "Docs",
  appSheets: "Sheets",
  appSlides: "Slides",
  appNews: "News",
};

type Key = keyof typeof en;

const zh: Record<Key, string> = {
  pageTitle: "新分頁",
  googleServices: "Google 服務",
  images: "圖片",
  googleApps: "Google 應用程式",
  googleAccount: "Google 帳戶",
  manageAccount: "管理你的 Google 帳戶",
  changeAvatar: "更換頭像",
  removeAvatar: "移除頭像",
  searchPlaceholder: "搜尋 Google 或輸入網址",
  search: "搜尋",
  shortcuts: "常用網站",
  customize: "自訂",
  close: "關閉",
  appearance: "外觀",
  theme: "主題",
  light: "淺色",
  dark: "深色",
  system: "系統",
  language: "語言",
  auto: "自動",
  ocean: "海洋",
  swimSpeed: "游動速度",
  glyphSize: "字元大小",
  fishAmount: "小魚數量",
  shimmer: "閃爍程度",
  sharks: "鯊魚",
  add: "新增",
  resetDefaults: "恢復預設",
  addShortcut: "新增捷徑",
  editShortcut: "編輯捷徑",
  edit: "編輯",
  name: "名稱",
  url: "網址",
  remove: "移除",
  cancel: "取消",
  save: "儲存",
  shortcutError: "請輸入名稱與有效的 http 或 https 網址。",
  color: "顏色",
  kind: "種類",
  size: "大小",
  resetColor: "恢復原色",
  removeShark: "移除這隻鯊魚",
  classic: "經典鯊",
  hammerhead: "雙髻鯊",
  greathammer: "大雙髻鯊",
  tiger: "虎鯊",
  zebra: "斑馬鯊",
  mako: "灰鯖鯊",
  thresher: "長尾鯊",
  nurse: "鉸口鯊",
  appSearch: "搜尋",
  appMaps: "地圖",
  appDrive: "雲端硬碟",
  appCalendar: "日曆",
  appTranslate: "翻譯",
  appPhotos: "相簿",
  appDocs: "文件",
  appSheets: "試算表",
  appSlides: "簡報",
  appNews: "新聞",
};

export type Language = "auto" | "en" | "zh";
export const languageKey = "ascii-sharks-lang";

// Read synchronously (localStorage mirror) so the first paint is already in the right language.
function chosenLanguage(): Language {
  try {
    const saved = localStorage.getItem(languageKey);
    if (saved === "en" || saved === "zh") return saved;
  } catch { /* Fall back to the browser language. */ }
  return "auto";
}

export const languageChoice = chosenLanguage();
export const lang: "en" | "zh" = languageChoice === "auto"
  ? (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en")
  : languageChoice;

const strings = lang === "zh" ? zh : en;
export function t(key: Key): string {
  return strings[key];
}
export function isKey(key: string): key is Key {
  return key in en;
}

/** Fills elements marked with data-i18n (text), data-i18n-label (aria-label) and data-i18n-placeholder. */
export function translatePage() {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = t("pageTitle");
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = el.dataset.i18n!;
    if (isKey(key)) el.textContent = t(key);
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n-label]")) {
    const key = el.dataset.i18nLabel!;
    if (isKey(key)) el.setAttribute("aria-label", t(key));
  }
  for (const el of document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")) {
    const key = el.dataset.i18nPlaceholder!;
    if (isKey(key)) el.placeholder = t(key);
  }
}
