import { createClient } from '@/lib/supabaseServer';
import FailureFeed from '@/components/FailureFeed';

export default async function Home() {
  const supabase = await createClient();

  // Fetch the first page of failures (newest first, limit 6)
  // This does not require an active user session, enabling public guest viewing
  const { data: failures, error } = await supabase
    .from('failures')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .range(0, 5);

  if (error) {
    console.error('Error loading initial failures feed:', error);
  }

  const initialFailures = failures || [];

  return (
    <div className="mx-auto max-w-[600px] w-full py-4">
      {/* Centered feed column, max-width ~600px per FRONTEND_SPEC */}
      <FailureFeed initialFailures={initialFailures} />
    </div>
  );
}
