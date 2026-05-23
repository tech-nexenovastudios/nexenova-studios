// Утилиты для шифрования данных
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Функция для генерации ключа шифрования из пароля
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

// Функция для шифрования данных
export async function encryptData(data: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  // Объединяем salt, iv и зашифрованные данные
  const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // Возвращаем в base64
  return btoa(String.fromCharCode(...result));
}

// Функция для расшифровки данных
export async function decryptData(encryptedData: string, password: string): Promise<string> {
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

// Функция для хеширования паролей
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  
  // Экспортируем ключ как raw для получения хеша
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  const hash = new Uint8Array(keyBuffer);
  
  // Объединяем salt и hash
  const result = new Uint8Array(salt.length + hash.length);
  result.set(salt, 0);
  result.set(hash, salt.length);
  
  return btoa(String.fromCharCode(...result));
}

// Функция для проверки пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const data = new Uint8Array(atob(hashedPassword).split('').map(c => c.charCodeAt(0)));
    const salt = data.slice(0, 16);
    const storedHash = data.slice(16);
    
    const key = await deriveKey(password, salt);
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    const computedHash = new Uint8Array(keyBuffer);
    
    // Сравниваем хеши
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

// Функция для генерации JWT токена (упрощенная версия)
export async function generateJWT(payload: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
  }));

  const signature = await signHMAC(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Функция для верификации JWT токена
export async function verifyJWT(token: string, secret: string): Promise<any> {
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

// Функция для подписи HMAC
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