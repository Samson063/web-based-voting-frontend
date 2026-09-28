// Browser-side WebAuthn plumbing for fingerprint / Face unlock.
//
// The browser API speaks ArrayBuffer; the Go backend speaks base64url strings.
// Everything in this file is the translation layer between the two, plus small
// wrappers around navigator.credentials.

// ── base64url <-> ArrayBuffer ─────────────────────────────
function b64urlToBuffer(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = padded.length % 4 ? '='.repeat(4 - (padded.length % 4)) : ''
  const binary = atob(padded + padding)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function bufferToB64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ── Capability checks ─────────────────────────────────────

// True if the browser supports WebAuthn at all.
export const isWebAuthnSupported = () =>
  typeof window !== 'undefined' &&
  !!window.PublicKeyCredential &&
  !!navigator.credentials

// True if this device has a built-in biometric sensor the browser can use
// (Touch ID, Windows Hello, Android fingerprint, Face ID in Safari).
export async function isBiometricAvailable() {
  if (!isWebAuthnSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// True if the browser can show the "pick a saved passkey" autofill UI.
export async function isConditionalUIAvailable() {
  if (!isWebAuthnSupported()) return false
  try {
    return (await window.PublicKeyCredential.isConditionalMediationAvailable?.()) ?? false
  } catch {
    return false
  }
}

// ── Option decoding (server JSON -> browser objects) ──────
function decodeCreationOptions(options) {
  return {
    ...options,
    challenge: b64urlToBuffer(options.challenge),
    user: { ...options.user, id: b64urlToBuffer(options.user.id) },
    excludeCredentials: (options.excludeCredentials || []).map((c) => ({
      ...c,
      id: b64urlToBuffer(c.id),
    })),
  }
}

function decodeRequestOptions(options) {
  return {
    ...options,
    challenge: b64urlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((c) => ({
      ...c,
      id: b64urlToBuffer(c.id),
    })),
  }
}

// ── Credential encoding (browser objects -> server JSON) ──
function encodeAttestation(credential) {
  return {
    id: credential.id,
    rawId: bufferToB64url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment || undefined,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: bufferToB64url(credential.response.clientDataJSON),
      attestationObject: bufferToB64url(credential.response.attestationObject),
      transports: credential.response.getTransports?.() || [],
    },
  }
}

function encodeAssertion(credential) {
  return {
    id: credential.id,
    rawId: bufferToB64url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment || undefined,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: bufferToB64url(credential.response.clientDataJSON),
      authenticatorData: bufferToB64url(credential.response.authenticatorData),
      signature: bufferToB64url(credential.response.signature),
      userHandle: credential.response.userHandle
        ? bufferToB64url(credential.response.userHandle)
        : null,
    },
  }
}

// ── The two ceremonies ────────────────────────────────────

// Prompts for fingerprint/face and returns the attestation to send to
// /auth/passkey/register/finish.
export async function createCredential(options) {
  const credential = await navigator.credentials.create({
    publicKey: decodeCreationOptions(options),
  })
  if (!credential) throw new Error('Enrollment was cancelled')
  return encodeAttestation(credential)
}

// Prompts for fingerprint/face and returns the assertion to send to
// /auth/passkey/login/finish. Pass mediation: 'conditional' to drive the
// browser's passkey autofill instead of a modal.
export async function getCredential(options, { mediation, signal } = {}) {
  const credential = await navigator.credentials.get({
    publicKey: decodeRequestOptions(options),
    mediation,
    signal,
  })
  if (!credential) throw new Error('Sign-in was cancelled')
  return encodeAssertion(credential)
}

// Turns raw DOMExceptions into something a student can act on.
export function friendlyError(err) {
  if (!err) return 'Something went wrong. Please try again.'
  switch (err.name) {
    case 'NotAllowedError':
      return 'Cancelled, or the scan timed out. Please try again.'
    case 'InvalidStateError':
      return 'This device already has biometric unlock set up for your account.'
    case 'NotSupportedError':
      return 'This device does not support fingerprint or face unlock.'
    case 'SecurityError':
      return 'Biometric unlock only works over HTTPS (or on localhost).'
    case 'AbortError':
      return 'The request was cancelled.'
    default:
      return err.message || 'Something went wrong. Please try again.'
  }
}

// A readable default label so a student can tell their devices apart later.
export function guessDeviceLabel() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone / iPad'
  if (/Android/i.test(ua)) return 'Android phone'
  if (/Macintosh/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua)) return 'Linux PC'
  return 'This device'
}
