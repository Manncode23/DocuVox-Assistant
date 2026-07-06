// client/lib/store.ts
import { create } from 'zustand';
import { ChatRoom, Message } from './api';
import { useApi } from '@/hooks/use-api';

// A helper type for our new podcast feature
type PodcastStatus = 'NONE' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface AppState {
  // --- STATE PROPERTIES ---
  chatRooms: ChatRoom[];
  activeChatRoomId: string | null;
  messages: Message[];
  
  // State for tracking the upload and processing lifecycle
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'failed' | 'success';
  podcastStatus: PodcastStatus;
  activePodcastUrl: string | null;
  activeDocumentId: string | null; // To know which document the current chat/podcast belongs to

  // Loading states for providing UI feedback
  isLoadingChatRooms: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;

  // --- ACTIONS ---
  actions: {
    fetchChatRooms: (api: ReturnType<typeof useApi>) => Promise<void>;
    setActiveChatRoomId: (id: string | null, api: ReturnType<typeof useApi>) => Promise<void>;
    uploadAndTrackDocument: (file: File, api: ReturnType<typeof useApi>) => Promise<void>;
    postMessage: (chatRoomId: string, message: string, api: ReturnType<typeof useApi>) => Promise<void>;
    generatePodcast: (documentId: string, api: ReturnType<typeof useApi>) => Promise<void>;
  };
}

const useAppStore = create<AppState>((set, get) => ({
  // --- INITIAL STATE ---
  chatRooms: [],
  activeChatRoomId: null,
  messages: [],
  uploadStatus: 'idle',
  podcastStatus: 'NONE',
  activePodcastUrl: null,
  activeDocumentId: null,
  isLoadingChatRooms: true,
  isLoadingMessages: false,
  isSendingMessage: false,

  // --- ACTIONS IMPLEMENTATION ---
  actions: {
    fetchChatRooms: async (api) => {
      set({ isLoadingChatRooms: true });
      try {
        const rooms = await api.getChatRooms();
        set({ chatRooms: rooms, isLoadingChatRooms: false });
      } catch (error) {
        console.error("Failed to fetch chat rooms in store:", error);
        set({ isLoadingChatRooms: false });
      }
    },

    setActiveChatRoomId: async (id, api) => {
      if (get().activeChatRoomId === id) return;

      set({ 
        activeChatRoomId: id, 
        messages: [], 
        isLoadingMessages: true,
        // Reset podcast state when changing chats
        podcastStatus: 'NONE', 
        activePodcastUrl: null,
        activeDocumentId: null
      });

      if (id) {
        try {
          const fetchedMessages = await api.getMessages(id);
          set({ messages: fetchedMessages });

          // Also fetch the initial podcast status for this new chat room
          const chatRoom = get().chatRooms.find(cr => cr._id === id);
          if (chatRoom) {
            const { status, url } = await api.getPodcastStatus(chatRoom.documentId);
            set({
              activeDocumentId: chatRoom.documentId,
              podcastStatus: status as PodcastStatus,
              activePodcastUrl: url,
            });
          }
        } catch (error) {
          console.error("Failed to fetch messages or podcast status in store:", error);
        } finally {
          set({ isLoadingMessages: false });
        }
      } else {
        set({ isLoadingMessages: false });
      }
    },
    
    postMessage: async (chatRoomId, message, api) => {
       const userMessage: Message = { _id: `temp_${Date.now()}`, chatRoomId, role: 'user', content: message, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
       set((state) => ({ messages: [...state.messages, userMessage], isSendingMessage: true }));
       try {
         const aiResponse = await api.postMessage(chatRoomId, message);
         set((state) => ({ messages: [...state.messages.filter(m => m._id !== userMessage._id), userMessage, aiResponse] }));
       } catch (error) {
         console.error("Failed to post message in store:", error);
       } finally {
         set({ isSendingMessage: false });
       }
    },

    uploadAndTrackDocument: async (file, api) => {
      // This implementation with polling is still valid
      set({ uploadStatus: 'uploading' });
      const tempId = `temp_${Date.now()}`;
      const placeholderRoom = { _id: tempId, title: file.name, status: 'PROCESSING' } as unknown as ChatRoom;
      set(state => ({ chatRooms: [placeholderRoom, ...state.chatRooms] }));
      try {
        const { documentId } = await api.uploadPdf(file);
        if (!documentId) throw new Error("Upload failed.");
        set({ uploadStatus: 'processing' });
        const pollStatus = async () => {
          try {
            const { status } = await api.getDocumentStatus(documentId);
            if (status === 'COMPLETED') {
              await get().actions.fetchChatRooms(api);
              set({ uploadStatus: 'success' });
              setTimeout(() => set({ uploadStatus: 'idle' }), 3000);
            } else if (status === 'FAILED') {
              throw new Error("Processing failed.");
            } else {
              setTimeout(pollStatus, 3000);
            }
          } catch (pollError) {
             throw pollError;
          }
        };
        setTimeout(pollStatus, 3000);
      } catch (error) {
        console.error("Upload failed in store:", error);
        set(state => ({ chatRooms: state.chatRooms.filter(room => room._id !== tempId), uploadStatus: 'failed' }));
        setTimeout(() => set({ uploadStatus: 'idle' }), 3000);
      }
    },

    generatePodcast: async (documentId, api) => {
      set({ podcastStatus: 'GENERATING' });
      try {
        await api.startPodcastGeneration(documentId);
        const pollStatus = async () => {
          const { status, url } = await api.getPodcastStatus(documentId);
          if (status === 'COMPLETED') {
            set({ podcastStatus: 'COMPLETED', activePodcastUrl: url });
          } else if (status === 'FAILED') {
            set({ podcastStatus: 'FAILED' });
            setTimeout(() => set({ podcastStatus: 'NONE' }), 4000);
          } else {
            setTimeout(pollStatus, 3000);
          }
        };
        setTimeout(pollStatus, 3000);
      } catch (error) {
        console.error("Failed to start podcast generation:", error);
        set({ podcastStatus: 'FAILED' });
        setTimeout(() => set({ podcastStatus: 'NONE' }), 4000);
      }
    },
  },
}));

export const useChatRooms = () => useAppStore((state) => state.chatRooms);
export const useActiveChatRoomId = () => useAppStore((state) => state.activeChatRoomId);
export const useMessages = () => useAppStore((state) => state.messages);
export const useUploadStatus = () => useAppStore((state) => state.uploadStatus);
export const usePodcastStatus = () => useAppStore((state) => state.podcastStatus);
export const useActivePodcastUrl = () => useAppStore((state) => state.activePodcastUrl);
export const useActiveDocumentId = () => useAppStore((state) => state.activeDocumentId);
export const useIsLoadingChatRooms = () => useAppStore((state) => state.isLoadingChatRooms);
export const useIsLoadingMessages = () => useAppStore((state) => state.isLoadingMessages);
export const useIsSendingMessage = () => useAppStore((state) => state.isSendingMessage);
export const useAppActions = () => useAppStore((state) => state.actions);