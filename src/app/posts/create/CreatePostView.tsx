'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PenSquare, Loader2, Tags, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CategoryOption, TagOption } from './type';
import { createPostAction } from './actions';

interface CreatePostViewProps {
  categories: CategoryOption[];
  initialTags: TagOption[];
}

export default function CreatePostView({ categories, initialTags }: CreatePostViewProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  // State array string untuk menampung UUID kumpulan tag terpilih
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Fungsi toggle select UUID tag
  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError('');
    setFieldErrors({});

    // Kirim data payload utuh sesuai interface CreatePostInput kamu
    const result = await createPostAction({
      title,
      body,
      category_id: categoryId,
      tags: selectedTagIds, 
    });

    setLoading(false);

    if (result.success) {
      router.refresh();
      router.push('/home');
    } else {
      if (result.errors) {
        setFieldErrors(result.errors);
      } else {
        setGlobalError(result.message);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      
      {/* Navigation Upper */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white hover:bg-transparent gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="bg-[#0f1115] border-[#1e2129] shadow-2xl text-white rounded-xl">
        <CardHeader className="border-b border-[#1e2129] pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#16181d] rounded-xl text-gray-400 border border-[#22252e]">
              <PenSquare className="h-5 w-5 text-[#e95723]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white">
                Create a New Post
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm mt-0.5">
                Share your thoughts, questions, or ideas with the ForumX community.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {globalError && (
              <div className="p-3 text-sm bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl">
                {globalError}
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                type="text"
                placeholder="Be specific and imagine you’re asking a question to another person..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#16181d] border-[#22252e] text-white placeholder-gray-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:ring-offset-0"
                required
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-[#22252e] bg-[#16181d] px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e95723] disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" className="bg-[#0f1115] text-gray-500">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-[#0f1115] text-white">
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category_id && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.category_id[0]}</p>
              )}
            </div>

            {/* Fitur Pilih Multi-Tags (UUID Match) */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Tags className="h-4 w-4 text-gray-400" />
                <label>Tags <span className="text-xs text-gray-500 font-normal">(Select multiple)</span></label>
              </div>
              
              {initialTags.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-3 bg-[#16181d] rounded-xl border border-[#22252e]">
                  No tags available from Laravel server.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-[#16181d] border border-[#22252e] rounded-xl">
                  {initialTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagClick(tag.id)}
                        className={`cursor-pointer px-3 py-1 text-xs font-bold transition-all border rounded-lg flex items-center gap-1 select-none ${
                          isSelected
                            ? 'bg-[#e95723]/10 border-[#e95723] text-[#e95723] hover:bg-[#e95723]/20 shadow-[0_0_12px_rgba(233,87,35,0.15)]'
                            : 'bg-[#0f1115] border-[#22252e] text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 animate-in fade-in zoom-in-50" />}
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
              {fieldErrors.tags && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.tags[0]}</p>
              )}
            </div>

            {/* Body Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Body Content</label>
              <Textarea
                placeholder="Include all the information someone would need to answer your post..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] bg-[#16181d] border-[#22252e] text-white placeholder-gray-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:ring-offset-0 resize-none leading-relaxed"
                required
              />
              {fieldErrors.body && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.body[0]}</p>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2129]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/home')}
                className="text-gray-400 hover:text-white hover:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#e95723] hover:bg-[#d0481b] text-white font-medium rounded-xl px-5 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Post'
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}