import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import MorningBriefing from "@/components/MorningBriefing";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sq-bg flex">
      <BottomNav />
      <MorningBriefing />
      {/* Main content area — offset for sidebar on desktop, bottom nav on mobile */}
      <div className="flex-1 md:ml-[260px] min-h-screen transition-[margin] duration-300">
        <TopBar />
        <div className="px-6 py-8 pb-24 md:pb-8 max-w-[900px] mx-auto">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
