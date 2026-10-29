import { DEFAULT_SHARKS, OceanEngine, type SharkKind } from "./src";

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

// Ocean: rebuilt from scratch whenever the settings change.
type SharkSetting = { kind: SharkKind; size: number; color: string | null };
type Ocean = { sharks: SharkSetting[]; fishScale: number; glyphScale: number };
const oceanKey = "ascii-sharks-ocean";
const kinds: [SharkKind, string][] = [
  ["classic", "經典鯊"], ["hammerhead", "雙髻鯊"], ["greathammer", "大雙髻鯊"], ["tiger", "虎鯊"],
  ["zebra", "斑馬鯊"], ["mako", "灰鯖鯊"], ["thresher", "長尾鯊"], ["nurse", "鉸口鯊"],
];
// Rough look of the built-in tints, shown in the colour picker until one is chosen.
const builtInColors = ["#3ad0e6", "#c25ae6", "#e6a038", "#4ad874"];
const defaultOcean = (): Ocean => ({ sharks: DEFAULT_SHARKS.map(s => ({ ...s, color: null })), fishScale: 1, glyphScale: 0.6 });
let ocean = defaultOcean();
let engine: OceanEngine | undefined;
const canvas = document.querySelector("canvas")!;

function startOcean() {
  engine?.destroy();
  engine = new OceanEngine(canvas, ocean.sharks.map(({ kind, size }) => ({ kind, size })), {
    fishScale: ocean.fishScale,
    glyphScale: ocean.glyphScale,
    sharkColors: ocean.sharks.map(s => s.color),
  });
}
function changeOcean() {
  store(oceanKey, ocean);
  renderOcean();
  startOcean();
}
const sharkList = document.querySelector<HTMLElement>("#shark-list")!;
const fishScale = document.querySelector<HTMLInputElement>("#fish-scale")!;
const fishValue = document.querySelector<HTMLOutputElement>("#fish-value")!;
const glyphScale = document.querySelector<HTMLInputElement>("#glyph-scale")!;
const glyphValue = document.querySelector<HTMLOutputElement>("#glyph-value")!;
const sharkAdd = document.querySelector<HTMLButtonElement>("#shark-add")!;
function renderOcean() {
  sharkList.replaceChildren();
  ocean.sharks.forEach((shark, index) => {
    const row = document.createElement("div");
    row.className = "shark-row";
    const kind = document.createElement("select");
    kind.setAttribute("aria-label", "種類");
    for (const [value, label] of kinds) kind.add(new Option(label, value, false, value === shark.kind));
    kind.addEventListener("change", () => { shark.kind = kind.value as SharkKind; changeOcean(); });
    const size = document.createElement("input");
    size.type = "range";
    size.min = "0.4"; size.max = "1.3"; size.step = "0.05";
    size.value = String(shark.size);
    size.title = size.ariaLabel = "大小";
    size.addEventListener("change", () => { shark.size = Number(size.value); changeOcean(); });
    const color = document.createElement("input");
    color.type = "color";
    color.value = shark.color ?? builtInColors[index % builtInColors.length];
    color.title = color.ariaLabel = "顏色";
    color.addEventListener("change", () => { shark.color = color.value; changeOcean(); });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "↺";
    reset.title = reset.ariaLabel = "恢復原色";
    reset.disabled = shark.color === null;
    reset.addEventListener("click", () => { shark.color = null; changeOcean(); });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.title = remove.ariaLabel = "移除這隻鯊魚";
    remove.disabled = ocean.sharks.length <= 1;
    remove.addEventListener("click", () => { ocean.sharks.splice(index, 1); changeOcean(); });
    row.append(kind, size, color, reset, remove);
    sharkList.append(row);
  });
  document.querySelector("#shark-count")!.textContent = `${ocean.sharks.length} / 8`;
  sharkAdd.disabled = ocean.sharks.length >= 8;
  fishScale.value = String(ocean.fishScale);
  fishValue.textContent = `${Math.round(ocean.fishScale * 100)}%`;
  glyphScale.value = String(ocean.glyphScale);
  glyphValue.textContent = `${Math.round(ocean.glyphScale * 100)}%`;
}
sharkAdd.addEventListener("click", () => { ocean.sharks.push({ kind: "classic", size: 0.8, color: null }); changeOcean(); });
fishScale.addEventListener("input", () => { fishValue.textContent = `${Math.round(Number(fishScale.value) * 100)}%`; });
fishScale.addEventListener("change", () => { ocean.fishScale = Number(fishScale.value); changeOcean(); });
glyphScale.addEventListener("input", () => { glyphValue.textContent = `${Math.round(Number(glyphScale.value) * 100)}%`; });
glyphScale.addEventListener("change", () => { ocean.glyphScale = Number(glyphScale.value); changeOcean(); });
document.querySelector("#ocean-reset")!.addEventListener("click", () => { ocean = defaultOcean(); changeOcean(); });

load<Ocean>(oceanKey).then(saved => {
  const known = new Set(kinds.map(([k]) => k));
  if (saved && Array.isArray(saved.sharks) && saved.sharks.length && saved.sharks.every(s => known.has(s?.kind) && typeof s.size === "number")) {
    ocean = { sharks: saved.sharks.slice(0, 8), fishScale: typeof saved.fishScale === "number" ? saved.fishScale : 1, glyphScale: typeof saved.glyphScale === "number" ? saved.glyphScale : 0.6 };
  }
  renderOcean();
  startOcean();
});

// Top-right menus.
const apps = [
  ["搜尋", "https://www.google.com/"], ["地圖", "https://maps.google.com/"], ["YouTube", "https://www.youtube.com/"],
  ["Gmail", "https://mail.google.com/"], ["Meet", "https://meet.google.com/"], ["雲端硬碟", "https://drive.google.com/"],
  ["日曆", "https://calendar.google.com/"], ["翻譯", "https://translate.google.com/"], ["相簿", "https://photos.google.com/"],
  ["文件", "https://docs.google.com/document/"], ["試算表", "https://docs.google.com/spreadsheets/"], ["簡報", "https://docs.google.com/presentation/"],
  ["Gemini", "https://gemini.google.com/"], ["Keep", "https://keep.google.com/"], ["新聞", "https://news.google.com/"],
];
const appsPanel = document.querySelector<HTMLElement>("#apps")!;
for (const [name, url] of apps) {
  const a = document.createElement("a");
  a.href = url;
  const icon = document.createElement("span");
  icon.className = "app-icon";
  icon.textContent = name.slice(0, 1);
  favicon(url, new Image(), icon);
  const label = document.createElement("span");
  label.textContent = name;
  a.append(icon, label);
  appsPanel.append(a);
}

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
  document.querySelector("#editor-title")!.textContent = index < 0 ? "新增捷徑" : "編輯捷徑";
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
    edit.setAttribute("aria-label", `編輯 ${link.name}`);
    edit.addEventListener("click", () => open(index));
    item.append(a, edit);
    container.append(item);
  });
  const add = document.createElement("button");
  add.className = "add";
  add.innerHTML = '<span class="icon">＋</span><span class="label">新增捷徑</span>';
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
  } catch { error.textContent = "請輸入名稱與有效的 http 或 https 網址。"; }
});

function valid(saved: unknown): saved is Shortcut[] {
  return Array.isArray(saved) && saved.every(x => typeof x?.name === "string" && typeof x?.url === "string" && /^https?:\/\//i.test(x.url));
}
render();
load<unknown>(key).then(saved => { if (valid(saved)) { links = saved; render(); } });
if (extension) chrome.storage.onChanged.addListener((changes: any, area: string) => {
  if (area === "local" && valid(changes[key]?.newValue)) { links = changes[key].newValue; render(); }
});
