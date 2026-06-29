'use client';

import { useState, KeyboardEvent, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface PostFormProps {
  user: User;
  existingCategories: string[];
}

const DEFAULT_SUGGESTIONS = ['robotics', 'ai/ml', 'web/app', 'embedded', 'hardware', 'other'];

export default function PostForm({ user, existingCategories }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [problem, setProblem] = useState('');
  const [whatTried, setWhatTried] = useState('');
  const [whyFailed, setWhyFailed] = useState('');

  // Tag fields
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Image upload fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Deduplicate and combine database categories + default suggestions
  const suggestedCategories = Array.from(
    new Set([
      ...existingCategories.map((c) => c.toLowerCase()),
      ...DEFAULT_SUGGESTIONS,
    ])
  );

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit.');
        return;
      }
      setError(null);
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedCategory = category.trim().toLowerCase();
    if (!title.trim() || !normalizedCategory || !problem.trim() || !whatTried.trim() || !whyFailed.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    let imageUrl = null;

    try {
      // 1. Upload image to Storage if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('failure-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('failure-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // 2. Insert failure entry
      const { data, error: insertError } = await supabase
        .from('failures')
        .insert({
          user_id: user.id,
          title: title.trim(),
          category: normalizedCategory,
          problem: problem.trim(),
          what_tried: whatTried.trim(),
          why_failed: whyFailed.trim(),
          tags: tags.length > 0 ? tags : null,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/failure/${data.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    category.trim().length > 0 &&
    problem.trim().length > 0 &&
    whatTried.trim().length > 0 &&
    whyFailed.trim().length > 0 &&
    title.length <= 100 &&
    problem.length <= 2000 &&
    whatTried.length <= 2000 &&
    whyFailed.length <= 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 font-mono text-xs text-red-400">
          Error: {error}
        </div>
      )}

      {/* Title */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="title" className="block font-mono text-sm font-semibold text-zinc-300">
            Title <span className="text-red-500">*</span>
          </label>
          <span className={`font-mono text-[10px] ${title.length > 100 ? 'text-red-400' : 'text-zinc-500'}`}>
            {title.length}/100
          </span>
        </div>
        <input
          id="title"
          type="text"
          placeholder="What project broke? (e.g. Raspberry Pi I2C connection fails)"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 110))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block font-mono text-sm font-semibold text-zinc-300 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        
        {/* Quick select chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedCategories.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => setCategory(sug)}
              className={`rounded-full px-3 py-1 text-xs font-mono border transition-all duration-200 cursor-pointer ${
                category.trim().toLowerCase() === sug
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              #{sug}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type or select a category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 font-mono"
          required
        />
      </div>

      {/* The Problem */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="problem" className="block font-mono text-sm font-semibold text-zinc-300">
            The Problem <span className="text-red-500">*</span>
          </label>
          <span className={`font-mono text-[10px] ${problem.length > 2000 ? 'text-red-400' : 'text-zinc-500'}`}>
            {problem.length}/2000
          </span>
        </div>
        <textarea
          id="problem"
          placeholder="Describe what went wrong, including error codes or symptoms."
          value={problem}
          onChange={(e) => setProblem(e.target.value.slice(0, 2050))}
          rows={4}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-y"
          required
        />
      </div>

      {/* What I Tried */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="whatTried" className="block font-mono text-sm font-semibold text-zinc-300">
            What I Tried <span className="text-red-500">*</span>
          </label>
          <span className={`font-mono text-[10px] ${whatTried.length > 2000 ? 'text-red-400' : 'text-zinc-500'}`}>
            {whatTried.length}/2000
          </span>
        </div>
        <textarea
          id="whatTried"
          placeholder="What fixes, documentations, or configs did you check?"
          value={whatTried}
          onChange={(e) => setWhatTried(e.target.value.slice(0, 2050))}
          rows={4}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-y"
          required
        />
      </div>

      {/* Why It Failed */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label htmlFor="whyFailed" className="block font-mono text-sm font-semibold text-zinc-300">
            Why It Failed <span className="text-red-500">*</span>
          </label>
          <span className={`font-mono text-[10px] ${whyFailed.length > 2000 ? 'text-red-400' : 'text-zinc-500'}`}>
            {whyFailed.length}/2000
          </span>
        </div>
        <textarea
          id="whyFailed"
          placeholder="The core issue — why didn't the above work? (e.g. Bad pull-up resistor config, version conflict in config files)"
          value={whyFailed}
          onChange={(e) => setWhyFailed(e.target.value.slice(0, 2050))}
          rows={4}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-y"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block font-mono text-sm font-semibold text-zinc-300 mb-2">
          Tags
        </label>
        
        {/* Render tags pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer text-sm font-bold"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type a tag (e.g. i2c, nodejs) and press Enter or Comma..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={handleAddTag}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 font-mono"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-mono text-sm font-semibold text-zinc-300 mb-2">
          Optional Image <span className="text-xs text-zinc-500 font-normal">(Max 5MB)</span>
        </label>
        
        {imagePreview ? (
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/20 p-2 max-w-sm">
            <img src={imagePreview} alt="Preview" className="rounded-lg object-cover max-h-48 w-full" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/70 border border-zinc-800 text-zinc-200 hover:bg-zinc-950 hover:text-red-400 transition-all cursor-pointer shadow-lg"
            >
              &times;
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? 'border-zinc-500 bg-zinc-900/20'
                : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/10'
            }`}
          >
            <svg className="h-8 w-8 text-zinc-500 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <label className="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-zinc-300">
              <span>Drag & drop an image or click to browse</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Sticky Bottom Post Button Panel */}
      <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-zinc-900 bg-zinc-950/95 py-4 backdrop-blur-md flex items-center justify-between gap-4 mt-8">
        <div className="text-[10px] text-zinc-500 font-mono">
          {loading ? 'Uploading & saving...' : 'Fields marked with * are required'}
        </div>
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="rounded-xl bg-zinc-100 px-6 py-2.5 text-xs font-semibold text-zinc-950 transition-all duration-200 hover:bg-white active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer flex items-center gap-2"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span>{loading ? 'Posting...' : 'Post Failure'}</span>
        </button>
      </div>
    </form>
  );
}
