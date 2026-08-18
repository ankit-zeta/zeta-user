"use client";

import React from "react";

// Minimal line-based renderer for lesson content stored in Convex.
// Supported syntax: ## / ### headings, > callouts, - bullets, 1. steps,
// "- [ ]" checklists, --- dividers, **bold**, *italic*, `code`.
type InlineNode = string | { b: string } | { i: string } | { c: string };

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) nodes.push({ b: token.slice(2, -2) });
    else if (token.startsWith("`")) nodes.push({ c: token.slice(1, -1) });
    else nodes.push({ i: token.slice(1, -1) });
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((n, i) =>
        typeof n === "string" ? (
          <span key={i}>{n}</span>
        ) : "b" in n ? (
          <strong key={i} className="font-semibold text-textMain">
            {n.b}
          </strong>
        ) : "i" in n ? (
          <em key={i}>{n.i}</em>
        ) : (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-800 text-[0.9em] font-mono"
          >
            {n.c}
          </code>
        )
      )}
    </>
  );
}

interface RichTextProps {
  content: string;
}

export default function RichText({ content }: RichTextProps) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listOrdered) {
      blocks.push(
        <ol key={`ol-${key++}`} className="space-y-2.5">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-textMain/90">
              <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="min-w-0">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${key++}`} className="space-y-2.5">
          {listItems.map((item, i) =>
            item.startsWith("[ ] ") ? (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-textMain/90">
                <span className="shrink-0 w-4 h-4 mt-0.5 rounded border-2 border-brand-600/60 bg-white" />
                <span className="min-w-0">
                  <Inline text={item.slice(4)} />
                </span>
              </li>
            ) : (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-textMain/90">
                <span className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-brand-600" />
                <span className="min-w-0">
                  <Inline text={item} />
                </span>
              </li>
            )
          )}
        </ul>
      );
    }
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.trim() === "---") {
      flushList();
      blocks.push(<hr key={`hr-${key++}`} className="border-t border-borderSubtle my-2" />);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!listOrdered && listItems.length > 0) flushList();
      listOrdered = false;
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listOrdered || listItems.length === 0) {
        if (listItems.length > 0) flushList();
        listOrdered = true;
      } else {
        flushList();
        listOrdered = true;
      }
      listItems.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushList();
      blocks.push(
        <blockquote
          key={`q-${key++}`}
          className="border-l-4 border-brand-600 bg-brand-50/70 rounded-r-lg px-4 py-3.5 text-sm leading-relaxed text-brand-900"
        >
          <Inline text={line.replace(/^>\s?/, "")} />
        </blockquote>
      );
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      flushList();
      const level = line.match(/^#+/)?.[0].length ?? 2;
      const text = line.replace(/^#+\s+/, "");
      if (level === 1) {
        blocks.push(
          <h2 key={`h-${key++}`} className="text-xl sm:text-2xl font-bold text-textMain tracking-tight">
            <Inline text={text} />
          </h2>
        );
      } else if (level === 2) {
        blocks.push(
          <h3 key={`h-${key++}`} className="text-lg font-bold text-textMain">
            <Inline text={text} />
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={`h-${key++}`} className="text-base font-bold text-brand-800">
            <Inline text={text} />
          </h4>
        );
      }
      continue;
    }
    flushList();
    blocks.push(
      <p key={`p-${key++}`} className="text-sm leading-relaxed text-textMain/90">
        <Inline text={line} />
      </p>
    );
  }
  flushList();

  return <div className="space-y-5">{blocks}</div>;
}