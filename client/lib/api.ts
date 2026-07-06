// client/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export interface ChatRoom {
  _id: string;
  title: string;
  userId: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatRoomId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getChatRooms = async (token: string): Promise<ChatRoom[]> => {
  const response = await apiClient.get('/chatrooms', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadPdf = async (token: string, file: File): Promise<{ documentId: string }> => {
  const formData = new FormData();
  formData.append('pdf', file);
  const response = await apiClient.post('/upload/pdf', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMessages = async (token: string, chatRoomId: string): Promise<Message[]> => {
  const response = await apiClient.get(`/chatrooms/${chatRoomId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const postMessage = async (token: string, chatRoomId: string, message: string): Promise<Message> => {
  const response = await apiClient.post(`/chatrooms/${chatRoomId}/messages`, { message }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const startPodcastGeneration = async (token: string, documentId: string): Promise<void> => {
  await apiClient.post(`/documents/${documentId}/podcast`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPodcastStatus = async (token: string, documentId: string): Promise<{ status: string, url: string | null }> => {
  const response = await apiClient.get(`/documents/${documentId}/podcast/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getDocumentStatus = async (token: string, documentId: string): Promise<{ status: string }> => {
  const response = await apiClient.get(`/documents/${documentId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};