/**
 * Shared AES-GCM encryption/decryption utilities.
 * Uses ENCRYPTION_KEY secret (min 32 chars) as master key.
 */

export async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  text: string,
  masterKey: string
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterKey);
  const encoded = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  masterKey: string
): Promise<string> {
  const key = await deriveKey(masterKey);
  const encryptedData = Uint8Array.from(atob(ciphertext), (c) =>
    c.charCodeAt(0)
  );
  const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivData },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decrypted);
}
