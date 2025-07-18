'use client'

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useState } from 'react';

// Custom CSS for the editor content
const editorStyles = `
  .ProseMirror {
    min-height: 300px;
    padding: 1rem;
    color: #e5e7eb;
  }
  
  .ProseMirror a {
    color: #3b82f6;
    text-decoration: none;
  }
  
  .ProseMirror a:hover {
    text-decoration: underline;
  }
  
  .ProseMirror pre {
    background: #1f2937;
    color: #f3f4f6;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    overflow-x: auto;
  }
  
  .ProseMirror code {
    background: #1f2937;
    color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-size: 0.9em;
  }
  
  .ProseMirror blockquote {
    border-left: 3px solid #3b82f6;
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: #9ca3af;
  }
  
  .ProseMirror ul, .ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  
  .ProseMirror h1 {
    font-size: 2em;
    font-weight: bold;
    margin: 0.67em 0;
  }
  
  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.83em 0;
  }
`;

const Tiptap = ({ content, onChange }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-800 rounded p-4 my-2',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      })
    ],
    content: content || '<p style="color: white;">Start writing your blog post here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-white',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  // Update content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="min-h-[300px] bg-gray-900/50 rounded-lg border border-white/10 p-4">Loading editor...</div>;
  }

  const setLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/50 overflow-hidden">
      <style jsx global>{editorStyles}</style>
      <MenuBar editor={editor} showLinkInput={showLinkInput} setShowLinkInput={setShowLinkInput} setLinkUrl={setLinkUrl} setLink={setLink} linkUrl={linkUrl} />
      {showLinkInput && (
        <div className="p-2 bg-gray-800/50 border-b border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL"
              className="flex-1 px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-pclubPrimary focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <button
              onClick={setLink}
              className="px-3 py-1 bg-pclubPrimary text-white rounded text-sm hover:bg-pclubPrimary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} className="min-h-[300px]" />
    </div>
  );
};

// Basic menu bar with common formatting options
const MenuBar = ({ editor, showLinkInput, setShowLinkInput, setLinkUrl, setLink, linkUrl }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    { 
      title: 'Bold', 
      onClick: () => editor.chain().focus().toggleBold().run(), 
      icon: 'B',
      isActive: () => editor.isActive('bold')
    },
    { 
      title: 'Italic', 
      onClick: () => editor.chain().focus().toggleItalic().run(), 
      icon: 'I',
      isActive: () => editor.isActive('italic')
    },
    { 
      title: 'Heading 1', 
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 
      icon: 'H1',
      isActive: () => editor.isActive('heading', { level: 1 })
    },
    { 
      title: 'Heading 2', 
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 
      icon: 'H2',
      isActive: () => editor.isActive('heading', { level: 2 })
    },
    { 
      title: 'Bullet List', 
      onClick: () => editor.chain().focus().toggleBulletList().run(), 
      icon: '•',
      isActive: () => editor.isActive('bulletList')
    },
    { 
      title: 'Numbered List', 
      onClick: () => editor.chain().focus().toggleOrderedList().run(), 
      icon: '1.',
      isActive: () => editor.isActive('orderedList')
    },
    { 
      title: 'Code', 
      onClick: () => editor.chain().focus().toggleCodeBlock().run(), 
      icon: '</>',
      isActive: () => editor.isActive('codeBlock')
    },
    { 
      title: 'Blockquote', 
      onClick: () => editor.chain().focus().toggleBlockquote().run(), 
      icon: '❝',
      isActive: () => editor.isActive('blockquote')
    },
    { 
      title: 'Horizontal Rule', 
      onClick: () => editor.chain().focus().setHorizontalRule().run(), 
      icon: '―' 
    },
    { 
      title: 'Link', 
      onClick: () => setShowLinkInput(true), 
      icon: '🔗',
      custom: true
    },
    { 
      title: 'Image', 
      onClick: () => {
        const url = window.prompt('Enter the URL of the image:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }, 
      icon: '🖼️' 
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-gray-900/50">
      {buttons.map((btn, index) => (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (btn.custom) {
              btn.onClick();
            } else {
              btn.onClick();
              editor.chain().focus().run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-700/50 transition-colors ${
            (btn.isActive ? btn.isActive() : editor?.isActive(btn.title.toLowerCase())) 
              ? 'bg-pclubPrimary/20 text-pclubPrimary' 
              : 'text-gray-300'
          }`}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

export default Tiptap;
