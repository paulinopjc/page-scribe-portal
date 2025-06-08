import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import CustomVideo from '@/extensions/CustomVideo';
import { supabase } from '@/lib/supabaseClient';

const ToolbarButton = ({ onClick, active, label, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-pressed={active || false}
    type="button"
    className={`toolbar-btn ${active ? 'active' : ''}`}
    aria-label={ariaLabel}
  >
    {label}
  </button>
);

const EditorWithToolbar = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const textareaRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Image, CustomVideo, Underline],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtmlContent(html);
    },
  });

  const uploadImageToSupabase = async (file) => {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `public/${fileName}`;

      const { data: existingFiles, error: listError } = await supabase.storage
        .from('reactbase')
        .list('public', { limit: 1000 });

      if (!listError && existingFiles.find((f) => f.name === fileName)) {
        const { data } = supabase.storage.from('reactbase').getPublicUrl(filePath);
        return data.publicUrl;
      }

      const { error: uploadError } = await supabase.storage
        .from('reactbase')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        return null;
      }

      const { data } = supabase.storage.from('reactbase').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const addImage = async (file) => {
    const url = await uploadImageToSupabase(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    } else {
      alert('Failed to upload image');
    }
  };

  const addVideo = (file) => {
    const url = URL.createObjectURL(file);
    editor.chain().focus().insertContent(`<video src="${url}" controls style="max-width: 100%;"></video>`).run();
  };

  const saveHtmlContent = () => {
    editor.commands.setContent(htmlContent);
    setShowHtmlModal(false);
  };

  const cancelHtmlEdit = () => {
    setHtmlContent(editor.getHTML());
    setShowHtmlModal(false);
  };

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setHtmlContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (showHtmlModal) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => textareaRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = '';
    }
  }, [showHtmlModal]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && showHtmlModal) {
        e.preventDefault();
        cancelHtmlEdit();
      }
    },
    [showHtmlModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!editor) return null;

  return (
    <>
      <style>{`
        /* Toolbar container */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          background-color: #f9fafb;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px 12px;
          user-select: none;
          margin-bottom: 14px;
        }

        /* Toolbar buttons */
        .toolbar-btn {
          background-color: transparent;
          border: none;
          padding: 8px 14px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.15s ease, color 0.15s ease;
          color: #374151;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          user-select: none;
        }

        .toolbar-btn:hover,
        .toolbar-btn:focus-visible {
          background-color: #e0e7ff;
          outline: none;
          color: #4338ca;
          box-shadow: 0 0 0 2px #4338ca;
        }

        .toolbar-btn.active {
          background-color: #4338ca;
          color: #ffffff;
        }

        /* Editor content */
        .editor {
          min-height: 280px;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          background-color: #fff;
          overflow-y: auto;
        }

        .modal-content ul,
        .editor ul {
            list-style-type: disc;
            margin-left: 1.25rem; /* indent */
            padding-left: 0;
        }

        .modal-content ol,
        .editor ol {
            list-style-type: decimal;
            margin-left: 1.25rem;
            padding-left: 0;
        }

        .modal-content li,
        .editor li {
            margin-bottom: 0.25rem;
        }

        /* Modal backdrop */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.25s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Modal content */
        .modal-content {
          background: white;
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          border-radius: 10px;
          padding: 24px 32px 32px 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          position: relative;
          animation: scaleIn 0.3s ease forwards;
          overflow: hidden;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Modal header */
        .modal-content h2 {
          margin: 0 0 18px 0;
          font-weight: 700;
          font-size: 22px;
          color: #111827;
          user-select: none;
        }

        /* Modal body: split textarea and preview */
        .modal-body {
          flex: 1;
          display: flex;
          gap: 20px;
          overflow: hidden;
          border-radius: 8px;
        }

        .modal-textarea {
          flex: 1;
          font-family: 'Source Code Pro', monospace, monospace;
          font-size: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          resize: vertical;
          min-height: 350px;
          overflow-y: auto;
          color: #111827;
          outline-offset: 2px;
        }

        .modal-preview {
          flex: 1;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow-y: auto;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
          user-select: none;
          box-shadow: inset 0 0 5px #e5e7eb;
        }

        /* Modal footer */
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          gap: 14px;
        }

        .modal-footer button {
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border-radius: 6px;
          padding: 10px 22px;
          border: none;
          transition: background-color 0.15s ease;
          user-select: none;
        }

        .btn-cancel {
          background-color: transparent;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        .btn-cancel:hover,
        .btn-cancel:focus-visible {
          background-color: #f3f4f6;
          outline: none;
        }

        .btn-save {
          background-color: #4338ca;
          color: white;
        }
        .btn-save:hover,
        .btn-save:focus-visible {
          background-color: #312e81;
          outline: none;
        }

      `}</style>

      <div className="toolbar">
        {['paragraph', 'bold', 'italic', 'underline', 'strike'].map((type) => (
          <ToolbarButton
            key={type}
            onClick={() => editor.chain().focus()[`toggle${type.charAt(0).toUpperCase() + type.slice(1)}`]?.().run() || editor.chain().focus().setParagraph().run()}
            active={editor.isActive(type)}
            label={type === 'paragraph' ? 'P' : type === 'bold' ? <strong>B</strong> : type === 'italic' ? <em>I</em> : type === 'underline' ? <u>U</u> : <s>S</s>}
            ariaLabel={type.charAt(0).toUpperCase() + type.slice(1)}
          />
        ))}
        <ToolbarButton onClick={() => {
            setShowHtmlModal(true);
            setHtmlContent(editor.getHTML());
        }}
            active={editor.isActive('code')}
            label={'</>'}
            ariaLabel="Code"
        />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} label={'H1'} ariaLabel="Heading 1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label={'H2'} ariaLabel="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label={'• List'} ariaLabel="Bullet list" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label={'1. List'} ariaLabel="Ordered list" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} 
            active={editor.isActive('horizontalRule')}
            label={'—'} 
            ariaLabel="Horizontal rule" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} 
            active={editor.isActive('undo')}
            label={'↺'} 
            ariaLabel="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} 
            active={editor.isActive('redo')}
            label={'↻'} 
            ariaLabel="Redo" />
        <button type="button" className="toolbar-btn" onClick={() => fileInputRef.current?.click()} title="Upload image">📷</button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={async (e) => { const file = e.target.files?.[0]; if (file) { await addImage(file); e.target.value = ''; } }} style={{ display: 'none' }} />
        <button type="button" className="toolbar-btn" onClick={() => videoInputRef.current?.click()} title="Upload video">🎬</button>
        <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) { addVideo(file); e.target.value = ''; } }} style={{ display: 'none' }} />
      </div>
      <EditorContent editor={editor} className="editor" />
      {showHtmlModal && (
        <div className="modal-backdrop" onClick={() => cancelHtmlEdit()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit HTML Content</h2>
            <div className="modal-body">
              <textarea ref={textareaRef} className="modal-textarea" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} spellCheck={false} />
              <div className="modal-preview" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelHtmlEdit}>Cancel</button>
              <button className="btn-save" onClick={saveHtmlContent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditorWithToolbar;
