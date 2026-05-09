import Link from "next/link";
import { createServiceClient } from "@/app/lib/supabase/server";
import { HajjRequest } from "@/app/lib/types";

export const revalidate = 60;

export default async function RequestsPage() {
  const supabase = createServiceClient();
  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Open Requests</h1>
        <Link
          href="/requests/new"
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          + New Request
        </Link>
      </div>

      {!requests?.length ? (
        <p className="text-gray-500 text-center py-20">No open requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {(requests as HajjRequest[]).map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="block border border-gray-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{r.beneficiary_name}</p>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{r.reason}</p>
                    {r.special_requests && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {r.special_requests}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 font-medium">
                    Open
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
