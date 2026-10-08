import { vi } from 'vitest';

vi.mock('expo-file-system', () => {
  class File {
    uri = '';
    exists = false;
    size = 0;
    type = '';
    name = '';
    constructor(...args: unknown[]) {
      this.uri = args
        .map((arg) => (typeof arg === 'string' ? arg : (arg as { uri?: string }).uri ?? ''))
        .filter(Boolean)
        .join('/');
    }
    async bytes() {
      return new Uint8Array();
    }
    async copy() {}
    create() {
      this.exists = true;
    }
    write(content: string | Uint8Array) {
      this.exists = true;
      this.size = typeof content === 'string' ? content.length : content.byteLength;
    }
    delete() {
      this.exists = false;
      this.size = 0;
    }
  }
  class Directory {
    uri = '';
    exists = false;
    constructor(...args: unknown[]) {
      this.uri = args
        .map((arg) => (typeof arg === 'string' ? arg : (arg as { uri?: string }).uri ?? ''))
        .filter(Boolean)
        .join('/');
    }
    create() {
      this.exists = true;
    }
    delete() {
      this.exists = false;
    }
  }
  return {
    File,
    Directory,
    Paths: { cache: { uri: 'file:///cache/' } },
  };
});
