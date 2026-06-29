import { createClient } from '@/lib/supabaseServer';
import PostForm from '@/components/PostForm';
import { redirect } from 'next/navigation';

export default async function NewPostPage() {
  const supabase = await createClient();

  // Retrieve authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Safety fallback: if user is not logged in, redirect to login
  if (!user) {
    redirect('/login?next=/new');
  }

  // Fetch unique categories currently stored in failures
  const { data: failures } = await supabase
    .from('failures')
    .select('category');

  const existingCategories = Array.from(
    new Set(failures?.map((f) => f.category) || [])
  ).filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100 mb-6 text-center sm:text-left">
        Post a Failure Report
      </h1>
      <PostForm user={user} existingCategories={existingCategories} />
    </div>
  );
}
