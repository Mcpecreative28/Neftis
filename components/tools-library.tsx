"use client";

import { useMemo, useState } from "react";

type ToolId = "text" | "base64" | "json" | "words" | "units" | "color";
type ToolItem = { id: ToolId; name: string; category: "Text" | "Developer" | "Utility"; description: string; mark: string };

const tools: ToolItem[] = [
  { id: "text", name: "Text formatter", category: "Text", description: "Transform, clean, and organize text.", mark: "Aa" },
  { id: "base64", name: "Base64 converter", category: "Developer", description: "Encode or decode UTF-8 text.", mark: "64" },
  { id: "json", name: "JSON inspector", category: "Developer", description: "Format, minify, and validate JSON.", mark: "{}" },
  { id: "words", name: "Word counter", category: "Text", description: "Count words, characters, and lines.", mark: "#" },
  { id: "units", name: "Unit converter", category: "Utility", description: "Convert length, weight, and temperature.", mark: "↔" },
  { id: "color", name: "Color converter", category: "Utility", description: "Convert HEX, RGB, and HSL values.", mark: "◒" },
];

const copyText = async (value: string) => {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(value);
};

export default function ToolsLibrary({ language = "id" }: { language?: string }) {
  const [filter, setFilter] = useState("All tools");
  const [active, setActive] = useState<ToolId | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("uppercase");
  const [unitType, setUnitType] = useState("length");
  const [unitFrom, setUnitFrom] = useState("m");
  const [unitTo, setUnitTo] = useState("km");
  const [colorValue, setColorValue] = useState("#d4f36a");
  const [copied, setCopied] = useState(false);

  const isId = language === "id";
  const isAr = language === "ar";
  const tx = (id: string, en: string, ar: string) => isAr ? ar : isId ? id : en;
  const visibleTools = useMemo(() => tools.filter((tool) => filter === "All tools" || tool.category === filter), [filter]);
  const selected = tools.find((tool) => tool.id === active);

  const resetResult = () => { setOutput(""); setError(""); setCopied(false); };
  const run = () => {
    resetResult();
    try {
      let result = "";
      switch (active) {
        case "text":
          result = mode === "uppercase" ? input.toLocaleUpperCase() : mode === "lowercase" ? input.toLocaleLowerCase() : mode === "title" ? input.toLocaleLowerCase().replace(/(^|\s)\S/g, (char) => char.toLocaleUpperCase()) : input.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
          break;
        case "base64":
          result = mode === "encode" ? btoa(Array.from(new TextEncoder().encode(input), (byte) => String.fromCharCode(byte)).join("")) : new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(input.trim()), (char) => char.charCodeAt(0)));
          break;
        case "json": {
          const parsed: unknown = JSON.parse(input);
          result = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
          break;
        }
        case "words":
          result = JSON.stringify({ words: (input.trim().match(/\S+/g) ?? []).length, characters: input.length, charactersWithoutSpaces: input.replace(/\s/g, "").length, lines: input.length ? input.split(/\r\n|\r|\n/).length : 0, paragraphs: input.trim() ? input.trim().split(/\n\s*\n/).length : 0 }, null, 2);
          break;
        case "units": {
          const value = Number(input);
          if (!Number.isFinite(value)) throw new Error("Enter a valid number.");
          result = String(convertUnit(value, unitType, unitFrom, unitTo));
          break;
        }
        case "color":
          result = JSON.stringify(convertColor(colorValue), null, 2);
          break;
        default: return;
      }
      setOutput(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to process this input.");
    }
  };

  const openTool = (id: ToolId) => { setActive(id); setInput(""); setOutput(""); setError(""); setMode(id === "base64" ? "encode" : id === "json" ? "format" : "uppercase"); };
  const closeTool = () => { setActive(null); resetResult(); };
  const copyResult = async () => {
    try { await copyText(output); setCopied(true); } catch { setError(tx("Clipboard tidak tersedia di browser ini.", "Clipboard is unavailable in this browser.", "الحافظة غير متاحة في هذا المتصفح.")); }
  };

  return <section className="page-view active tools-library" dir={isAr ? "rtl" : "ltr"}>
    <div className="page-intro"><div><span className="section-kicker">02 / NEFTIS SPACE</span><h1>{tx("Pustaka", "Tools", "مكتبة")} <em>{tx("alat", "library", "الأدوات")}</em></h1><p>{tx("Utilitas praktis untuk pekerjaan digital sehari-hari.", "Practical utilities for everyday digital work.", "أدوات عملية للعمل الرقمي اليومي.")}</p></div><div className="intro-side-label">UTILITY INDEX<br />002—NEF</div></div>
    {!selected ? <>
      <div className="tools-library-toolbar"><div className="filter-tabs">{["All tools", "Text", "Developer", "Utility"].map((item) => <button key={item} className={`filter-tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item === "All tools" ? tx("Semua", "All tools", "كل الأدوات") : item === "Text" ? tx("Teks", "Text", "النصوص") : item === "Developer" ? tx("Developer", "Developer", "للمطورين") : tx("Utilitas", "Utility", "أدوات")}</button>)}</div><span className="result-count">{visibleTools.length.toString().padStart(2, "0")} TOOLS</span></div>
      <div className="tools-grid">{visibleTools.map((tool, index) => <article className="tool-card functional-tool-card" key={tool.id}><div className="functional-tool-top"><span className="tool-category">{tool.category.toUpperCase()}</span><span className="functional-tool-index">0{index + 1}</span></div><div className="functional-tool-mark">{tool.mark}</div><h3>{tool.name}</h3><p>{tool.description}</p><button className="text-link" onClick={() => openTool(tool.id)}>{tx("Buka alat", "Open tool", "افتح الأداة")} ↗</button></article>)}</div>
    </> : <div className="tool-workspace">
      <div className="tool-workspace-head"><button className="tool-back" onClick={closeTool}>← {tx("Semua alat", "All tools", "كل الأدوات")}</button><span className="tool-category">{selected.category.toUpperCase()}</span></div>
      <div className="tool-workspace-title"><div><span className="section-kicker">NEFTIS UTILITY / {selected.id.toUpperCase()}</span><h2>{selected.name}</h2><p>{selected.description}</p></div><span className="functional-tool-mark">{selected.mark}</span></div>
      <div className="tool-editor-grid">
        <div className="tool-editor-panel"><label className="tool-field-label">{active === "color" ? tx("Nilai warna", "Color value", "قيمة اللون") : tx("Input", "Input", "الإدخال")}</label>
          {active === "color" ? <input className="tool-text-input" value={colorValue} onChange={(event) => {setColorValue(event.target.value);resetResult();}} placeholder="#D4F36A" /> : active === "units" ? <>
            <input className="tool-text-input" value={input} onChange={(event) => {setInput(event.target.value);resetResult();}} inputMode="decimal" placeholder="Enter a number" />
            <div className="tool-options"><select value={unitType} onChange={(event) => {setUnitType(event.target.value);setUnitFrom(event.target.value === "length" ? "m" : event.target.value === "weight" ? "kg" : "c");setUnitTo(event.target.value === "length" ? "km" : event.target.value === "weight" ? "g" : "f");resetResult();}}><option value="length">Length</option><option value="weight">Weight</option><option value="temperature">Temperature</option></select><select value={unitFrom} onChange={(event) => {setUnitFrom(event.target.value);resetResult();}}>{unitOptions(unitType).map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select><span>→</span><select value={unitTo} onChange={(event) => {setUnitTo(event.target.value);resetResult();}}>{unitOptions(unitType).map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select></div>
          </> : <>
            {active === "text" && <div className="tool-options"><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="uppercase">UPPERCASE</option><option value="lowercase">lowercase</option><option value="title">Title Case</option><option value="clean">Clean spacing</option></select></div>}
            {active === "base64" && <div className="tool-options"><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="encode">Encode to Base64</option><option value="decode">Decode from Base64</option></select></div>}
            {active === "json" && <div className="tool-options"><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="format">Format / validate</option><option value="minify">Minify JSON</option></select></div>}
            <textarea className="tool-textarea" value={input} onChange={(event) => {setInput(event.target.value);resetResult();}} placeholder={active === "json" ? '{\n  "name": "Neftis"\n}' : tx("Masukkan teks di sini...", "Enter text here...", "أدخل النص هنا...")} spellCheck={false} />
          </>}
          <div className="tool-run-row"><button className="button button-primary" onClick={run}>{tx("Proses", "Process", "معالجة")} ↗</button><button className="button button-quiet" onClick={() => {setInput("");setOutput("");setError("");}}> {tx("Bersihkan", "Clear", "مسح")}</button></div>
        </div>
        <div className="tool-output-panel"><div className="tool-output-head"><label className="tool-field-label">{tx("Hasil", "Result", "النتيجة")}</label>{output && <button className="tool-copy" onClick={copyResult}>{copied ? tx("Tersalin", "Copied", "تم النسخ") : tx("Salin", "Copy", "نسخ")}</button>}</div>{error ? <div className="tool-error" role="alert">{error}</div> : output ? <pre className="tool-output">{output}</pre> : <div className="tool-empty-result"><span>↳</span><p>{tx("Hasil akan muncul di sini.", "Your result will appear here.", "ستظهر النتيجة هنا.")}</p></div>}</div>
      </div>
      {active === "words" && <div className="word-live-stats"><div><strong>{(input.trim().match(/\S+/g) ?? []).length}</strong><span>{tx("Kata", "Words", "كلمات")}</span></div><div><strong>{input.length}</strong><span>{tx("Karakter", "Characters", "أحرف")}</span></div><div><strong>{input.length ? input.split(/\r\n|\r|\n/).length : 0}</strong><span>{tx("Baris", "Lines", "أسطر")}</span></div></div>}
    </div>}
  </section>;
}

function unitOptions(type: string) {
  if (type === "weight") return [{ value: "kg", label: "Kilogram (kg)" }, { value: "g", label: "Gram (g)" }, { value: "lb", label: "Pound (lb)" }, { value: "oz", label: "Ounce (oz)" }];
  if (type === "temperature") return [{ value: "c", label: "Celsius (°C)" }, { value: "f", label: "Fahrenheit (°F)" }, { value: "k", label: "Kelvin (K)" }];
  return [{ value: "m", label: "Meter (m)" }, { value: "km", label: "Kilometer (km)" }, { value: "cm", label: "Centimeter (cm)" }, { value: "mm", label: "Millimeter (mm)" }, { value: "mi", label: "Mile (mi)" }, { value: "ft", label: "Foot (ft)" }];
}

function convertUnit(value: number, type: string, from: string, to: string) {
  if (type === "temperature") {
    const celsius = from === "f" ? (value - 32) * 5 / 9 : from === "k" ? value - 273.15 : value;
    return Number((to === "f" ? celsius * 9 / 5 + 32 : to === "k" ? celsius + 273.15 : celsius).toFixed(6));
  }
  const factors: Record<string, Record<string, number>> = {
    length: { m: 1, km: 1000, cm: .01, mm: .001, mi: 1609.344, ft: .3048 },
    weight: { kg: 1, g: .001, lb: .45359237, oz: .028349523125 },
  };
  return Number((value * factors[type][from] / factors[type][to]).toFixed(8));
}

function convertColor(value: string) {
  const hex = value.trim().replace(/^#/, "");
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error("Enter a valid 3- or 6-digit HEX color.");
  const full = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min;
  let h = 0;
  if (delta) h = max === rn ? ((gn - bn) / delta) % 6 : max === gn ? (bn - rn) / delta + 2 : (rn - gn) / delta + 4;
  h = Math.round(h * 60); if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { hex: `#${full.toUpperCase()}`, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` };
}
