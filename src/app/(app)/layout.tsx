import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import MorningBriefing from "@/components/MorningBriefing";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sq-bg">
      <BottomNav />
      <MorningBriefing />
      {/* Main content area — offset for sidebar on desktop, bottom nav on mobile */}
      <div className="md:ml-56">
        <div className="p-4 pb-20 md:pb-4 max-w-4xl mx-auto space-y-4">
          <TopBar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
