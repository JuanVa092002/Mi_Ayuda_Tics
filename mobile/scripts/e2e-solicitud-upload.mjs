import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Authenticated API matrix for POST /api/solicitud.
 * Does not print tokens, passwords, emails in full, or image bytes.
 */
const API = (process.env.EXPO_PUBLIC_API_URL || 'https://miayudatics-v1-0.onrender.com').replace(
  /\/$/,
  '',
);
const BASE = `${API}/api`;
const PNG_SMALL = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../assets/icon.png'));

function redactEmail(email) {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 6)}…@${domain}`;
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}

async function request(path, { method = 'GET', token, json, form, timeoutMs = 45_000 } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (form) {
    body = form;
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, { method, headers, body, signal: controller.signal });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }
    return { status: res.status, ok: res.ok, data, raw: text.slice(0, 180) };
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(label, fn, attempts = 4) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      last = await fn();
      if (last && typeof last.status === 'number' && last.status >= 500 && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
        continue;
      }
      return last;
    } catch (error) {
      last = { error: error.name, message: error.message };
      if (i === attempts - 1) return last;
      await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
    }
  }
  return last;
}

function solicitudForm({ usuario, ambiente, tipoCaso, descripcion, telefono, file, mime, filename }) {
  const form = new FormData();
  form.append('usuario', usuario);
  form.append('ambiente', ambiente);
  form.append('tipoCaso', tipoCaso);
  form.append('descripcion', descripcion);
  form.append('telefono', telefono);
  if (file) {
    form.append('foto', new Blob([file], { type: mime }), filename);
  }
  return form;
}

const stamp = Date.now();
const email = `e2e.mobile.foto.${stamp}@miayudatics.test`;
const password = 'E2eFoto1';
const results = [];

function record(name, info) {
  results.push({ name, ...info });
  console.log(JSON.stringify({ name, ...info }));
}

const health = await withRetry('health', () => request('/health'));
record('health', { status: health.status, ok: health.ok });

const register = await withRetry('register', () =>
  request('/auth/register', {
    method: 'POST',
    json: {
      nombre: 'E2E Mobile Foto',
      correo: email,
      rol: 'funcionario',
      telefono: '3000000099',
      password,
      confirmPassword: password,
    },
  }),
);
const token = register.data?.data?.token;
const userId = register.data?.data?.user?._id;
record('register', {
  status: register.status,
  ok: register.ok,
  email: redactEmail(email),
  hasToken: Boolean(token),
  userIdPrefix: userId ? String(userId).slice(0, 6) : undefined,
  message: register.data?.message,
});

if (!token || !userId) {
  console.error('STOP: no session for test funcionario');
  process.exit(1);
}

const ambientes = await request('/ambienteFormacion', { token });
const tipos = await request('/tipoCaso', { token });
const ambiente = (ambientes.data?.data ?? []).find((item) => item.activo !== false);
const tipoCaso = (tipos.data?.data ?? [])[0];
record('catalogs', {
  ambientesStatus: ambientes.status,
  tiposStatus: tipos.status,
  ambienteCount: (ambientes.data?.data ?? []).length,
  tipoCount: (tipos.data?.data ?? []).length,
  hasAmbiente: Boolean(ambiente?._id),
  hasTipo: Boolean(tipoCaso?._id),
});

if (!ambiente?._id || !tipoCaso?._id) {
  console.error('STOP: catalogs empty');
  process.exit(1);
}

const fields = {
  usuario: userId,
  ambiente: ambiente._id,
  tipoCaso: tipoCaso._id,
  telefono: '3000000099',
};

const noPhoto = await request('/solicitud', {
  method: 'POST',
  token,
  form: solicitudForm({
    ...fields,
    descripcion: `E2E-MOBILE-FOTO sin foto ${stamp}`,
  }),
});
record('case1-no-photo', {
  status: noPhoto.status,
  ok: noPhoto.ok,
  message: noPhoto.data?.message,
  solicitudIdPrefix: noPhoto.data?.solicitud?._id
    ? String(noPhoto.data.solicitud._id).slice(0, 6)
    : undefined,
  codigoCaso: noPhoto.data?.solicitud?.codigoCaso,
  foto: noPhoto.data?.solicitud?.foto ?? null,
});

const withJpeg = await request('/solicitud', {
  method: 'POST',
  token,
  form: solicitudForm({
    ...fields,
    descripcion: `E2E-MOBILE-FOTO png ${stamp}`,
    file: PNG_SMALL,
    mime: 'image/png',
    filename: 'e2e-foto.png',
  }),
});
const createdId = withJpeg.data?.solicitud?._id;
record('case2-small-jpg', {
  status: withJpeg.status,
  ok: withJpeg.ok,
  message: withJpeg.data?.message,
  solicitudId: createdId,
  codigoCaso: withJpeg.data?.solicitud?.codigoCaso,
  fotoField: withJpeg.data?.solicitud?.foto ?? null,
});

if (createdId) {
  const detail = await request(`/solicitud/${createdId}`, { token });
  const fotoUrl = detail.data?.data?.foto?.url;
  record('case2-detail', {
    status: detail.status,
    hasFotoUrl: Boolean(fotoUrl),
    fotoHost: fotoUrl ? hostOf(fotoUrl) : undefined,
    filename: detail.data?.data?.foto?.filename,
  });
}

const oversized = Buffer.concat([PNG_SMALL.subarray(0, 16), Buffer.alloc(10 * 1024 * 1024 + 1)]);
const large = await request('/solicitud', {
  method: 'POST',
  token,
  timeoutMs: 90_000,
  form: solicitudForm({
    ...fields,
    descripcion: `E2E-MOBILE-FOTO grande ${stamp}`,
    file: oversized,
    mime: 'image/jpeg',
    filename: 'grande.jpg',
  }),
});
record('case4-too-large', {
  status: large.status,
  ok: large.ok,
  message: large.data?.message,
  code: large.data?.code,
});

const badMime = await request('/solicitud', {
  method: 'POST',
  token,
  form: solicitudForm({
    ...fields,
    descripcion: `E2E-MOBILE-FOTO mime ${stamp}`,
    file: Buffer.from('not-an-image'),
    mime: 'text/plain',
    filename: 'nota.txt',
  }),
});
record('case5-bad-mime', {
  status: badMime.status,
  ok: badMime.ok,
  message: badMime.data?.message,
  code: badMime.data?.code,
});

const expired = await request('/solicitud', {
  method: 'POST',
  token: 'expired.token.value',
  form: solicitudForm({
    ...fields,
    descripcion: `E2E-MOBILE-FOTO sesion ${stamp}`,
  }),
});
record('case6-bad-token', {
  status: expired.status,
  ok: expired.ok,
  message: expired.data?.message,
});

try {
  await fetch('http://127.0.0.1:1/api/solicitud', { method: 'POST', signal: AbortSignal.timeout(2000) });
  record('case7-no-network', { reached: true });
} catch (error) {
  record('case7-no-network', {
    reached: false,
    errorName: error.name,
    errorMessage: error.message,
  });
}

console.log('SUMMARY', JSON.stringify(results.map((r) => ({ name: r.name, status: r.status, ok: r.ok }))));
