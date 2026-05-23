// Утилиты для структурированной работы с базой данных
import { encryptData, decryptData } from './crypto';

// Типы данных
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  screenshots: string[];
  tags: string[];
  genre: string;
  platform: string[];
  status: string;
  rating: number;
  downloads: string;
  releaseDate: string;
  videoUrl?: string;
  steamUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // user id
}

export interface SiteContent {
  heroStats: {
    gamesPublished: number;
    yearsExperience: number;
    happyClients: number;
    downloads: number;
  };
  teamMembers: Array<{
    id: number;
    name: string;
    role: string;
    image: string;
    bio: string;
  }>;
  companyInfo: {
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy?: string; // user id
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

// Namespace константы для организации данных
export const DB_NAMESPACES = {
  USERS: 'users',
  GAMES: 'games',
  SITE_CONTENT: 'site_content',
  SESSIONS: 'sessions',
  UPLOADS: 'uploads',
  SETTINGS: 'settings',
  AUDIT_LOG: 'audit_log'
} as const;

// Функции для работы с ключами
export function createKey(namespace: string, id?: string): string {
  return id ? `${namespace}:${id}` : namespace;
}

// Функция для шифрования чувствительных данных
export async function encryptSensitiveData(data: any, encryptionKey: string): Promise<string> {
  const jsonData = JSON.stringify(data);
  return await encryptData(jsonData, encryptionKey);
}

// Функция для расшифровки чувствительных данных
export async function decryptSensitiveData(encryptedData: string, encryptionKey: string): Promise<any> {
  try {
    const jsonData = await decryptData(encryptedData, encryptionKey);
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

// Функция для создания записи в audit log
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export function createAuditLogEntry(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  metadata?: { ipAddress?: string; userAgent?: string }
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent
  };
}

// Функция для валидации разрешений
export function hasPermission(userRole: string, action: string, resource: string): boolean {
  const permissions = {
    admin: {
      users: ['create', 'read', 'update', 'delete'],
      games: ['create', 'read', 'update', 'delete'],
      site_content: ['create', 'read', 'update', 'delete'],
      uploads: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      audit_log: ['read']
    },
    editor: {
      games: ['create', 'read', 'update'],
      site_content: ['read', 'update'],
      uploads: ['create', 'read', 'update', 'delete']
    },
    viewer: {
      games: ['read'],
      site_content: ['read'],
      uploads: ['read']
    }
  };

  const rolePermissions = permissions[userRole as keyof typeof permissions];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

// Функция для очистки expired sessions
export function isSessionExpired(session: Session): boolean {
  return new Date(session.expiresAt) < new Date();
}

// Функция для генерации уникального ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Функция для валидации email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Функция для валидации пароля
export function isValidPassword(password: string): boolean {
  // Минимум 8 символов, должен содержать буквы и цифры
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}