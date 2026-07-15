'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'rounded-lg p-2 text-sm transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function MenuBar({ editor }: { editor: Editor }) {
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const items = [
    { onClick: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: Bold, title: 'Bold' },
    { onClick: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: Italic, title: 'Italic' },
    { onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), icon: Heading1, title: 'Heading 1' },
    { onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), icon: Heading2, title: 'Heading 2' },
    { onClick: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), icon: List, title: 'Bullet List' },
    { onClick: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), icon: ListOrdered, title: 'Ordered List' },
    { onClick: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), icon: Quote, title: 'Quote' },
    { onClick: addLink, active: editor.isActive('link'), icon: LinkIcon, title: 'Link' },
    { onClick: addImage, active: false, icon: ImageIcon, title: 'Image' },
    { onClick: () => editor.chain().focus().undo().run(), active: false, icon: Undo, title: 'Undo' },
    { onClick: () => editor.chain().focus().redo().run(), active: false, icon: Redo, title: 'Redo' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border-light bg-surface/80 px-3 py-2">
      {items.map((item) => (
        <ToolbarButton key={item.title} onClick={item.onClick} active={item.active} title={item.title}>
          <item.icon size={16} />
        </ToolbarButton>
      ))}
    </div>
  );
}

export function RichTextEditor({ content, onChange, placeholder, minHeight = '300px' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border-light bg-surface shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <MenuBar editor={editor as Editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
