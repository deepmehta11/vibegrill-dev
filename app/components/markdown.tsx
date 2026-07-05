"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 font-display text-xl font-semibold text-fg first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-2 font-display text-lg font-semibold text-fg first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold text-fg first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-muted">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-1.5 pl-5 text-muted marker:text-faint list-disc">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-1.5 pl-5 text-muted marker:text-faint list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="text-fg/90 italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-ember underline decoration-ember/40 underline-offset-2 hover:decoration-ember"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded-md border border-line-soft bg-panel-2 px-1.5 py-0.5 font-mono text-[0.82em] text-ember-bright">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-md border border-line bg-[#0a0c0b] p-3 font-mono text-sm text-fg">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-ember/50 bg-ember-soft/30 py-1 pl-4 text-muted italic">
      {children}
    </blockquote>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
