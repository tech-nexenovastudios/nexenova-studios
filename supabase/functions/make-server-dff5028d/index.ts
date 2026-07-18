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
    const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');
    const emailData: Record<string, unknown> = {
      service_id: 'service_nexenova',
      template_id: 'template_contact',
      user_id: 'VEzch7gQ3cskUG4Mk',
      template_params: {
        to_email: to,
        from_name: 'Nexenova Studios Contact Form',
        subject: subject,
        message_html: htmlContent,
        reply_to: 'noreply@nexenovastudios.com'
      }
    };
    // EmailJS strict mode requires the private key as accessToken.
    if (privateKey) emailData.accessToken = privateKey;

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.log('EmailJS rejected:', response.status, errText);
    }
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
      'tech@nexenovastudios.com',
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

// Job application endpoint — accepts metadata + the storage path of an
// already-uploaded resume, generates a signed download URL, and emails the
// studio. Resume itself stays in the private career-applications bucket.
app.post("/make-server-dff5028d/apply", async (c) => {
  try {
    const body = await c.req.json();
    const {
      name,
      email,
      portfolio,
      cover_letter,
      role_slug,
      role_title,
      resume_path,
      resume_filename,
    } = body;

    if (!name || !email || !cover_letter || !role_slug || !role_title || !resume_path) {
      return c.json({
        success: false,
        error: 'Name, email, role, cover letter, and resume are all required.',
      }, 400);
    }
    if (!isValidEmail(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400);
    }

    // Generate a signed URL for the resume (14 days)
    let resumeUrl = '';
    try {
      const { data, error } = await supabase.storage
        .from('career-applications')
        .createSignedUrl(resume_path, 60 * 60 * 24 * 14);
      if (error) throw error;
      resumeUrl = data?.signedUrl || '';
    } catch (err) {
      console.log('Failed to sign resume URL:', err);
    }

    const safe = (s: string) => String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const ts = new Date().toISOString();
    const emailHTML = `
      <table style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;font-size:14px;line-height:1.6;width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#6b7280;width:140px">Role</td><td style="padding:6px 0"><strong>${safe(role_title)}</strong> <span style="color:#9ca3af">(${safe(role_slug)})</span></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Applicant</td><td style="padding:6px 0"><strong>${safe(name)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0"><a href="mailto:${safe(email)}">${safe(email)}</a></td></tr>
        ${portfolio ? `<tr><td style="padding:6px 0;color:#6b7280">Portfolio</td><td style="padding:6px 0"><a href="${safe(portfolio)}">${safe(portfolio)}</a></td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#6b7280">Submitted</td><td style="padding:6px 0">${ts}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top">Resume</td><td style="padding:6px 0">${
          resumeUrl
            ? `<a href="${resumeUrl}"><strong>Download ${safe(resume_filename || 'resume')}</strong></a> <span style="color:#9ca3af">(link valid 14 days; original at <code>${safe(resume_path)}</code>)</span>`
            : `Storage path: <code>${safe(resume_path)}</code> (signed URL generation failed; fetch via Supabase Studio)`
        }</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb">
        <div style="color:#6b7280;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Cover letter</div>
        <div style="white-space:pre-wrap;font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.7;color:#1f2937">${safe(cover_letter)}</div>
      </div>
    `;

    const emailSent = await sendEmail(
      'tech@nexenovastudios.com',
      `Application: ${role_title} — ${name}`,
      emailHTML,
    );

    if (!emailSent) {
      console.warn('Application email failed to send');
      return c.json({
        success: false,
        error: 'Could not deliver your application. Please email tech@nexenovastudios.com directly.',
      }, 500);
    }

    return c.json({
      success: true,
      message: "Application received. We'll be in touch.",
    });
  } catch (error) {
    console.log('Error processing application:', error);
    return c.json({
      success: false,
      error: 'Failed to process your application. Please try again.',
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
          name: "Karishma Patel",
          role: "Founder",
          bio: "Sets the vision and the bar. Decides what we make, what we kill, and what ships."
        },
        {
          id: 2,
          name: "Manish Jha",
          role: "Technical Lead",
          bio: "Owns the stack end-to-end — engine, backend, build pipeline. Keeps the shipping rails greased."
        },
        {
          id: 3,
          name: "Shweta Dhawan",
          role: "Senior 2D Artist",
          bio: "Drives the visual identity across our titles. From mood boards to final pixels."
        },
        {
          id: 4,
          name: "Prabhat",
          role: "Unity Developer",
          bio: "Ships gameplay systems and lives in C#. Turns mechanics into something you can tap."
        },
        {
          id: 5,
          name: "Ashutosh",
          role: "Unity Developer",
          bio: "Builds tools, optimizes for mobile, and fixes the bugs nobody else wants to touch."
        },
        {
          id: 6,
          name: "Vaishnavi",
          role: "2D Artist",
          bio: "UI art, icons, and the small polish you notice before you notice anything else."
        },
        {
          id: 7,
          name: "Rohit",
          role: "2D Artist",
          bio: "Character and environment art. Frames the worlds our games live in."
        },
        {
          id: 8,
          name: "Kunal",
          role: "3D Artist",
          bio: "Models, textures, low-poly mobile assets that hold their shape on a 60fps budget."
        },
        {
          id: 9,
          name: "Prodipta",
          role: "3D / 2D Animator",
          bio: "Rigs, keyframes, and screen-shake. Makes the moments feel like moments."
        },
        {
          id: 10,
          name: "Vikas",
          role: "QA Tester",
          bio: "Breaks the build before players can. Catches the edge cases nobody else sees."
        }
      ],
      companyInfo: {
        name: "Nexenova Studios",
        description: "Independent mobile game studio crafting puzzle and action titles for global audiences.",
        email: "tech@nexenovastudios.com",
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

// ---------------------------------------------------------------------------
// Google Play account/data deletion (public form + verify/cancel + cron)
// ---------------------------------------------------------------------------
// Flow:
//   POST /account-deletion            -> row (pending_verification) + confirm email
//   GET  /account-deletion/verify     -> verified, schedules deletion (+30d grace)
//   GET  /account-deletion/cancel     -> cancelled
//   POST /account-deletion/process    -> cron-only; deletes due rows via Unity
//
// The actual Unity deletion is stubbed (see deleteUnityAccount). Until Unity
// credentials + logic are wired in, due rows are left 'verified' and retried on
// the next cron run — nothing is silently marked complete.

const DELETION_GRACE_DAYS = 30;
const ADMIN_EMAIL = 'tech@nexenovastudios.com';
const SITE_URL = (Deno.env.get('SITE_URL') || 'https://nexenovastudios.com').replace(/\/+$/, '');

const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function newToken(): string {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
}

// Minimal branded HTML page returned to the browser for verify/cancel links.
function resultPage(title: string, body: string, ok = true): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)} — Nexenova Studios</title>
<style>
  :root{color-scheme:light dark}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0b0f;color:#e5e7eb;padding:24px}
  .card{max-width:440px;width:100%;background:#15151c;border:1px solid #26263050;border-radius:16px;padding:32px;text-align:center}
  .badge{width:56px;height:56px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
         font-size:28px;margin-bottom:16px;background:${ok ? '#10b98122' : '#ef444422'};color:${ok ? '#10b981' : '#ef4444'}}
  h1{font-size:20px;margin:0 0 8px}
  p{font-size:14px;line-height:1.6;color:#9ca3af;margin:0 0 20px}
  a{display:inline-block;padding:10px 20px;border-radius:10px;background:#6366f1;color:#fff;text-decoration:none;font-size:14px;font-weight:600}
</style></head><body><div class="card">
  <div class="badge">${ok ? '✓' : '✕'}</div>
  <h1>${esc(title)}</h1>
  <p>${body}</p>
  <a href="${SITE_URL}/">Back to Nexenova Studios</a>
</div></body></html>`;
}

// Thrown when Unity env vars are absent — the processor keeps the row 'verified'
// (waiting on setup) rather than counting it as a failure.
class UnityNotConfiguredError extends Error {}
// A real API failure — the processor retries, and gives up (status 'failed')
// after MAX_DELETE_ATTEMPTS.
class UnityDeleteError extends Error {}

// Permanently delete the Unity player identity for req.player_id.
//
// The Player-Auth-Admin DeleteUser endpoint is an ADMIN API: per Unity, admin
// APIs authenticate with the service-account key/secret DIRECTLY via HTTP Basic
// (no token-exchange — that's only for "trusted" APIs). The delete URL is
// overridable via UNITY_DELETE_URL_TEMPLATE; the default is the documented shape.
// A 404 is treated as "already deleted".
async function deleteUnityAccount(req: any): Promise<void> {
  const projectId = Deno.env.get('UNITY_PROJECT_ID');
  const keyId = Deno.env.get('UNITY_SERVICE_ACCOUNT_KEY');
  const secret = Deno.env.get('UNITY_SERVICE_ACCOUNT_SECRET');
  if (!projectId || !keyId || !secret) {
    throw new UnityNotConfiguredError('Unity credentials not set');
  }

  const basic = btoa(`${keyId}:${secret}`);
  const template = Deno.env.get('UNITY_DELETE_URL_TEMPLATE')
    || 'https://services.api.unity.com/player-auth-admin/v1/projects/{projectId}/users/{playerId}';
  const url = template
    .replace('{projectId}', projectId)
    .replace('{playerId}', encodeURIComponent(String(req.player_id)));

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${basic}` },
  });
  if (res.status === 404) return; // already gone — treat as success
  if (!res.ok) throw new UnityDeleteError(`delete player ${res.status}: ${await res.text()}`);

  // OPTIONAL: if the games persist data in Cloud Save / Economy / Leaderboards,
  // purge those here (they are environment-scoped) before returning. See docs/.
}

// Public submit
app.post("/make-server-dff5028d/account-deletion", async (c) => {
  try {
    const { player_id, email, game, reason } = await c.req.json();

    if (!email || !isValidEmail(email)) {
      return c.json({ success: false, error: 'A valid email is required.' }, 400);
    }
    if (!player_id || String(player_id).trim().length < 3) {
      return c.json({
        success: false,
        error: 'Your in-game Player ID is required. Find it in the game under Settings → Account.',
      }, 400);
    }

    const verify_token = newToken();
    const cancel_token = newToken();

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert({
        player_id: String(player_id).trim(),
        email: String(email).trim().toLowerCase(),
        game: game ? String(game).trim() : null,
        reason: reason ? String(reason).trim() : null,
        status: 'pending_verification',
        verify_token,
        cancel_token,
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '',
        user_agent: c.req.header('user-agent') || '',
      })
      .select('id')
      .single();

    if (error) throw error;

    const verifyUrl = `${SITE_URL}/delete-account?action=verify&token=${verify_token}`;
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;font-size:14px;line-height:1.7">
        <p>We received a request to delete the Nexenova Studios game account linked to this email.</p>
        <p><strong>Player ID:</strong> ${esc(player_id)}${game ? `<br><strong>Game:</strong> ${esc(game)}` : ''}</p>
        <p>To confirm and start the deletion, click the button below. If you did not request this, ignore this email — nothing will be deleted.</p>
        <p style="margin:24px 0"><a href="${verifyUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Confirm account deletion</a></p>
        <p style="color:#6b7280;font-size:12px">After you confirm, your account enters a ${DELETION_GRACE_DAYS}-day grace period. You can cancel any time during that window using the link in the confirmation email. After that, the account and its data are permanently deleted.</p>
        <p style="color:#9ca3af;font-size:12px;word-break:break-all">If the button doesn't work, paste this link:<br>${verifyUrl}</p>
      </div>`;

    const emailSent = await sendEmail(email, 'Confirm your account deletion request', html);

    return c.json({
      success: true,
      message: emailSent
        ? "Check your email — we've sent a confirmation link. Your account will not be deleted until you confirm."
        : "Request recorded, but we couldn't send the confirmation email. Contact " + ADMIN_EMAIL + " to complete it.",
      data: { id: data.id, emailSent },
    });
  } catch (error) {
    console.log('Error creating deletion request:', error);
    return c.json({ success: false, error: 'Could not submit your request. Please try again.' }, 500);
  }
});

// Confirm (double opt-in) — schedules deletion after grace period
app.get("/make-server-dff5028d/account-deletion/verify", async (c) => {
  const token = c.req.query('token');
  const wantsHtml = (c.req.header('accept') || '').includes('text/html');
  const fail = (msg: string) =>
    wantsHtml ? c.html(resultPage('Link invalid', msg, false), 400)
              : c.json({ success: false, error: msg }, 400);
  try {
    if (!token) return fail('Missing token.');

    const { data: row } = await supabase
      .from('account_deletion_requests')
      .select('id,status')
      .eq('verify_token', token)
      .maybeSingle();

    if (!row) return fail('This confirmation link is invalid or has expired.');
    if (row.status === 'cancelled')
      return fail('This request was cancelled and can no longer be confirmed.');

    // Idempotent: re-clicking after verifying is fine.
    if (['verified', 'processing', 'completed'].includes(row.status)) {
      const msg = `Your deletion is already confirmed. The account is scheduled for permanent deletion after a ${DELETION_GRACE_DAYS}-day grace period.`;
      return wantsHtml ? c.html(resultPage('Already confirmed', msg)) : c.json({ success: true, message: msg });
    }

    const now = new Date();
    const scheduled = new Date(now.getTime() + DELETION_GRACE_DAYS * 86400000);
    const { error } = await supabase
      .from('account_deletion_requests')
      .update({
        status: 'verified',
        verified_at: now.toISOString(),
        scheduled_deletion_at: scheduled.toISOString(),
      })
      .eq('id', row.id);
    if (error) throw error;

    const msg = `Your account deletion is confirmed. It will be permanently deleted on or after <strong>${scheduled.toISOString().slice(0, 10)}</strong>. You can still cancel before then using the link in your confirmation email.`;
    return wantsHtml ? c.html(resultPage('Deletion confirmed', msg)) : c.json({ success: true, message: msg });
  } catch (error) {
    console.log('Error verifying deletion request:', error);
    return fail('Something went wrong. Please try again or contact ' + ADMIN_EMAIL + '.');
  }
});

// Cancel (during grace period)
app.get("/make-server-dff5028d/account-deletion/cancel", async (c) => {
  const token = c.req.query('token');
  const wantsHtml = (c.req.header('accept') || '').includes('text/html');
  const fail = (msg: string) =>
    wantsHtml ? c.html(resultPage('Link invalid', msg, false), 400)
              : c.json({ success: false, error: msg }, 400);
  try {
    if (!token) return fail('Missing token.');

    const { data: row } = await supabase
      .from('account_deletion_requests')
      .select('id,status')
      .eq('cancel_token', token)
      .maybeSingle();

    if (!row) return fail('This cancellation link is invalid.');
    if (['completed', 'processing'].includes(row.status))
      return fail('This account has already been deleted and cannot be restored.');
    if (row.status === 'cancelled') {
      const msg = 'This request was already cancelled. Your account is safe.';
      return wantsHtml ? c.html(resultPage('Already cancelled', msg)) : c.json({ success: true, message: msg });
    }

    const { error } = await supabase
      .from('account_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', row.id);
    if (error) throw error;

    const msg = 'Your deletion request has been cancelled. Your account and data are safe.';
    return wantsHtml ? c.html(resultPage('Deletion cancelled', msg)) : c.json({ success: true, message: msg });
  } catch (error) {
    console.log('Error cancelling deletion request:', error);
    return fail('Something went wrong. Please try again or contact ' + ADMIN_EMAIL + '.');
  }
});

// Cron-only: process due deletions. Protected by a shared secret header.
app.post("/make-server-dff5028d/account-deletion/process", async (c) => {
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret) return c.json({ success: false, error: 'CRON_SECRET not configured' }, 503);
  if (c.req.header('x-cron-secret') !== secret)
    return c.json({ success: false, error: 'Unauthorized' }, 401);

  const summary = { due: 0, completed: 0, deferred: 0, failed: 0 as number };
  try {
    const { data: due, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('status', 'verified')
      .lte('scheduled_deletion_at', new Date().toISOString())
      .limit(25);
    if (error) throw error;

    summary.due = due?.length || 0;

    for (const req of due || []) {
      await supabase.from('account_deletion_requests')
        .update({ status: 'processing' }).eq('id', req.id);
      try {
        await deleteUnityAccount(req);
        await supabase.from('account_deletion_requests')
          .update({ status: 'completed', processed_at: new Date().toISOString(), last_error: null })
          .eq('id', req.id);
        summary.completed++;
        // Notify the user their deletion is done.
        await sendEmail(
          req.email,
          'Your account has been deleted',
          `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;font-size:14px;line-height:1.7">
            <p>Your Nexenova Studios game account (Player ID <strong>${esc(req.player_id)}</strong>) and its associated data have been permanently deleted.</p>
            <p>If you did not expect this, contact ${ADMIN_EMAIL}.</p>
          </div>`,
        ).catch(() => {});
      } catch (err) {
        const isConfig = err instanceof UnityNotConfiguredError;
        const nextAttempts = (req.attempts || 0) + 1;
        // Config-not-set: park at 'verified' indefinitely (don't burn attempts).
        // Real error: retry, but give up as 'failed' after MAX_DELETE_ATTEMPTS.
        const MAX_DELETE_ATTEMPTS = 5;
        const giveUp = !isConfig && nextAttempts >= MAX_DELETE_ATTEMPTS;
        await supabase.from('account_deletion_requests')
          .update({
            status: giveUp ? 'failed' : 'verified',
            attempts: isConfig ? (req.attempts || 0) : nextAttempts,
            last_error: String(err instanceof Error ? err.message : err),
          })
          .eq('id', req.id);
        giveUp ? summary.failed++ : summary.deferred++;
        if (!isConfig) console.log('Unity deletion error for', req.id, err);
      }
    }

    return c.json({ success: true, data: summary });
  } catch (error) {
    console.log('Error processing deletions:', error);
    return c.json({ success: false, error: 'Processing failed', data: summary }, 500);
  }
});

Deno.serve(app.fetch);