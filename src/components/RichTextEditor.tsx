'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { Bold, Italic, Underline, Strikethrough, LucideIcon } from 'lucide-react';
import { sanitizeHtml } from '@/lib/richtext';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  toolbarClassName?: string;
  autoFocus?: boolean;
  extraToolbar?: React.ReactNode;
}

function ToolbarButton({
  icon: Icon,
  label,
  onExec,
}: {
  icon: LucideIcon;
  label: string;
  onExec: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onExec();
      }}
      className="p-2 rounded-btn text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
    >
      <Icon size={16} />
    </button>
  );
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor(
  { value, onChange, placeholder, className = '', toolbarClassName = '', autoFocus, extraToolbar },
  forwardedRef
) {
  const innerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement);

  // Set the initial content once; subsequent edits flow through onInput, not props,
  // so we don't clobber the caret position/selection while the user is typing.
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.innerHTML = value && value.trim() ? value : '<p><br></p>';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    onChange(innerRef.current?.innerHTML || '');
  };

  const exec = (command: string) => {
    innerRef.current?.focus();
    document.execCommand(command, false);
    emitChange();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html ? sanitizeHtml(html) : text.replace(/\n/g, '<br>'));
    emitChange();
  };

  const isEmpty = !value || value === '<p><br></p>';

  return (
    <div className="w-full">
      <div className={`flex items-center gap-0.5 mb-2 border border-border rounded-btn bg-elevated p-1 w-fit ${toolbarClassName}`}>
        <ToolbarButton icon={Bold} label="Tebal" onExec={() => exec('bold')} />
        <ToolbarButton icon={Italic} label="Miring" onExec={() => exec('italic')} />
        <ToolbarButton icon={Underline} label="Garis bawah" onExec={() => exec('underline')} />
        <ToolbarButton icon={Strikethrough} label="Coret" onExec={() => exec('strikeThrough')} />
        {extraToolbar}
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <div className="absolute inset-0 pointer-events-none text-ink-muted">{placeholder}</div>
        )}
        <div
          ref={innerRef}
          contentEditable
          suppressContentEditableWarning
          autoFocus={autoFocus}
          onInput={emitChange}
          onPaste={handlePaste}
          className={className}
        />
      </div>
    </div>
  );
});

export default RichTextEditor;
