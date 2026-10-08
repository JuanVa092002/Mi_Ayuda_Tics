export async function parseJsonMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: Array<{ message?: string } | string>;
    };
    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    const first = data.errors?.[0];
    if (typeof first === 'string' && first.length > 0) return first;
    if (first && typeof first === 'object' && typeof first.message === 'string') {
      return first.message;
    }
  } catch {
    // ignore parse errors
  }
  return `Error del servidor (${response.status})`;
}

export async function parseJsonBody<T>(text: string): Promise<T> {
  return JSON.parse(text) as T;
}
