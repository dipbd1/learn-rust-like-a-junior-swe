import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse markdown lines into structured elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        const codeText = codeBlockLines.join('\n');
        const currentIdx = blockIndex++;
        elements.push(
          <div key={`code-block-${i}`} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-slate-300">
              <span className="font-semibold text-[11px] text-amber-400 uppercase tracking-wider">{codeBlockLanguage || 'rust'}</span>
              <button
                onClick={() => copyCode(codeText, currentIdx)}
                className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedIndex === currentIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIndex === currentIdx ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-amber-500/30">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLanguage = '';
      } else {
        // Opening code block
        inCodeBlock = true;
        codeBlockLanguage = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-slate-100 mt-4 mb-2 flex items-center gap-2">
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold text-amber-300 mt-3 mb-1.5">
          {formatInline(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    // Unordered lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-slate-300 text-sm my-1 leading-relaxed">
          {formatInline(line.substring(2))}
        </li>
      );
      continue;
    }

    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <li key={`num-li-${i}`} className="ml-4 list-decimal text-slate-300 text-sm my-1 leading-relaxed">
          {formatInline(numMatch[2])}
        </li>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Regular paragraphs
    elements.push(
      <p key={`p-${i}`} className="text-slate-300 text-sm leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
};

function formatInline(text: string): React.ReactNode[] {
  // Regex parsing for bold **text**, inline `code`, and plain text
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700/80 font-mono text-xs font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
