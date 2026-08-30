import { afterEach, describe, expect, it } from 'vitest';
import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import {
  UPLOAD_MAX_BYTES,
  UploadFileError,
  appendUploadFile,
  createUploadFile,
  detectMediaMime,
  detectUriProtocol,
  isAllowedUploadMime,
  setUploadFileSystemForTests,
  type ExpoFetchUploadFile,
  type UploadFileSystem,
  type UploadLocalFile,
} from './create-upload-file';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type FsEntry = {
  exists?: boolean;
  size?: number;
  type?: string;
  name?: string;
  data?: Uint8Array;
  bytesError?: Error;
};

function createMockFileSystem(initial: Record<string, FsEntry>): UploadFileSystem {
  const store = new Map<string, FsEntry>(
    Object.entries(initial).map(([uri, entry]) => [uri, { ...entry }]),
  );

  function handle(uri: string): UploadLocalFile {
    const rec = () => store.get(uri) ?? {};
    return {
      uri,
      get exists() {
        return rec().exists ?? Boolean(rec().data);
      },
      get size() {
        return rec().size ?? rec().data?.byteLength ?? 0;
      },
      get type() {
        return rec().type ?? '';
      },
      get name() {
        return rec().name ?? uri.split('/').pop() ?? 'file';
      },
      async bytes() {
        const entry = rec();
        if (entry.bytesError) throw entry.bytesError;
        if (!entry.data) throw new Error('ENOENT');
        return entry.data;
      },
      async copyTo(destination) {
        const entry = rec();
        if (entry.bytesError) throw entry.bytesError;
        if (!entry.data) throw new Error('ENOENT');
        store.set(destination.uri, {
          exists: true,
          data: new Uint8Array(entry.data),
          size: entry.data.byteLength,
          type: entry.type,
          name: destination.name,
        });
      },
    };
  }

  return {
    open: handle,
    createCacheFile(fileName) {
      const uri = `file:///mock-cache/${fileName}`;
      if (!store.has(uri)) {
        store.set(uri, { exists: false, name: fileName });
      }
      return handle(uri);
    },
  };
}

afterEach(() => {
  setUploadFileSystemForTests(null);
});

describe('createUploadFile filesystem adapter', () => {
  it('rechaza URI vacía', async () => {
    setUploadFileSystemForTests(createMockFileSystem({}));
    await expect(createUploadFile({ uri: '' })).rejects.toMatchObject({
      code: 'MISSING_URI',
    });
  });

  it('file:// legible crea objeto compatible con expo/fetch (bytes/name/type)', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///data/cache/ImagePicker/abc.jpg': {
          exists: true,
          data: JPEG,
          type: 'image/jpeg',
          name: 'abc.jpg',
        },
      }),
    );
    const file = await createUploadFile({
      uri: 'file:///data/cache/ImagePicker/abc.jpg',
      mimeType: 'image/jpg',
      fileName: 'captura',
      origin: 'camera',
    });
    expect(file.name).toBe('captura.jpg');
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBe(4);
    expect(file.uriProtocol).toBe('file');
    expect(typeof file.bytes).toBe('function');
    expect(file instanceof Blob).toBe(false);
    await expect(file.bytes()).resolves.toEqual(JPEG);
  });

  it('content:// existente se lee por FileSystem sin inventar conversión de URI', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'content://media/external/images/media/1': {
          exists: true,
          data: PNG,
          type: 'image/png',
          name: 'img.png',
        },
      }),
    );
    const file = await createUploadFile({
      uri: 'content://media/external/images/media/1',
      mimeType: 'image/png',
      fileName: 'img.png',
      origin: 'gallery',
    });
    expect(file.uriProtocol).toBe('content');
    expect(file.type).toBe('image/png');
    await expect(file.bytes()).resolves.toEqual(PNG);
  });

  it('content:// que File no marca existente se copia a cache file:// de la app', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'content://media/external/images/media/2': {
          exists: false,
          data: JPEG,
          type: 'image/jpeg',
          name: 'from-gallery.jpg',
        },
      }),
    );
    const file = await createUploadFile({
      uri: 'content://media/external/images/media/2',
      mimeType: 'image/jpeg',
      origin: 'gallery',
    });
    expect(file.type).toBe('image/jpeg');
    await expect(file.bytes()).resolves.toEqual(JPEG);
  });

  it('archivo ausente lanza UploadFileError UNREADABLE', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///data/cache/missing.jpg': { exists: false },
      }),
    );
    await expect(
      createUploadFile({ uri: 'file:///data/cache/missing.jpg', origin: 'gallery' }),
    ).rejects.toMatchObject({
      name: 'UploadFileError',
      code: 'UNREADABLE',
      message: 'No se pudo leer la imagen seleccionada',
    });
  });

  it('archivo >10 MiB se rechaza por tamaño antes de POST', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///tmp/huge.jpg': {
          exists: true,
          size: UPLOAD_MAX_BYTES + 1,
          data: JPEG,
          bytesError: new Error('no debe leer bytes si el tamaño ya excede'),
        },
      }),
    );
    await expect(
      createUploadFile({ uri: 'file:///tmp/huge.jpg', origin: 'camera' }),
    ).rejects.toMatchObject({ code: 'FILE_TOO_LARGE', message: 'La imagen supera el límite de 10 MB' });
  });

  it('tamaño declarado excesivo se rechaza sin leer el archivo', async () => {
    setUploadFileSystemForTests(createMockFileSystem({}));
    await expect(
      createUploadFile({
        uri: 'file:///tmp/huge.jpg',
        fileSize: UPLOAD_MAX_BYTES + 1,
      }),
    ).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' });
  });

  it('MIME no permitido se rechaza antes de POST', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///tmp/x.bin': {
          exists: true,
          data: new Uint8Array([0x00, 0x01, 0x02, 0x03]),
        },
      }),
    );
    await expect(
      createUploadFile({
        uri: 'file:///tmp/x.bin',
        mimeType: 'application/octet-stream',
      }),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_MIME',
      message: 'Tipo de archivo no permitido',
    });
  });

  it('bytes() nativo fallido usa copy UNREADABLE y no NETWORK_ERROR', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///cache/a.jpg': {
          exists: true,
          size: 4,
          data: JPEG,
          bytesError: new Error('native read failed'),
        },
      }),
    );
    const error = await createUploadFile({ uri: 'file:///cache/a.jpg' }).catch((e) => e);
    expect(error).toBeInstanceOf(UploadFileError);
    expect(error).toMatchObject({
      code: 'UNREADABLE',
      message: 'No se pudo leer la imagen seleccionada',
    });
    const mapped = mapUnknownFetchError(error);
    expect(mapped.code).toBe('VALIDATION_ERROR');
    expect(mapped.code).not.toBe('NETWORK_ERROR');
    expect(mapped.message).toBe('No se pudo leer la imagen seleccionada');
  });

  it('FormData recibe foto con el tipo exacto que expo/fetch acepta (bytes())', async () => {
    setUploadFileSystemForTests(
      createMockFileSystem({
        'file:///cache/a.jpg': { exists: true, data: JPEG, name: 'a.jpg' },
      }),
    );
    const stored: { name: string; value: unknown }[] = [];
    const formData = {
      append(name: string, value: unknown) {
        stored.push({ name, value });
      },
    } as unknown as FormData;

    await appendUploadFile(formData, 'foto', {
      uri: 'file:///cache/a.jpg',
      mimeType: 'image/jpeg',
      fileName: 'a.jpg',
      origin: 'gallery',
    });

    expect(stored).toHaveLength(1);
    expect(stored[0]?.name).toBe('foto');
    const part = stored[0]?.value as ExpoFetchUploadFile;
    expect(part).toEqual(
      expect.objectContaining({
        name: 'a.jpg',
        type: 'image/jpeg',
        size: 4,
      }),
    );
    expect(typeof part.bytes).toBe('function');
    expect(Object.prototype.hasOwnProperty.call(part, 'uri')).toBe(false);
    await expect(part.bytes()).resolves.toBeInstanceOf(Uint8Array);
  });

  it('detecta protocolos de URI sin convertirlos', () => {
    expect(detectUriProtocol('file:///data/cache/ImagePicker/abc.jpg')).toBe('file');
    expect(detectUriProtocol('content://media/external/images/media/1')).toBe('content');
  });

  it('helpers de mime', () => {
    expect(detectMediaMime(JPEG)).toBe('image/jpeg');
    expect(isAllowedUploadMime('image/png')).toBe(true);
    expect(isAllowedUploadMime('text/plain')).toBe(false);
  });
});
