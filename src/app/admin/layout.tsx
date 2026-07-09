import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { ChatBotPopup } from "@/components/chat-bot-popup";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 font-sans antialiased">
      {/* Sidebar (left) */}
      <AdminSidebar />

      {/* Main Content (right) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {children}
      </div>
      <ChatBotPopup />
    </div>
  );
}
