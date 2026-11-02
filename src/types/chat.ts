export type MessageContentType = 'text' | 'image' | 'voice' | 'file' | 'system';

export interface EncryptedEnvelope {
  version: number;
  iv: string; // base64
  ciphertext: string; // base64
  salt: string; // base64
  senderFingerprint: string;
  senderName: string;
  senderAvatar: string;
  wasmHash: number;
  timestamp: number;
  burnAfterSeconds?: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: number;
  plainText: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  burnDuration?: number; // 0: normal, >0: seconds after view, -1: burn on read
  burnExpiresAt?: number;
  isBurned?: boolean;
  reactions: Record<string, string[]>; // emoji -> userIds
  status: 'sending' | 'encrypted' | 'verified';
  envelope?: EncryptedEnvelope;
  wasmChecksum: number;
  viewed?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  hasPassword: boolean;
  createdAt: number;
  participantCount: number;
  safetyNumber: string;
  salt: string; // base64
  defaultBurnTimer: number; // 0 = off
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  keyFingerprint: string;
  sessionCreated: number;
}

export interface WiretapPacket {
  id: string;
  timestamp: number;
  type: 'ENCRYPTED_MESSAGE' | 'PRESENCE' | 'KEY_EXCHANGE' | 'BURN_EVENT' | 'REACTION';
  roomId: string;
  senderFingerprint: string;
  payloadSize: number;
  ivHex: string;
  ciphertextExcerpt: string;
  wasmChecksum: number;
  zeroKnowledgeVerified: boolean;
}

export interface CloudflareDeployConfig {
  projectName: string;
  accountId: string;
  kvNamespace: string;
  compatibilityDate: string;
  customDomain?: string;
}
