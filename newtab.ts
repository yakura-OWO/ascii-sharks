import { DEFAULT_SHARKS, OceanEngine, type SharkKind } from "./src";
import { languageChoice, languageKey, t, translatePage, type Language } from "./i18n";

translatePage();

declare const chrome: any;
const extension = typeof chrome !== "undefined" && !!chrome.storage?.local;

// chrome.storage.local survives profile restarts and syncs across open tabs; localStorage is the dev-server fallback.
async function load<T>(key: string): Promise<T | undefined> {
  try {
    if (extension) return (await chrome.storage.local.get(key))[key];
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch { return undefined; }
}
async function store(key: string, value: unknown) {
  try {
    if (extension) await chrome.storage.local.set({ [key]: value });
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* Changes still work for this tab. */ }
}

function favicon(url: string, img: HTMLImageElement, fallback: HTMLElement) {
  if (!extension) return;
  img.src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`);
  img.onload = () => fallback.replaceChildren(img);
}

function destination(value: string): string {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return new URL(text).href;
  if (/^(localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?([/?#]\S*)?$/.test(text)) return new URL(`https://${text}`).href;
  return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}

document.querySelector<HTMLFormElement>("#search")!.addEventListener("submit", event => {
  event.preventDefault();
  const text = document.querySelector<HTMLInputElement>("#query")!.value.trim();
  if (text) location.href = destination(text);
});

// Ocean: rebuilt from scratch when its population changes; speed and theme apply live.
type SharkSetting = { kind: SharkKind; size: number; color: string | null };
type Theme = "light" | "dark" | "system";
type Ocean = { sharks: SharkSetting[]; fishScale: number; glyphScale: number; speed: number; theme: Theme };
const oceanKey = "ascii-sharks-ocean";
const kinds: [SharkKind, string][] = (
  ["classic", "hammerhead", "greathammer", "tiger", "zebra", "mako", "thresher", "nurse"] as const
).map(kind => [kind, t(kind)]);
// Rough look of the built-in tints, shown in the colour picker until one is chosen.
const builtInColors = ["#3ad0e6", "#c25ae6", "#e6a038", "#4ad874"];
const defaultOcean = (): Ocean => ({
  sharks: DEFAULT_SHARKS.map(s => ({ ...s, color: null })), fishScale: 1, glyphScale: 0.6, speed: 1, theme: "dark",
});
let ocean = defaultOcean();
let engine: OceanEngine | undefined;
const canvas = document.querySelector("canvas")!;

function startOcean() {
  engine?.destroy();
  engine = new OceanEngine(canvas, ocean.sharks.map(({ kind, size }) => ({ kind, size })), {
    fishScale: ocean.fishScale,
    glyphScale: ocean.glyphScale,
    speed: ocean.speed,
    sharkColors: ocean.sharks.map(s => s.color),
  });
}
function changeOcean(restart = true) {
  store(oceanKey, ocean);
  renderOcean();
  if (restart) startOcean();
}

const lightQuery = matchMedia("(prefers-color-scheme: light)");
function applyTheme() {
  // theme.js reads this mirror synchronously on the next load to avoid a flash.
  try { localStorage.setItem("ascii-sharks-theme", ocean.theme); } catch { /* Only costs a flash. */ }
  const light = ocean.theme === "light" || (ocean.theme === "system" && lightQuery.matches);
  document.documentElement.dataset.theme = light ? "light" : "dark";
}
lightQuery.addEventListener("change", applyTheme);
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]")) {
  button.addEventListener("click", () => { ocean.theme = button.dataset.themeChoice as Theme; applyTheme(); changeOcean(false); });
}

// Language: strings are applied once at startup, so switching reloads the page.
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-lang-choice]")) {
  button.setAttribute("aria-checked", String(button.dataset.langChoice === languageChoice));
  button.addEventListener("click", () => {
    const choice = button.dataset.langChoice as Language;
    if (choice === languageChoice) return;
    try { localStorage.setItem(languageKey, choice); } catch { /* Stays on the current language. */ }
    location.reload();
  });
}

// Native <select> popups can't be styled, so the kind picker is a popover listbox.
const listbox = document.createElement("div");
listbox.className = "listbox";
listbox.setAttribute("role", "listbox");
listbox.popover = "auto";
document.querySelector("#ocean-panel")!.append(listbox);
let listboxOwner: HTMLButtonElement | null = null;
listbox.addEventListener("toggle", (event: any) => {
  if (event.newState === "closed") { listboxOwner?.setAttribute("aria-expanded", "false"); listboxOwner = null; }
});
function dropdown(value: SharkKind, onPick: (kind: SharkKind) => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown";
  button.textContent = kinds.find(([k]) => k === value)![1];
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    const reopen = listboxOwner !== button;
    if (listboxOwner) listbox.hidePopover();
    if (!reopen) return;
    listbox.replaceChildren(...kinds.map(([kind, label]) => {
      const option = document.createElement("button");
      option.type = "button";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(kind === value));
      option.textContent = label;
      option.addEventListener("click", () => { listbox.hidePopover(); if (kind !== value) onPick(kind); });
      return option;
    }));
    listboxOwner = button;
    button.setAttribute("aria-expanded", "true");
    listbox.showPopover();
    const rect = button.getBoundingClientRect();
    const height = listbox.offsetHeight;
    const below = rect.bottom + 6 + height < innerHeight;
    listbox.style.left = `${rect.left}px`;
    listbox.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height)}px`;
    listbox.querySelector<HTMLElement>("[aria-selected=true]")?.focus();
  });
  return button;
}

function fill(input: HTMLInputElement) {
  const p = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
  input.style.setProperty("--p", `${p * 100}%`);
}
document.addEventListener("input", event => {
  const input = event.target as HTMLInputElement;
  if (input.type === "range") fill(input);
});

const sharkList = document.querySelector<HTMLElement>("#shark-list")!;
const sharkAdd = document.querySelector<HTMLButtonElement>("#shark-add")!;
// set() returns whether the ocean has to be rebuilt.
const sliders = [
  { id: "speed", get: () => ocean.speed, set: (v: number) => { ocean.speed = v; if (engine) engine.speed = v; return false; }, label: (v: number) => `${+v.toFixed(2)}×` },
  { id: "glyph-scale", get: () => ocean.glyphScale, set: (v: number) => { ocean.glyphScale = v; return true; }, label: (v: number) => `${Math.round(v * 100)}%` },
  { id: "fish-scale", get: () => ocean.fishScale, set: (v: number) => { ocean.fishScale = v; return true; }, label: (v: number) => `${Math.round(v * 100)}%` },
].map(s => ({
  ...s,
  input: document.querySelector<HTMLInputElement>(`#${s.id}`)!,
  output: document.querySelector<HTMLOutputElement>(`#${s.id.split("-")[0]}-value`)!,
}));
for (const s of sliders) {
  s.input.addEventListener("input", () => {
    s.output.textContent = s.label(Number(s.input.value));
    // Speed is cheap to change, so it follows the thumb; the others rebuild the ocean on release.
    if (s.id === "speed") s.set(Number(s.input.value));
  });
  s.input.addEventListener("change", () => changeOcean(s.set(Number(s.input.value))));
}

function renderOcean() {
  sharkList.replaceChildren();
  ocean.sharks.forEach((shark, index) => {
    const row = document.createElement("div");
    row.className = "shark-row";
    const color = document.createElement("input");
    color.type = "color";
    color.value = shark.color ?? builtInColors[index % builtInColors.length];
    color.title = color.ariaLabel = t("color");
    color.addEventListener("change", () => { shark.color = color.value; changeOcean(); });
    const kind = dropdown(shark.kind, picked => { shark.kind = picked; changeOcean(); });
    kind.title = t("kind");
    const size = document.createElement("input");
    size.type = "range";
    size.min = "0.4"; size.max = "1.3"; size.step = "0.05";
    size.value = String(shark.size);
    size.title = size.ariaLabel = t("size");
    fill(size);
    size.addEventListener("change", () => { shark.size = Number(size.value); changeOcean(); });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "icon-button";
    reset.textContent = "↺";
    reset.title = reset.ariaLabel = t("resetColor");
    reset.disabled = shark.color === null;
    reset.addEventListener("click", () => { shark.color = null; changeOcean(); });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "✕";
    remove.title = remove.ariaLabel = t("removeShark");
    remove.disabled = ocean.sharks.length <= 1;
    remove.addEventListener("click", () => { ocean.sharks.splice(index, 1); changeOcean(); });
    row.append(color, kind, size, reset, remove);
    sharkList.append(row);
  });
  document.querySelector("#shark-count")!.textContent = `${ocean.sharks.length} / 8`;
  sharkAdd.disabled = ocean.sharks.length >= 8;
  for (const s of sliders) {
    s.input.value = String(s.get());
    s.output.textContent = s.label(s.get());
    fill(s.input);
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]")) {
    button.setAttribute("aria-checked", String(button.dataset.themeChoice === ocean.theme));
  }
}
sharkAdd.addEventListener("click", () => { ocean.sharks.push({ kind: "classic", size: 0.8, color: null }); changeOcean(); });
document.querySelector("#ocean-reset")!.addEventListener("click", () => { ocean = { ...defaultOcean(), theme: ocean.theme }; changeOcean(); });

load<Partial<Ocean>>(oceanKey).then(saved => {
  const known = new Set(kinds.map(([k]) => k));
  const num = (v: unknown, fallback: number) => typeof v === "number" && isFinite(v) ? v : fallback;
  if (saved && Array.isArray(saved.sharks) && saved.sharks.length && saved.sharks.every(s => known.has(s?.kind) && typeof s.size === "number")) {
    const base = defaultOcean();
    ocean = {
      sharks: saved.sharks.slice(0, 8),
      fishScale: num(saved.fishScale, base.fishScale),
      glyphScale: num(saved.glyphScale, base.glyphScale),
      speed: num(saved.speed, base.speed),
      theme: saved.theme === "light" || saved.theme === "system" ? saved.theme : "dark",
    };
  }
  applyTheme();
  renderOcean();
  startOcean();
});

// Top-right menus.
const apps = [
  [t("appSearch"), "https://www.google.com/"], [t("appMaps"), "https://maps.google.com/"], ["YouTube", "https://www.youtube.com/"],
  ["Gmail", "https://mail.google.com/"], ["Meet", "https://meet.google.com/"], [t("appDrive"), "https://drive.google.com/"],
  [t("appCalendar"), "https://calendar.google.com/"], [t("appTranslate"), "https://translate.google.com/"], [t("appPhotos"), "https://photos.google.com/"],
  [t("appDocs"), "https://docs.google.com/document/"], [t("appSheets"), "https://docs.google.com/spreadsheets/"], [t("appSlides"), "https://docs.google.com/presentation/"],
  ["Gemini", "https://gemini.google.com/"], ["Keep", "https://keep.google.com/"], [t("appNews"), "https://news.google.com/"],
];
const appsPanel = document.querySelector<HTMLElement>("#apps")!;
const appIcons: [string, HTMLElement][] = [];
for (const [name, url] of apps) {
  const a = document.createElement("a");
  a.href = url;
  const icon = document.createElement("span");
  icon.className = "app-icon";
  icon.textContent = name.slice(0, 1);
  appIcons.push([url, icon]);
  const label = document.createElement("span");
  label.textContent = name;
  a.append(icon, label);
  appsPanel.append(a);
}
// Chrome's local favicon cache only knows sites this profile has visited, so app icons come
// from Google's favicon service instead: fetched on first open, then served from the HTTP cache.
// The list is fixed, so the requests reveal nothing about the user's browsing.
let appIconsLoaded = false;
document.querySelector("#apps-button")!.addEventListener("click", () => {
  if (appIconsLoaded) return;
  appIconsLoaded = true;
  for (const [url, icon] of appIcons) {
    const img = new Image();
    img.alt = "";
    img.onload = () => icon.replaceChildren(img);
    img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
  }
});

const menus = [["#apps-button", "#apps"], ["#avatar-button", "#account"], ["#ocean-button", "#ocean-panel"]].map(([b, p]) => [document.querySelector<HTMLElement>(b)!, document.querySelector<HTMLElement>(p)!] as const);
function closeMenus(except?: HTMLElement) {
  for (const [button, panel] of menus) if (panel !== except) { panel.hidden = true; button.setAttribute("aria-expanded", "false"); }
}
for (const [button, panel] of menus) button.addEventListener("click", event => {
  event.stopPropagation();
  closeMenus(panel);
  panel.hidden = !panel.hidden;
  button.setAttribute("aria-expanded", String(!panel.hidden));
});
// composedPath, not target.closest: panel controls re-render and may already be detached here.
document.addEventListener("click", event => {
  if (!event.composedPath().some(el => el instanceof Element && el.classList.contains("panel"))) closeMenus();
});
document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenus(); });
document.querySelector("#ocean-close")!.addEventListener("click", () => closeMenus());

const avatarKey = "ascii-sharks-avatar";
const person = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4 0-9 2-9 6v1h18v-1c0-4-5-6-9-6z"/></svg>';
function showAvatar(src: string | undefined) {
  for (const el of document.querySelectorAll<HTMLElement>(".avatar")) {
    if (src) { const img = new Image(); img.src = src; img.alt = ""; el.replaceChildren(img); }
    else el.innerHTML = person;
  }
  document.querySelector<HTMLElement>("#avatar-clear")!.hidden = !src;
}
const avatarFile = document.querySelector<HTMLInputElement>("#avatar-file")!;
document.querySelector("#avatar-change")!.addEventListener("click", () => avatarFile.click());
document.querySelector("#avatar-clear")!.addEventListener("click", () => { store(avatarKey, null); showAvatar(undefined); });
avatarFile.addEventListener("change", () => {
  const file = avatarFile.files?.[0];
  if (!file) return;
  // Downscale so the stored data URL stays small.
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const side = Math.min(img.width, img.height);
    canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 128, 128);
    const data = canvas.toDataURL("image/png");
    URL.revokeObjectURL(img.src);
    store(avatarKey, data);
    showAvatar(data);
  };
  img.src = URL.createObjectURL(file);
  avatarFile.value = "";
});
load<string | null>(avatarKey).then(src => showAvatar(src ?? undefined));

// Shortcuts.
type Shortcut = { name: string; url: string };
const key = "ascii-sharks-shortcuts";
let links: Shortcut[] = [];
let editing = -1;

const editor = document.querySelector<HTMLDialogElement>("#editor")!;
const form = document.querySelector<HTMLFormElement>("#shortcut-form")!;
const error = document.querySelector<HTMLElement>("#error")!;
const nameInput = document.querySelector<HTMLInputElement>("#link-name")!;
const urlInput = document.querySelector<HTMLInputElement>("#link-url")!;
const deleteButton = document.querySelector<HTMLButtonElement>("#delete")!;
document.querySelector("#cancel")!.addEventListener("click", () => editor.close());
deleteButton.addEventListener("click", () => { links = links.filter((_, i) => i !== editing); save(); editor.close(); });

function open(index: number) {
  editing = index;
  form.reset();
  error.textContent = "";
  nameInput.value = links[index]?.name ?? "";
  urlInput.value = links[index]?.url ?? "";
  document.querySelector("#editor-title")!.textContent = index < 0 ? t("addShortcut") : t("editShortcut");
  deleteButton.hidden = index < 0;
  editor.showModal();
}
function save() {
  store(key, links);
  render();
}
function render() {
  const container = document.querySelector("#shortcuts")!;
  container.replaceChildren();
  links.forEach((link, index) => {
    const item = document.createElement("div");
    item.className = "shortcut";
    const a = document.createElement("a");
    a.href = link.url;
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = link.name.slice(0, 1).toUpperCase();
    icon.style.setProperty("--accent", ["#74d9c5", "#e4a384", "#dde3ee", "#ff737e", "#d795ef"][index % 5]);
    favicon(link.url, new Image(), icon);
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = link.name;
    a.title = link.name;
    a.append(icon, label);
    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "⋮";
    edit.setAttribute("aria-label", `${t("edit")} ${link.name}`);
    edit.addEventListener("click", () => open(index));
    item.append(a, edit);
    container.append(item);
  });
  const add = document.createElement("button");
  add.className = "add";
  add.innerHTML = '<span class="icon">＋</span><span class="label"></span>';
  add.querySelector(".label")!.textContent = t("addShortcut");
  add.addEventListener("click", () => open(-1));
  container.append(add);
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const raw = urlInput.value.trim();
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (!name || !["https:", "http:"].includes(url.protocol)) throw new Error();
    const link = { name, url: url.href };
    links = editing < 0 ? [...links, link] : links.map((l, i) => i === editing ? link : l);
    save();
    editor.close();
  } catch { error.textContent = t("shortcutError"); }
});

function valid(saved: unknown): saved is Shortcut[] {
  return Array.isArray(saved) && saved.every(x => typeof x?.name === "string" && typeof x?.url === "string" && /^https?:\/\//i.test(x.url));
}
render();
load<unknown>(key).then(saved => { if (valid(saved)) { links = saved; render(); } });
if (extension) chrome.storage.onChanged.addListener((changes: any, area: string) => {
  if (area === "local" && valid(changes[key]?.newValue)) { links = changes[key].newValue; render(); }
});
