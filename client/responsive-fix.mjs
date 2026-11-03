// Run from the client/ folder:  node responsive-fix.mjs
import fs from "node:fs";

const edits = {
  "app/(site)/about/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"]],
  "app/(site)/contact/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"], ["p-6 lg:p-8", "p-3 sm:p-6 lg:p-8"]],
  "app/(site)/education/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"], ['bodyClassName="p-6 lg:p-8"', 'bodyClassName="p-4 sm:p-6 lg:p-8"']],
  "app/(site)/loading.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"]],
  "app/(site)/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"]],
  "app/(site)/projects/[slug]/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"]],
  "app/(site)/projects/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"]],
  "app/(site)/resume/page.js": [['"p-6 lg:p-10 flex', '"p-4 sm:p-6 lg:p-10 flex'], ['bg-bg p-6 lg:p-10', 'bg-bg p-3 sm:p-6 lg:p-10']],
  "app/(site)/skills/page.js": [["p-6 lg:p-10", "p-4 sm:p-6 lg:p-10"], ['bodyClassName="p-6 lg:p-8"', 'bodyClassName="p-4 sm:p-6 lg:p-8"']],
  "app/admin/(protected)/about/page.js": [['"flex flex-1 flex-col', '"flex min-w-0 flex-1 flex-col'], ['"grid flex-1 ', '"grid min-w-0 flex-1 ']],
  "app/admin/(protected)/resume/page.js": [['"flex flex-1 flex-col', '"flex min-w-0 flex-1 flex-col'], ['"grid flex-1 ', '"grid min-w-0 flex-1 ']],
  "app/globals.css": [[
    "    @apply bg-bg text-text-body font-sans antialiased;\n  }\n}",
    "    @apply bg-bg text-text-body font-sans antialiased;\n  }\n\n  /* Long unbroken words (titles, URLs, emails) wrap instead of pushing the page wider than a phone screen. */\n  h1, h2, h3, h4, h5, p, li, dd, dt, blockquote {\n    overflow-wrap: anywhere;\n  }\n}",
  ]],
  "components/admin/forms/Field.jsx": [['"w-full rounded-md border', '"w-full min-w-0 rounded-md border']],
  "components/admin/forms/RowControls.jsx": [['"inline-flex size-7 items-center', '"inline-flex size-9 sm:size-7 items-center']],
  "components/sections/about/IntroTerminal.jsx": [["p-6 lg:p-8", "p-4 sm:p-6 lg:p-8"]],
  "components/sections/about/JourneyTimeline.jsx": [["p-6 lg:p-8", "p-4 sm:p-6 lg:p-8"]],
  "components/sections/contact/ClosingTerminal.jsx": [['bodyClassName="p-6 ', 'bodyClassName="p-4 sm:p-6 ']],
  "components/sections/contact/ContactForm.jsx": [
    ['<div className="flex items-center justify-between gap-4 pt-1">', '<div className="flex flex-col-reverse items-stretch sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-1">'],
    ['className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5', 'className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5'],
  ],
  "components/sections/contact/ContactInfoPanel.jsx": [
    ['className="p-6 flex flex-col gap-5 h-full"', 'className="p-4 sm:p-6 flex flex-col gap-5 h-full"'],
    ["text-text-heading text-sm truncate", "text-text-heading text-sm [overflow-wrap:anywhere]"],
    ["flex items-center gap-3 px-3 py-2.5 rounded-control hover", "flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-control hover"],
    ['<div key={method.key} className="flex items-center gap-3 px-3 py-2.5">', '<div key={method.key} className="flex items-center gap-3 px-2 sm:px-3 py-2.5">'],
  ],
  "components/sections/home/BottomTerminal.jsx": [["p-6 lg:p-8", "p-4 sm:p-6 lg:p-8"]],
  "components/sections/home/HeroTerminal.jsx": [["p-10 lg:p-12", "p-6 sm:p-10 lg:p-12"]],
  "components/sections/resume/ResumeDocument.jsx": [["p-8 sm:p-10", "p-5 sm:p-10"]],
  "components/sections/resume/ResumeSection.jsx": [['"flex items-center justify-between border-b-2', '"flex flex-wrap items-baseline justify-between gap-x-3 border-b-2']],
  "components/ui/CaseStudySection.jsx": [["p-6 lg:p-8", "p-4 sm:p-6 lg:p-8"]],
  "components/ui/SectionHeader.jsx": [
    ['<div className="flex items-center justify-between w-full">', '<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 w-full">'],
    ['<div className="flex items-center gap-2">', '<div className="flex flex-wrap items-center gap-x-2">'],
  ],
  "components/ui/TerminalWindow.jsx": [
    ['<div className="flex gap-2 items-center text-text-body', '<div className="flex gap-2 items-center min-w-0 text-text-body'],
    ["<span>{title}</span>", '<span className="truncate">{title}</span>'],
    ['<div className="flex items-center gap-2">{right}</div>', '<div className="flex items-center gap-2 shrink-0">{right}</div>'],
  ],
  "components/ui/ThemeToggle.jsx": [['"inline-flex items-center justify-center size-9 ', '"inline-flex items-center justify-center size-9 shrink-0 ']],
};

let changed = 0, missing = 0;
for (const [file, pairs] of Object.entries(edits)) {
  if (!fs.existsSync(file)) { console.log("NOT FOUND:", file); missing++; continue; }
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) {
    if (text.includes(to)) continue;                                   // already applied
    if (!text.includes(from)) { console.log("MISSING in", file, "->", from.slice(0, 50)); missing++; continue; }
    text = text.split(from).join(to);
    changed++;
  }
  fs.writeFileSync(file, text);
}
console.log(`done: ${changed} replacements, ${missing} problems`);