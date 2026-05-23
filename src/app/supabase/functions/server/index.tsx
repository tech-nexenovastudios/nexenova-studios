import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
// Inline crypto utilities (since we can't import from utils in server environment)
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedData), salt.length + iv.length);

  return btoa(String.fromCharCode(...result));
}

async function decryptData(encryptedData: string, password: string): Promise<string> {
  try {
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);

    const key = await deriveKey(password, salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );

    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  const hash = new Uint8Array(keyBuffer);
  
  const result = new Uint8Array(salt.length + hash.length);
  result.set(salt, 0);
  result.set(hash, salt.length);
  
  return btoa(String.fromCharCode(...result));
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const data = new Uint8Array(atob(hashedPassword).split('').map(c => c.charCodeAt(0)));
    const salt = data.slice(0, 16);
    const storedHash = data.slice(16);
    
    const key = await deriveKey(password, salt);
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    const computedHash = new Uint8Array(keyBuffer);
    
    if (storedHash.length !== computedHash.length) return false;
    
    let isValid = true;
    for (let i = 0; i < storedHash.length; i++) {
      if (storedHash[i] !== computedHash[i]) {
        isValid = false;
      }
    }
    
    return isValid;
  } catch (error) {
    return false;
  }
}

async function generateJWT(payload: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }));

  const signature = await signHMAC(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    const expectedSignature = await signHMAC(`${encodedHeader}.${encodedPayload}`, secret);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(atob(encodedPayload));
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function signHMAC(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Функция отправки email
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  try {
    // Используем EmailJS API для отправки email
    const emailData = {
      service_id: 'service_nexenova',
      template_id: 'template_contact',
      user_id: 'user_nexenova_public',
      template_params: {
        to_email: to,
        from_name: 'Nexenova Studios Contact Form',
        subject: subject,
        message_html: htmlContent,
        reply_to: 'noreply@nexenovastudios.com'
      }
    };

    // Альтернативно, используем простую SMTP отправку через внешний API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    return response.ok;
  } catch (error) {
    console.log('Error sending email:', error);
    return false;
  }
}

// Inline database utilities
const DB_NAMESPACES = {
  USERS: 'users',
  GAMES: 'games',
  SITE_CONTENT: 'site_content',
  SESSIONS: 'sessions',
  UPLOADS: 'uploads',
  SETTINGS: 'settings',
  AUDIT_LOG: 'audit_log',
  CONTACT_MESSAGES: 'contact_messages'
} as const;

function createKey(namespace: string, id?: string): string {
  return id ? `${namespace}:${id}` : namespace;
}

async function encryptSensitiveData(data: any, encryptionKey: string): Promise<string> {
  const jsonData = JSON.stringify(data);
  return await encryptData(jsonData, encryptionKey);
}

async function decryptSensitiveData(encryptedData: string, encryptionKey: string): Promise<any> {
  try {
    const jsonData = await decryptData(encryptedData, encryptionKey);
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

function createAuditLogEntry(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  metadata?: { ipAddress?: string; userAgent?: string }
): any {
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

function hasPermission(userRole: string, action: string, resource: string): boolean {
  const permissions = {
    admin: {
      users: ['create', 'read', 'update', 'delete'],
      games: ['create', 'read', 'update', 'delete'],
      site_content: ['create', 'read', 'update', 'delete'],
      uploads: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      audit_log: ['read'],
      contact_messages: ['read', 'update', 'delete']
    },
    editor: {
      games: ['create', 'read', 'update'],
      site_content: ['read', 'update'],
      uploads: ['create', 'read', 'update', 'delete'],
      contact_messages: ['read']
    },
    viewer: {
      games: ['read'],
      site_content: ['read'],
      uploads: ['read'],
      contact_messages: ['read']
    }
  };

  const rolePermissions = permissions[userRole as keyof typeof permissions];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

function isSessionExpired(session: any): boolean {
  return new Date(session.expiresAt) < new Date();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

// Функция для создания HTML шаблона email
function createContactEmailTemplate(formData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #030213; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #030213; }
            .value { margin-top: 5px; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Contact Form Submission - Nexenova Studios</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${formData.name}</div>
                </div>
                <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${formData.email}</div>
                </div>
                ${formData.company ? `
                <div class="field">
                    <div class="label">Company:</div>
                    <div class="value">${formData.company}</div>
                </div>
                ` : ''}
                <div class="field">
                    <div class="label">Project Type:</div>
                    <div class="value">${formData.projectType}</div>
                </div>
                ${formData.budget ? `
                <div class="field">
                    <div class="label">Budget Range:</div>
                    <div class="value">${formData.budget}</div>
                </div>
                ` : ''}
                <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">${new Date().toLocaleString()}</div>
                </div>
            </div>
            <div class="footer">
                This email was sent from the Nexenova Studios contact form.<br>
                Reply directly to this email to respond to the inquiry.
            </div>
        </div>
    </body>
    </html>
  `;
}

// Type definitions
interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  userAgent?: string;
}

const app = new Hono();

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'nexenova-studios-dev-secret-change-me';
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || 'nexenova-dev-encryption-change-me';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Storage bucket name
const STORAGE_BUCKET = 'make-dff5028d-game-assets';

// Ensure storage bucket exists
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB limit
      });
      if (error && !error.message.includes('already exists')) {
        console.log('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
  }
};

// Initialize storage on startup
initStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware для проверки авторизации
const requireAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Authorization token required' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, JWT_SECRET);
    
    // Проверяем, что сессия все еще активна
    const sessionKey = createKey(DB_NAMESPACES.SESSIONS, payload.sessionId);
    const session = await kv.get(sessionKey) as Session | null;
    
    if (!session || isSessionExpired(session)) {
      return c.json({ success: false, error: 'Session expired' }, 401);
    }

    // Получаем данные пользователя
    const userKey = createKey(DB_NAMESPACES.USERS, payload.userId);
    const encryptedUser = await kv.get(userKey) as string | null;
    
    if (!encryptedUser) {
      return c.json({ success: false, error: 'User not found' }, 401);
    }

    const user = await decryptSensitiveData(encryptedUser, ENCRYPTION_KEY) as User;
    
    if (!user.isActive) {
      return c.json({ success: false, error: 'User account is disabled' }, 401);
    }

    // Добавляем данные пользователя в контекст
    c.set('user', user);
    c.set('session', session);
    
    await next();
  } catch (error) {
    console.log('Auth middleware error:', error);
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
};

// Middleware для проверки разрешений
const requirePermission = (action: string, resource: string) => {
  return async (c: any, next: any) => {
    const user = c.get('user') as User;
    
    if (!hasPermission(user.role, action, resource)) {
      return c.json({ 
        success: false, 
        error: `Insufficient permissions: ${action} ${resource}` 
      }, 403);
    }
    
    await next();
  };
};

// Функция для логирования действий
const logAuditAction = async (
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  c?: any
) => {
  try {
    const metadata = {
      ipAddress: c?.req.header('x-forwarded-for') || c?.req.header('x-real-ip'),
      userAgent: c?.req.header('user-agent')
    };
    
    const logEntry = createAuditLogEntry(userId, action, resource, resourceId, details, metadata);
    const logKey = createKey(DB_NAMESPACES.AUDIT_LOG, logEntry.id);
    
    await kv.set(logKey, logEntry);
  } catch (error) {
    console.log('Error logging audit action:', error);
  }
};

// Health check endpoint
app.get("/make-server-dff5028d/health", (c) => {
  return c.json({ status: "ok" });
});

// Contact form endpoint (публичный, без авторизации)
app.post("/make-server-dff5028d/contact", async (c) => {
  try {
    const formData = await c.req.json();
    const { name, email, company, projectType, budget, message } = formData;

    // Валидация обязательных полей
    if (!name || !email || !projectType || !message) {
      return c.json({ 
        success: false, 
        error: 'Name, email, project type, and message are required' 
      }, 400);
    }

    // Валидация email
    if (!isValidEmail(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400);
    }

    // Создаем уникальный ID для сообщения
    const messageId = generateId('contact');
    
    // Создаем объект сообщения
    const contactMessage: ContactMessage = {
      id: messageId,
      name,
      email,
      company: company || '',
      projectType,
      budget: budget || '',
      message,
      submittedAt: new Date().toISOString(),
      status: 'new',
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '',
      userAgent: c.req.header('user-agent') || ''
    };

    // Сохраняем сообщение в базе данных
    const messageKey = createKey(DB_NAMESPACES.CONTACT_MESSAGES, messageId);
    await kv.set(messageKey, contactMessage);

    // Создаем HTML содержимое для email
    const emailHTML = createContactEmailTemplate(formData);
    const emailSubject = `New Contact Form: ${projectType} - ${name}`;
    
    // Send the email to Nexenova's support inbox
    const emailSent = await sendEmail(
      'support@nexenovastudios.com',
      emailSubject,
      emailHTML
    );

    if (!emailSent) {
      console.warn('Failed to send email, but message was saved');
    }

    // Логируем действие (без пользователя, так как это публичный endpoint)
    const logEntry = createAuditLogEntry(
      'anonymous',
      'create',
      'contact_messages',
      messageId,
      { email, projectType },
      {
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent')
      }
    );
    const logKey = createKey(DB_NAMESPACES.AUDIT_LOG, logEntry.id);
    await kv.set(logKey, logEntry);

    return c.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        id: messageId,
        submittedAt: contactMessage.submittedAt,
        emailSent
      }
    });

  } catch (error) {
    console.log('Error processing contact form:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to process your message. Please try again.' 
    }, 500);
  }
});

// Endpoint для получения контактных сообщений (только для авторизованных пользователей)
app.get("/make-server-dff5028d/contact-messages", requireAuth, requirePermission('read', 'contact_messages'), async (c) => {
  try {
    const messages = await kv.getByPrefix(createKey(DB_NAMESPACES.CONTACT_MESSAGES));
    const sortedMessages = messages.sort((a: ContactMessage, b: ContactMessage) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    return c.json({ success: true, data: sortedMessages });
  } catch (error) {
    console.log('Error fetching contact messages:', error);
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500);
  }
});

// Endpoint для обновления статуса контактного сообщения
app.put("/make-server-dff5028d/contact-messages/:id", requireAuth, requirePermission('update', 'contact_messages'), async (c) => {
  try {
    const user = c.get('user') as User;
    const messageId = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }

    const messageKey = createKey(DB_NAMESPACES.CONTACT_MESSAGES, messageId);
    const message = await kv.get(messageKey) as ContactMessage | null;
    
    if (!message) {
      return c.json({ success: false, error: 'Message not found' }, 404);
    }

    message.status = status;
    await kv.set(messageKey, message);

    // Логируем действие
    await logAuditAction(user.id, 'update', 'contact_messages', messageId, { status }, c);

    return c.json({ success: true, data: message });
  } catch (error) {
    console.log('Error updating message status:', error);
    return c.json({ success: false, error: 'Failed to update message' }, 500);
  }
});

// Auth endpoints
app.post("/make-server-dff5028d/auth/register", async (c) => {
  try {
    const { email, password, name, role = 'editor' } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ success: false, error: 'Email, password, and name are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400);
    }

    if (!isValidPassword(password)) {
      return c.json({ success: false, error: 'Password must be at least 8 characters and contain letters and numbers' }, 400);
    }

    // Проверяем, не существует ли уже пользователь
    const existingUsers = await kv.getByPrefix(createKey(DB_NAMESPACES.USERS));
    for (const encryptedUserData of existingUsers) {
      try {
        const user = await decryptSensitiveData(encryptedUserData, ENCRYPTION_KEY) as User;
        if (user.email === email) {
          return c.json({ success: false, error: 'User with this email already exists' }, 409);
        }
      } catch (error) {
        // Игнорируем поврежденные записи
        continue;
      }
    }

    // Создаем нового пользователя
    const userId = generateId('user');
    const hashedPassword = await hashPassword(password);
    
    const newUser: User = {
      id: userId,
      email,
      role: role as 'admin' | 'editor' | 'viewer',
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Шифруем и сохраняем пользователя
    const encryptedUserData = await encryptSensitiveData({
      ...newUser,
      passwordHash: hashedPassword
    }, ENCRYPTION_KEY);
    
    const userKey = createKey(DB_NAMESPACES.USERS, userId);
    await kv.set(userKey, encryptedUserData);

    // Логируем действие
    await logAuditAction(userId, 'create', 'users', userId, { email, role }, c);

    return c.json({ 
      success: true, 
      data: { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.log('Error registering user:', error);
    return c.json({ success: false, error: 'Failed to register user' }, 500);
  }
});

app.post("/make-server-dff5028d/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    // Ищем пользователя по email
    const existingUsers = await kv.getByPrefix(createKey(DB_NAMESPACES.USERS));
    let foundUser: User & { passwordHash: string } | null = null;

    for (const encryptedUserData of existingUsers) {
      try {
        const userData = await decryptSensitiveData(encryptedUserData, ENCRYPTION_KEY);
        if (userData.email === email) {
          foundUser = userData;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundUser) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    if (!foundUser.isActive) {
      return c.json({ success: false, error: 'Account is disabled' }, 401);
    }

    // Проверяем пароль
    const isValidPassword = await verifyPassword(password, foundUser.passwordHash);
    if (!isValidPassword) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Создаем сессию
    const sessionId = generateId('session');
    const session: Session = {
      userId: foundUser.id,
      token: sessionId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      createdAt: new Date().toISOString(),
      userAgent: c.req.header('user-agent'),
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
    };

    const sessionKey = createKey(DB_NAMESPACES.SESSIONS, sessionId);
    await kv.set(sessionKey, session);

    // Обновляем время последнего входа
    foundUser.lastLogin = new Date().toISOString();
    foundUser.updatedAt = new Date().toISOString();
    
    const encryptedUserData = await encryptSensitiveData(foundUser, ENCRYPTION_KEY);
    const userKey = createKey(DB_NAMESPACES.USERS, foundUser.id);
    await kv.set(userKey, encryptedUserData);

    // Генерируем JWT токен
    const token = await generateJWT({
      userId: foundUser.id,
      sessionId: sessionId,
      role: foundUser.role
    }, JWT_SECRET);

    // Логируем действие
    await logAuditAction(foundUser.id, 'login', 'auth', foundUser.id, { email }, c);

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        }
      }
    });
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

app.post("/make-server-dff5028d/auth/logout", requireAuth, async (c) => {
  try {
    const user = c.get('user') as User;
    const session = c.get('session') as Session;

    // Удаляем сессию
    const sessionKey = createKey(DB_NAMESPACES.SESSIONS, session.token);
    await kv.del(sessionKey);

    // Логируем действие
    await logAuditAction(user.id, 'logout', 'auth', user.id, {}, c);

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Error during logout:', error);
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

// Games API routes (теперь с авторизацией)
app.get("/make-server-dff5028d/games", async (c) => {
  try {
    const gamesKey = createKey(DB_NAMESPACES.GAMES);
    const games = await kv.get(gamesKey) || [];
    return c.json({ success: true, data: games });
  } catch (error) {
    console.log("Error fetching games:", error);
    return c.json({ success: false, error: "Failed to fetch games" }, 500);
  }
});

app.post("/make-server-dff5028d/games", requireAuth, requirePermission('create', 'games'), async (c) => {
  try {
    const user = c.get('user') as User;
    const newGame = await c.req.json();
    const gamesKey = createKey(DB_NAMESPACES.GAMES);
    const games = await kv.get(gamesKey) || [];
    
    // Generate unique ID if not provided
    if (!newGame.id) {
      newGame.id = generateId('game');
    }
    
    // Add metadata
    newGame.createdAt = new Date().toISOString();
    newGame.updatedAt = new Date().toISOString();
    newGame.createdBy = user.id;
    
    games.push(newGame);
    await kv.set(gamesKey, games);

    // Логируем действие
    await logAuditAction(user.id, 'create', 'games', newGame.id, { title: newGame.title }, c);
    
    return c.json({ success: true, data: newGame });
  } catch (error) {
    console.log("Error creating game:", error);
    return c.json({ success: false, error: "Failed to create game" }, 500);
  }
});

app.put("/make-server-dff5028d/games/:id", requireAuth, requirePermission('update', 'games'), async (c) => {
  try {
    const user = c.get('user') as User;
    const gameId = c.req.param("id");
    const updatedGame = await c.req.json();
    const gamesKey = createKey(DB_NAMESPACES.GAMES);
    const games = await kv.get(gamesKey) || [];
    
    const gameIndex = games.findIndex((game: any) => game.id === gameId);
    if (gameIndex === -1) {
      return c.json({ success: false, error: "Game not found" }, 404);
    }
    
    // Update the game while preserving metadata
    updatedGame.id = gameId;
    updatedGame.createdAt = games[gameIndex].createdAt;
    updatedGame.createdBy = games[gameIndex].createdBy;
    updatedGame.updatedAt = new Date().toISOString();
    
    games[gameIndex] = updatedGame;
    await kv.set(gamesKey, games);

    // Логируем действие
    await logAuditAction(user.id, 'update', 'games', gameId, { title: updatedGame.title }, c);
    
    return c.json({ success: true, data: updatedGame });
  } catch (error) {
    console.log("Error updating game:", error);
    return c.json({ success: false, error: "Failed to update game" }, 500);
  }
});

app.delete("/make-server-dff5028d/games/:id", requireAuth, requirePermission('delete', 'games'), async (c) => {
  try {
    const user = c.get('user') as User;
    const gameId = c.req.param("id");
    const gamesKey = createKey(DB_NAMESPACES.GAMES);
    const games = await kv.get(gamesKey) || [];
    
    const gameIndex = games.findIndex((game: any) => game.id === gameId);
    if (gameIndex === -1) {
      return c.json({ success: false, error: "Game not found" }, 404);
    }
    
    const deletedGame = games[gameIndex];
    games.splice(gameIndex, 1);
    await kv.set(gamesKey, games);

    // Логируем действие
    await logAuditAction(user.id, 'delete', 'games', gameId, { title: deletedGame.title }, c);
    
    return c.json({ success: true, message: "Game deleted successfully" });
  } catch (error) {
    console.log("Error deleting game:", error);
    return c.json({ success: false, error: "Failed to delete game" }, 500);
  }
});

// Site Content API routes (теперь с авторизацией)
app.get("/make-server-dff5028d/content", async (c) => {
  try {
    const defaultContent = {
      heroStats: {
        gamesPublished: 7,
        yearsExperience: 3,
        happyClients: 100,
        downloads: 100000
      },
      teamMembers: [
        {
          id: 1,
          name: "Lead Developer",
          role: "Engineering",
          bio: "Driving the technical vision behind our mobile games and live-ops."
        },
        {
          id: 2,
          name: "Game Designer",
          role: "Design",
          bio: "Designing core gameplay loops across our puzzle, casual, and arcade titles."
        },
        {
          id: 3,
          name: "2D Artist",
          role: "Art & Animation",
          bio: "Creating the look and feel of every Nexenova Studios title."
        }
      ],
      companyInfo: {
        name: "Nexenova Studios",
        description: "We are a passionate team of mobile game developers dedicated to crafting memorable gaming experiences.",
        email: "support@nexenovastudios.com",
        phone: "",
        address: "India"
      }
    };
    
    const contentKey = createKey(DB_NAMESPACES.SITE_CONTENT);
    const content = await kv.get(contentKey) || defaultContent;
    return c.json({ success: true, data: content });
  } catch (error) {
    console.log("Error fetching site content:", error);
    return c.json({ success: false, error: "Failed to fetch site content" }, 500);
  }
});

app.put("/make-server-dff5028d/content", requireAuth, requirePermission('update', 'site_content'), async (c) => {
  try {
    const user = c.get('user') as User;
    const updatedContent = await c.req.json();
    updatedContent.updatedAt = new Date().toISOString();
    updatedContent.updatedBy = user.id;
    
    const contentKey = createKey(DB_NAMESPACES.SITE_CONTENT);
    await kv.set(contentKey, updatedContent);

    // Логируем действие
    await logAuditAction(user.id, 'update', 'site_content', 'main', {}, c);
    
    return c.json({ success: true, data: updatedContent });
  } catch (error) {
    console.log("Error updating site content:", error);
    return c.json({ success: false, error: "Failed to update site content" }, 500);
  }
});

// File upload endpoint (теперь с авторизацией)
app.post("/make-server-dff5028d/upload", requireAuth, requirePermission('create', 'uploads'), async (c) => {
  try {
    const user = c.get('user') as User;
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const gameId = formData.get('gameId') as string;
    const fileType = formData.get('type') as string;
    
    if (!file || !gameId || !fileType) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      return c.json({ success: false, error: 'File size too large. Maximum 10MB allowed.' }, 400);
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${gameId}/${fileType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // Convert file to bytes
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBytes, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.log('Storage upload error:', error);
      return c.json({ success: false, error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL for the uploaded file
    const { data: signedUrlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    const uploadedFileUrl = signedUrlData?.signedUrl || '';

    // Логируем действие
    await logAuditAction(user.id, 'upload', 'uploads', fileName, { gameId, fileType, fileName }, c);

    return c.json({ 
      success: true, 
      data: {
        fileName,
        url: uploadedFileUrl,
        path: data.path
      }
    });

  } catch (error) {
    console.log('Error uploading file:', error);
    return c.json({ success: false, error: 'Failed to upload file' }, 500);
  }
});

// Delete file endpoint (теперь с авторизацией)
app.delete("/make-server-dff5028d/files/:path", requireAuth, requirePermission('delete', 'uploads'), async (c) => {
  try {
    const user = c.get('user') as User;
    const filePath = decodeURIComponent(c.req.param("path"));
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.log('Error deleting file:', error);
      return c.json({ success: false, error: 'Failed to delete file' }, 500);
    }

    // Логируем действие
    await logAuditAction(user.id, 'delete', 'uploads', filePath, { filePath }, c);

    return c.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.log('Error deleting file:', error);
    return c.json({ success: false, error: 'Failed to delete file' }, 500);
  }
});

// Get signed URL for file (теперь с авторизацией)
app.get("/make-server-dff5028d/files/:path/url", requireAuth, requirePermission('read', 'uploads'), async (c) => {
  try {
    const filePath = decodeURIComponent(c.req.param("path"));
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour expiry

    if (error) {
      console.log('Error creating signed URL:', error);
      return c.json({ success: false, error: 'Failed to create signed URL' }, 500);
    }

    return c.json({ success: true, data: { signedUrl: data.signedUrl } });
  } catch (error) {
    console.log('Error creating signed URL:', error);
    return c.json({ success: false, error: 'Failed to create signed URL' }, 500);
  }
});

// Admin endpoints (теперь с авторизацией)
app.get("/make-server-dff5028d/admin/users", requireAuth, requirePermission('read', 'users'), async (c) => {
  try {
    const encryptedUsers = await kv.getByPrefix(createKey(DB_NAMESPACES.USERS));
    const users = [];

    for (const encryptedUserData of encryptedUsers) {
      try {
        const userData = await decryptSensitiveData(encryptedUserData, ENCRYPTION_KEY);
        // Удаляем passwordHash из ответа
        const { passwordHash, ...user } = userData;
        users.push(user);
      } catch (error) {
        // Игнорируем поврежденные записи
        continue;
      }
    }

    return c.json({ success: true, data: users });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

app.get("/make-server-dff5028d/admin/audit-log", requireAuth, requirePermission('read', 'audit_log'), async (c) => {
  try {
    const auditLogs = await kv.getByPrefix(createKey(DB_NAMESPACES.AUDIT_LOG));
    const sortedLogs = auditLogs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return c.json({ success: true, data: sortedLogs });
  } catch (error) {
    console.log('Error fetching audit log:', error);
    return c.json({ success: false, error: 'Failed to fetch audit log' }, 500);
  }
});

// Initialize database endpoint
app.post("/make-server-dff5028d/init", async (c) => {
  try {
    // This endpoint can be used to initialize default data
    // For now, we'll just return success
    return c.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.log('Error initializing database:', error);
    return c.json({ success: false, error: 'Failed to initialize database' }, 500);
  }
});

Deno.serve(app.fetch);