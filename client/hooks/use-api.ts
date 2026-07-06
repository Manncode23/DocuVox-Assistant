'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useMemo } from 'react';
import * as api from '@/lib/api';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

export const useApi = () => {
  const { getToken } = useAuth();

  const apiService = useMemo(() => {
    const callWithToken = async <T extends any[], R>(
      func: (token: string, ...args: T) => Promise<R>,
      ...args: T
    ): Promise<R> => {
      const token = await getToken();
      if (!token) {
        throw new Error('User is not authenticated.');
      }
      return func(token, ...args);
    };

    return {
      getChatRooms: () => callWithToken(api.getChatRooms),
      uploadPdf: (file: File) => callWithToken(api.uploadPdf, file),
      getMessages: (chatRoomId: string) => callWithToken(api.getMessages, chatRoomId),
      postMessage: (chatRoomId: string, message: string) => callWithToken(api.postMessage, chatRoomId, message),
      getDocumentStatus: (documentId: string) => callWithToken(api.getDocumentStatus, documentId), // <-- ADD THIS LINE
      startPodcastGeneration: (documentId: string) => callWithToken(api.startPodcastGeneration, documentId), // <-- ADD
      getPodcastStatus: (documentId: string) => callWithToken(api.getPodcastStatus, documentId),
    };
  }, [getToken]);

  return apiService;
};