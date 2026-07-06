// client/app/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar from "@/components/ui/Sidebar";
import { motion } from 'framer-motion';
import FileUpload from '@/components/ui/FileUpload';
import ChatView from '@/components/ui/ChatView';
import { useApi } from '@/hooks/use-api';
import { useActiveChatRoomId, useAppActions } from '@/lib/store';

const SIDEBAR_WIDTH = {
  open: 256, // 16rem
  closed: 72  // 4.5rem
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const api = useApi();
  const { fetchChatRooms } = useAppActions();
  const activeChatRoomId = useActiveChatRoomId();

  // On initial load, fetch the user's chat rooms via the store's action
  useEffect(() => {
    fetchChatRooms(api);
  }, [fetchChatRooms, api]);

  // Handler for the sidebar's visual toggle button
  const handleSidebarToggle = useCallback((isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      <motion.div
        animate={{
          width: isSidebarOpen ? SIDEBAR_WIDTH.open : SIDEBAR_WIDTH.closed
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1]
        }}
        className="h-full bg-card border-r border-border flex-shrink-0"
      >
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleSidebarToggle}
        />
      </motion.div>

      <div className="flex-1 h-full overflow-y-auto">
        {activeChatRoomId ? (
          // Add a key to force re-mount when chat room changes
          <ChatView key={activeChatRoomId} chatRoomId={activeChatRoomId} />
        ) : (
          <div className="p-6 max-w-4xl mx-auto h-full flex items-center justify-center">
             <FileUpload />
          </div>
        )}
      </div>
    </main>
  );
}