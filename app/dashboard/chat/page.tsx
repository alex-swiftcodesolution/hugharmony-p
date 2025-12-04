import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ChatPageContent from "./ChatPageContent";

function ChatPageSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 border-r p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatPageContent />
    </Suspense>
  );
}
