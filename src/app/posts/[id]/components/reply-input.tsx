
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ReplyInputProps {
  onPostResponse: (text: string) => Promise<boolean>;
}

export function ReplyInput({ onPostResponse }: ReplyInputProps) {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onPostResponse(replyText);
    setIsSubmitting(false);

    if (success) {
      setReplyText('');
    }
  };

  return (
    <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl p-4 space-y-3 w-full">
      <p className="text-xs font-semibold text-gray-300 tracking-tight">Write a response</p>
      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        disabled={isSubmitting}
        placeholder={isSubmitting ? "Sending your response..." : "Share your thoughts or solution..."}
        className="bg-[#0f1115] border-[#2c323f] text-sm text-gray-200 placeholder:text-gray-600 resize-none focus-visible:ring-[#e95723]/40 focus-visible:border-[#e95723]/60 rounded-lg min-h-[80px] font-normal"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          className="bg-[#e95723] hover:bg-[#d44e1f] text-white text-xs font-semibold gap-1.5 h-8 tracking-wide"
          disabled={!replyText.trim() || isSubmitting}
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