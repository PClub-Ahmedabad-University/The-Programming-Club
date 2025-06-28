'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function RichTextRenderer({ content, className = '' }) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-xl sm:text-2xl font-bold text-blue-300 mb-4 border-b border-blue-500/30 pb-2"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-lg sm:text-xl font-semibold text-blue-100 mb-3"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-base sm:text-lg font-medium text-gray-100 mb-2"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-md sm:text-lg text-gray-200 mb-4 leading-relaxed"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-2 mb-4 text-gray-200"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-2 mb-4 text-gray-200 pl-4"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className="text-md sm:text-lg text-gray-200 pl-2"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 italic text-gray-300 mb-4 bg-gray-800/50 p-3 rounded-r"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-md sm:text-lg font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-800/80 p-4 rounded-lg overflow-x-auto my-4">
                <code className="font-mono text-md sm:text-lg" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
