// client/components/ui/Sidebar.tsx
'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import UserAuth from '@/components/ui/UserAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChatRoom } from '@/lib/api';
import { useChatRooms, useActiveChatRoomId, useIsLoadingChatRooms, useAppActions } from '@/lib/store';
import { useApi } from '@/hooks/use-api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  className?: string;
}

const Sidebar = ({ isOpen, onToggle, className }: SidebarProps) => {
  const api = useApi();
  const actions = useAppActions();
  const chatRooms = useChatRooms();
  const isLoading = useIsLoadingChatRooms();
  const activeChatRoomId = useActiveChatRoomId();
  
  const handleToggle = useCallback(() => onToggle(!isOpen), [isOpen, onToggle]);
  const handleNewChat = useCallback(() => actions.setActiveChatRoomId(null, api), [actions, api]);
  const handleSelectChat = useCallback((id: string) => actions.setActiveChatRoomId(id, api), [actions, api]);

  return (
    <aside className={cn("h-full flex flex-col p-2 relative", className)}>
      <div className="flex justify-start mb-2">
        <Button variant="ghost" size="icon" onClick={handleToggle}>
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="sidebar-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col h-full min-h-0"
            >
              <Button onClick={handleNewChat} variant="default" className="w-full justify-start text-sm font-medium mb-4 h-9">
                <Plus className="mr-2 h-4 w-4" /> <span className="truncate">New Chat</span>
              </Button>
              <div className="flex-1 overflow-hidden">
                <h2 className="px-2 mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Recent Chats
                </h2>
                <nav className="space-y-1 overflow-y-auto max-h-full">
                  {isLoading ? ( <div className="flex justify-center p-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> )
                   : ( chatRooms.map((room) => {
                      const isProcessing = (room as any).status === 'PROCESSING';
                      return (
                        <Button 
                          key={room._id}
                          onClick={() => !isProcessing && handleSelectChat(room._id)}
                          variant={activeChatRoomId === room._id ? "secondary" : "ghost"}
                          className="w-full justify-start font-normal text-sm h-9 px-2"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate text-left">{room.title}</span>
                        </Button>
                      );
                    })
                  )}
                  {(!isLoading && chatRooms.length === 0) && (
                    <p className="px-2 text-sm text-muted-foreground">No recent chats.</p>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-auto pt-2">
        <UserAuth isOpen={isOpen} />
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);