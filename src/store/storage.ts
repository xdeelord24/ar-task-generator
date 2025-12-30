import type { StateStorage } from 'zustand/middleware';

const SERVER_URL = 'http://localhost:3001/api/storage';
const DB_NAME = 'ar-generator-db';
const STORE_NAME = 'keyvalue';
const DB_VERSION = 1;

// --- Standard Browser Database Handler (IndexedDB Wrapper) ---
class BrowserDatabase {
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    async get(key: string): Promise<string | null> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result as string || null);
            request.onerror = () => reject(request.error);
        });
    }

    async set(key: string, value: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async remove(key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

const browserDb = new BrowserDatabase();

const getAuthToken = () => {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return parsed.state?.token;
        }
    } catch (e) {
        return null;
    }
    return null;
};

export const serverStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            // 1. Try fetching from server (Source of Truth)
            const token = getAuthToken();
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${SERVER_URL}/${name}`, { headers });

            let serverData = null;
            if (response.ok) {
                serverData = await response.json();
            }

            if (serverData) {
                // Determine if we need to fetch shared data
                if (token && name.includes('app-storage')) {
                    try {
                        const sharedRes = await fetch('http://localhost:3001/api/shared', { headers });
                        if (sharedRes.ok) {
                            const sharedData = await sharedRes.json();
                            const currentState = serverData.state || serverData;

                            // Merge shared spaces - Check if they exist to prevent duplicates if logic changes
                            if (sharedData.spaces && sharedData.spaces.length > 0) {
                                if (!currentState.spaces) currentState.spaces = [];
                                const existingSpaceIds = new Set(currentState.spaces.map((s: any) => s.id));
                                sharedData.spaces.forEach((s: any) => {
                                    if (!existingSpaceIds.has(s.id)) {
                                        // s.name should already have (Shared) from server, but nice to ensure
                                        currentState.spaces.push(s);
                                    }
                                });
                            }

                            if (sharedData.folders && sharedData.folders.length > 0) {
                                if (!currentState.folders) currentState.folders = [];
                                const existingIds = new Set(currentState.folders.map((f: any) => f.id));
                                sharedData.folders.forEach((f: any) => {
                                    if (!existingIds.has(f.id)) currentState.folders.push(f);
                                });
                            }

                            if (sharedData.lists && sharedData.lists.length > 0) {
                                if (!currentState.lists) currentState.lists = [];
                                const existingIds = new Set(currentState.lists.map((l: any) => l.id));
                                sharedData.lists.forEach((l: any) => {
                                    if (!existingIds.has(l.id)) currentState.lists.push(l);
                                });
                            }

                            if (sharedData.tasks && sharedData.tasks.length > 0) {
                                if (!currentState.tasks) currentState.tasks = [];
                                const existingIds = new Set(currentState.tasks.map((t: any) => t.id));
                                sharedData.tasks.forEach((t: any) => {
                                    if (!existingIds.has(t.id)) currentState.tasks.push(t);
                                });
                            }
                        }
                    } catch (e) { console.error('Failed to merge shared data', e); }
                }

                const dataStr = JSON.stringify(serverData);
                // Sync to local DB for offline backup
                await browserDb.set(name, dataStr);
                return dataStr;
            }

            // 2. Fallback to IndexedDB (Standard Database Handler)
            console.log('Server unreachable or empty, checking IndexedDB...');
            const localData = await browserDb.get(name);

            // Check legacy localStorage for migration
            if (!localData && typeof localStorage !== 'undefined') {
                const legacyData = localStorage.getItem(name);
                if (legacyData) {
                    console.log('Migrating localStorage to IndexedDB...');
                    await browserDb.set(name, legacyData);
                    return legacyData;
                }
            }

            return localData;
        } catch (error) {
            console.error('Failed to fetch state from server:', error);
            // Fallback to local DB
            return await browserDb.get(name);
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        // 1. Save to Local DB immediately
        await browserDb.set(name, value);

        // 2. Sync to Server
        try {
            const token = getAuthToken();
            // Don't sync to server if not logged in, to avoid overwriting public/default state
            if (!token) return;

            await fetch(`${SERVER_URL}/${name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: value,
            });
        } catch (error) {
            console.error('Failed to save state to server (saved locally):', error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        await browserDb.remove(name);
    },
};
