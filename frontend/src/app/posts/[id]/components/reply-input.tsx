
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ReplyInputProps {
  onPostResponse: (text: string) => Promise<boolean>;
}

export function ReplyInput({ onPostResponse }: ReplyInputProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: body,
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert min-h-[80px] outline-none",
      },
    },
  });

  const handleSubmit = async () => {
    if (!editor || !editor.getText().trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onPostResponse(editor.getHTML());
    setIsSubmitting(false);

    if (success) {
      editor.commands.clearContent(); 
      setBody(''); 
    }
  };

  return (
    <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl p-4 space-y-3 w-full">
      <p className="text-xs font-semibold text-gray-300 tracking-tight">Write a response</p>
      <EditorContent
        editor={editor}
        className="bg-[#0f1115] border-[#2c323f] text-sm text-gray-200 placeholder:text-gray-600 focus-visible:ring-[#e95723]/40 focus-visible:border-[#e95723]/60 rounded-lg min-h-[80px] font-normal"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          className="bg-[#e95723] hover:bg-[#d44e1f] text-white text-xs font-semibold gap-1.5 h-8 tracking-wide"
          disabled={!editor || !editor.getText().trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              Post Response
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}