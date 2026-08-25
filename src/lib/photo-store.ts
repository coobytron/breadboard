const DB_NAME = 'breadboard-buddy';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

function unavailableError(): Error {
  return new Error(
    'Photo storage is unavailable in this browser. Photos stay on this device, so nothing was uploaded.',
  );
}

function storageError(): Error {
  return new Error(
    'Photo storage failed on this device. Try freeing browser storage, then try again.',
  );
}

function getFactory(): IDBFactory | null {
  return typeof indexedDB === 'undefined' ? null : indexedDB;
}

function openDatabase(): Promise<IDBDatabase> {
  const factory = getFactory();
  if (!factory) return Promise.reject(unavailableError());

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;

    try {
      request = factory.open(DB_NAME, DB_VERSION);
    } catch {
      reject(unavailableError());
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(storageError());
    request.onblocked = () => reject(storageError());
  });
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  makeRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    let result: T;
    let requestFinished = false;
    let settled = false;

    const finishReject = (error: Error) => {
      if (settled) return;
      settled = true;
      database.close();
      reject(error);
    };

    let transaction: IDBTransaction;
    let request: IDBRequest<T>;

    try {
      transaction = database.transaction(STORE_NAME, mode);
      request = makeRequest(transaction.objectStore(STORE_NAME));
    } catch {
      finishReject(storageError());
      return;
    }

    request.onsuccess = () => {
      result = request.result;
      requestFinished = true;
    };
    request.onerror = () => finishReject(storageError());

    transaction.oncomplete = () => {
      if (settled) return;
      settled = true;
      database.close();
      if (requestFinished) resolve(result);
      else reject(storageError());
    };
    transaction.onerror = () => finishReject(storageError());
    transaction.onabort = () => finishReject(storageError());
  });
}

export async function savePhoto(blob: Blob): Promise<string> {
  const key = crypto.randomUUID();

  try {
    await runRequest<IDBValidKey>('readwrite', (store) => store.put(blob, key));
    return key;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw storageError();
  }
}

export async function loadPhoto(key: string): Promise<Blob | null> {
  try {
    const value = await runRequest<unknown>('readonly', (store) => store.get(key));
    return value instanceof Blob ? value : null;
  } catch {
    return null;
  }
}

export async function deletePhoto(key: string): Promise<void> {
  try {
    await runRequest<undefined>('readwrite', (store) => store.delete(key));
  } catch {
    // Failing soft keeps a blocked storage backend from breaking notebook rendering.
  }
}

export async function totalBytes(): Promise<number> {
  let database: IDBDatabase;

  try {
    database = await openDatabase();
  } catch {
    return 0;
  }

  return new Promise<number>((resolve) => {
    let total = 0;
    let settled = false;

    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      database.close();
      resolve(value);
    };

    let transaction: IDBTransaction;
    let request: IDBRequest<IDBCursorWithValue | null>;

    try {
      transaction = database.transaction(STORE_NAME, 'readonly');
      request = transaction.objectStore(STORE_NAME).openCursor();
    } catch {
      finish(0);
      return;
    }

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value instanceof Blob) total += cursor.value.size;
      cursor.continue();
    };
    request.onerror = () => finish(0);

    transaction.oncomplete = () => finish(total);
    transaction.onerror = () => finish(0);
    transaction.onabort = () => finish(0);
  });
}
