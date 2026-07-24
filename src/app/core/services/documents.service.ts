import { computed, Injectable, signal } from '@angular/core';

export type DocumentVisibility = 'public' | 'private';
export interface PublicDocument { id: number; title: string; description: string; category: string; documentDate: string; year: number; month: number; size: string; url: string; visibility: DocumentVisibility; }
interface StoredDocument extends Omit<PublicDocument, 'url'> { blob: Blob; }

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  readonly documents = signal<PublicDocument[]>([]);
  readonly publicDocuments = computed(() => this.documents().filter(document => document.visibility === 'public'));
  private readonly database = this.openDatabase();

  constructor() { void this.load(); }

  async add(title: string, description: string, category: string, documentDate: string, file: File, visibility: DocumentVisibility): Promise<void> {
    const [year, month] = documentDate.split('-').map(Number);
    const stored: StoredDocument = { id: Date.now(), title, description, category, documentDate, year, month, size: this.fileSize(file.size), visibility, blob: file };
    await this.put(stored);
    this.documents.update(items => [{ ...stored, url: URL.createObjectURL(file) }, ...items]);
  }

  async setVisibility(id: number, visibility: DocumentVisibility): Promise<void> {
    const db = await this.database;
    const stored = await this.request<StoredDocument | undefined>(db.transaction('documents', 'readonly').objectStore('documents').get(id));
    if (!stored) return;
    await this.put({ ...stored, visibility });
    this.documents.update(items => items.map(document => document.id === id ? { ...document, visibility } : document));
  }

  async remove(id: number): Promise<void> {
    const item = this.documents().find(document => document.id === id);
    if (item?.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
    const db = await this.database;
    await this.transactionDone(db.transaction('documents', 'readwrite'), transaction => transaction.objectStore('documents').delete(id));
    this.documents.update(items => items.filter(document => document.id !== id));
  }

  private async load(): Promise<void> {
    const db = await this.database;
    const stored = await this.request<StoredDocument[]>(db.transaction('documents', 'readonly').objectStore('documents').getAll());
    this.documents.set(stored.sort((a, b) => b.id - a.id).map(document => ({ ...document, description: document.description ?? '', month: document.month ?? new Date(document.id).getMonth() + 1, documentDate: document.documentDate ?? `${document.year}-${String(document.month ?? 1).padStart(2, '0')}-01`, visibility: document.visibility ?? 'public', url: URL.createObjectURL(document.blob) })));
  }

  private async put(document: StoredDocument): Promise<void> {
    const db = await this.database;
    await this.transactionDone(db.transaction('documents', 'readwrite'), transaction => transaction.objectStore('documents').put(document));
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('abrazo-rosa', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('documents', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private request<T>(request: IDBRequest<T>): Promise<T> { return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
  private transactionDone(transaction: IDBTransaction, action: (transaction: IDBTransaction) => void): Promise<void> { return new Promise((resolve, reject) => { action(transaction); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); }
  private fileSize(bytes: number): string { return bytes < 1_000_000 ? `${Math.ceil(bytes / 1000)} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`; }
}
