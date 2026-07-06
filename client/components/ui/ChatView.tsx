// client/components/ui/ChatView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessages, useIsLoadingMessages, useIsSendingMessage, useAppActions, useChatRooms, useActiveChatRoomId } from '@/lib/store';
import { PodcastControl } from './PodcastControl';

interface ChatViewProps {
  chatRoomId: string;
}

const ChatView = ({ chatRoomId }: ChatViewProps) => {
  const [newMessage, setNewMessage] = useState('');
  const api = useApi();
  const actions = useAppActions();
  const messages = useMessages();
  const isLoading = useIsLoadingMessages();
  const isAnswering = useIsSendingMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Find the current chat room title
  const chatRooms = useChatRooms();
  const activeChatRoomId = useActiveChatRoomId();
  const currentChat = chatRooms.find(room => room._id === activeChatRoomId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isAnswering) return;
    actions.postMessage(chatRoomId, newMessage, api);
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <h2 className="text-lg font-semibold truncate pr-4" title={currentChat?.title}>
          {currentChat?.title || 'Chat'}
        </h2>
        <PodcastControl />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={cn('flex items-start gap-4', {
              'justify-end': msg.role === 'user',
            })}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'max-w-xl p-3 rounded-lg whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isAnswering && (
             <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                     <Loader2 className="h-5 w-5 text-primary animate-spin" />
                 </div>
                 <div className="max-w-xl p-3 rounded-lg bg-card border italic text-muted-foreground">
                     Thinking...
                 </div>
             </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question about your document..."
            className="flex-1"
            disabled={isAnswering}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isAnswering}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;