import type { StateStorage } from 'zustand/middleware';
import { API_BASE_URL } from '../config';

const SERVER_URL = `${API_BASE_URL}/api/storage`;
const DB_NAME = 'ar-generator-db';
const STORE_NAME = 'keyvalue';
const DB_VERSION = 2;

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
            try {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result as string || null);
                request.onerror = () => reject(request.error);
            } catch (e) {
                console.error('[IndexedDB] Transaction Failed (Get):', e);
                resolve(null);
            }
        });
    }

    async set(key: string, value: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put(value, key);

                transaction.oncomplete = () => {
                    resolve();
                };

                transaction.onerror = () => {
                    console.error('[IndexedDB] Transaction Error:', transaction.error);
                    reject(transaction.error);
                };
            } catch (e) {
                console.error('[IndexedDB] Transaction Failed (Set):', e);
                reject(e);
            }
        });
    }

    async remove(key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.delete(key);

                transaction.oncomplete = () => {
                    resolve();
                };

                transaction.onerror = () => {
                    console.error('[IndexedDB] Transaction Error (Remove):', transaction.error);
                    reject(transaction.error);
                };
            } catch (e) {
                console.error('[IndexedDB] Transaction Failed (Remove):', e);
                reject(e);
            }
        });
    }
}

const browserDb = new BrowserDatabase();

export const getAuthToken = () => {
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
            // 1. Robust Load Strategy: Check both IDB and LS, use the freshest (based on timestamp).
            let localDataStr: string | null = null;

            let idbData: string | null = null;
            let idbTs: number = 0;
            let lsData: string | null = null;
            let lsTs: number = 0;

            // Fetch IndexedDB Data
            try {
                // Parallel fetch for speed
                const [val, ts] = await Promise.all([
                    browserDb.get(name),
                    browserDb.get(`${name}_ts`)
                ]);
                idbData = val;
                idbTs = ts ? parseInt(ts, 10) : 0;
                if (isNaN(idbTs)) idbTs = 0;
            } catch (idbErr) {
                console.error('[Storage] IndexedDB read failed:', idbErr);
            }

            // Fetch LocalStorage Data
            if (typeof localStorage !== 'undefined') {
                lsData = localStorage.getItem(name);
                const tsStr = localStorage.getItem(`${name}_ts`);
                lsTs = tsStr ? parseInt(tsStr, 10) : 0;
                if (isNaN(lsTs)) lsTs = 0;
            }

            // Decision Logic: Which source to use?
            if (lsTs > idbTs && lsData) {
                console.log('[Storage] LocalStorage is newer than IndexedDB. Using LS.');
                localDataStr = lsData;
                // Self-healing: Update IDB to match LS
                browserDb.set(name, lsData).catch(e => console.warn('Self-heal IDB val failed', e));
                browserDb.set(`${name}_ts`, lsTs.toString()).catch(e => console.warn('Self-heal IDB ts failed', e));
            } else if (idbData) {
                // Default to IDB if it's newer or equal, or if LS is missing
                localDataStr = idbData;
            } else {
                // Fallback to LS if IDB is empty/failed
                localDataStr = lsData;
            }

            let localJson: any = localDataStr ? JSON.parse(localDataStr) : null;

            // 2. Fetch Server/Shared Data (Secondary/Sync)
            const token = getAuthToken();
            if (token) {
                try {
                    const headers: HeadersInit = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    };

                    const response = await fetch(`${SERVER_URL}/${name}`, { headers });
                    let serverJson = null;

                    if (response.ok) {
                        serverJson = await response.json();
                    }

                    // 3. Fetch Shared Resources (Invited Spaces, etc.)
                    if (name.includes('app-storage')) {
                        try {
                            const sharedRes = await fetch(`${API_BASE_URL}/api/shared`, { headers });
                            if (sharedRes.ok) {
                                const sharedData = await sharedRes.json();
                                // Merge shared data into serverJson (which might be empty if new user)
                                // Self-healing: if serverJson is a string (double encoded), parse it
                                if (typeof serverJson === 'string') {
                                    try {
                                        serverJson = JSON.parse(serverJson);
                                    } catch (e) {
                                        console.error('[Storage] Failed to parse double-encoded serverJson', e);
                                    }
                                }

                                if (!serverJson) serverJson = { state: {}, version: 0 };
                                if (!serverJson.state) serverJson.state = {};

                                const sState = serverJson.state;

                                const mergeShared = (listName: string, items: any[]) => {
                                    if (!items || items.length === 0) return;
                                    if (!sState[listName]) sState[listName] = [];

                                    const existingMap = new Map(sState[listName].map((i: any) => [i.id, i]));

                                    items.forEach(item => {
                                        if (existingMap.has(item.id)) {
                                            // Overwrite/Augment existing item with shared data (Authority)
                                            const existing = existingMap.get(item.id);
                                            Object.assign(existing as object, item);
                                        } else {
                                            sState[listName].push(item);
                                        }
                                    });
                                };

                                mergeShared('spaces', sharedData.spaces);
                                mergeShared('folders', sharedData.folders);
                                mergeShared('lists', sharedData.lists);
                                mergeShared('tasks', sharedData.tasks);
                            }
                        } catch (e) {
                            console.error('[Storage] Failed to fetch/merge shared data:', e);
                        }
                    }

                    // 4. SMART MERGE: Local (Master) + Shared (Merge)
                    if (localJson && localJson.state) {
                        if (serverJson && serverJson.state) {
                            console.log('[Storage] Merging Server/Shared data into Local state...');

                            const lState = localJson.state;
                            const sState = serverJson.state;

                            const safeMerge = (listName: string) => {
                                const localData = lState[listName];
                                const serverData = sState[listName];

                                // Assume type based on local structure, or fallback to server's if local is empty/null
                                const isArray = Array.isArray(localData) || (!localData && Array.isArray(serverData));

                                if (isArray) {
                                    const localList = localData || [];
                                    const serverList = serverData || [];
                                    const localIds = new Set(localList.map((i: any) => i.id));
                                    const localMap = new Map(localList.map((i: any) => [i.id, i]));

                                    let addedCount = 0;
                                    let updatedCount = 0;

                                    serverList.forEach((sItem: any) => {
                                        if (!localIds.has(sItem.id)) {
                                            localList.push(sItem);
                                            addedCount++;
                                        } else {
                                            // Item exists. Check if Server is newer.
                                            const localItem = localMap.get(sItem.id);

                                            if (localItem) {
                                                const getMTime = (item: any) => item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
                                                const serverTime = getMTime(sItem);
                                                const localTime = getMTime(localItem);

                                                // Update if Server is strictly newer, OR if it's a shared item (syncs metadata)
                                                if (serverTime > localTime) {
                                                    Object.assign(localItem, sItem);
                                                    updatedCount++;
                                                } else if (sItem.isShared) {
                                                    Object.assign(localItem, {
                                                        isShared: true,
                                                        ownerId: sItem.ownerId,
                                                        ownerName: sItem.ownerName,
                                                        permission: sItem.permission,
                                                        name: sItem.name,
                                                        color: sItem.color,
                                                        icon: sItem.icon
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    if (addedCount > 0 || updatedCount > 0) {
                                        console.log(`[Storage] Merged ${addedCount} new, ${updatedCount} updated ${listName} from server.`);
                                        lState[listName] = localList;
                                    }
                                } else {
                                    // Handle Object/Record merging (e.g. tasks)
                                    const localObj = localData || {};
                                    const serverObj = serverData || {};
                                    let addedCount = 0;
                                    let updatedCount = 0;

                                    Object.values(serverObj).forEach((sItem: any) => {
                                        const key = sItem.id;
                                        if (!key) return;

                                        const lItem = localObj[key];
                                        if (!lItem) {
                                            localObj[key] = sItem;
                                            addedCount++;
                                        } else {
                                            const getMTime = (item: any) => item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
                                            const serverTime = getMTime(sItem);
                                            const localTime = getMTime(lItem);

                                            // Handle server update sync
                                            if (serverTime > localTime) {
                                                Object.assign(lItem, sItem);
                                                updatedCount++;
                                            } else if (sItem.isShared) {
                                                // Minimal shared props sync if needed
                                                Object.assign(lItem, {
                                                    isShared: true,
                                                    ownerId: sItem.ownerId,
                                                    ownerName: sItem.ownerName,
                                                    permission: sItem.permission
                                                });
                                            }
                                        }
                                    });

                                    if (addedCount > 0 || updatedCount > 0) {
                                        console.log(`[Storage] Merged ${addedCount} new, ${updatedCount} updated object items for ${listName}`);
                                        lState[listName] = localObj;
                                    }
                                }
                            };

                            safeMerge('spaces');
                            safeMerge('folders');
                            safeMerge('lists');
                            safeMerge('tasks');
                            safeMerge('docs');

                            // Merge Primitives (XP, Level) - specific handling for gamification
                            if (sState.userLevel !== undefined) {
                                const localLevel = lState.userLevel || 1;
                                const serverLevel = sState.userLevel || 1;

                                if (serverLevel > localLevel) {
                                    lState.userLevel = serverLevel;
                                    lState.userExp = sState.userExp;
                                    console.log(`[Storage] Synced Level/Exp from server (Server ahead): Level ${serverLevel}`);
                                } else if (serverLevel === localLevel) {
                                    const localExp = lState.userExp || 0;
                                    const serverExp = sState.userExp || 0;
                                    if (serverExp > localExp) {
                                        lState.userExp = serverExp;
                                        console.log(`[Storage] Synced Exp from server (Server ahead): ${serverExp}`);
                                    }
                                }
                            }

                            // Update local DB with the merged result so next load is faster
                            localDataStr = JSON.stringify(localJson);

                            // Update both stores with merged result
                            const newTs = Date.now().toString();
                            if (typeof localStorage !== 'undefined') {
                                try {
                                    localStorage.setItem(`${name}_ts`, newTs);
                                    localStorage.setItem(name, localDataStr);
                                } catch (e) { }
                            }
                            await browserDb.set(`${name}_ts`, newTs);
                            await browserDb.set(name, localDataStr);

                            // CRITICAL FIX: Push the merged state back to Server!
                            // If Local had items (like a new space) that Server missed, Server needs this update.
                            // We do this in background.
                            const token = getAuthToken();
                            if (token) {
                                fetch(`${SERVER_URL}/${name}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: localDataStr,
                                }).catch(e => console.error('[Storage] Auto-sync to server failed:', e));
                            }
                        }
                        // IMPORTANT: Even if merge happens, we return localDataStr which is now updated
                        return localDataStr;
                    } else {
                        // No local data but we have server data
                        if (serverJson) {
                            const paramsStr = JSON.stringify(serverJson);
                            const newTs = Date.now().toString();

                            if (typeof localStorage !== 'undefined') {
                                try {
                                    localStorage.setItem(`${name}_ts`, newTs);
                                    localStorage.setItem(name, paramsStr);
                                } catch (e) { }
                            }
                            await browserDb.set(`${name}_ts`, newTs);
                            await browserDb.set(name, paramsStr);
                            return paramsStr;
                        }
                    }

                } catch (e) {
                    console.error('[Storage] Server sync failed, falling back to local:', e);
                }
            }

            return localDataStr;

        } catch (error) {
            console.error('Failed to load state:', error);
            // Last resort
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(name);
            }
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        const ts = Date.now().toString();

        // 1. Synchronous Backup to LocalStorage (Critical for rapid refresh/close)
        // We do this BEFORE awaiting IDB to ensure data is at least somewhere safe immediately.
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem(`${name}_ts`, ts);
                localStorage.setItem(name, value);
            } catch (e: any) {
                // Ignore Quota errors silently to avoid console spam, effectively gracefully degrading
                if (e.name !== 'QuotaExceededError') {
                    console.warn('[Storage] LocalStorage backup failed:', e);
                }
            }
        }

        // 2. Save to Local DB (Primary target - Async)
        try {
            await browserDb.set(`${name}_ts`, ts);
            await browserDb.set(name, value);
        } catch (e) {
            console.error('[Storage] IDB Save failed:', e);
        }

        // 3. Sync to Server (Background)
        try {
            const token = getAuthToken();
            if (!token) return;

            // Filter out local-only settings (like aiConfig) before sending to server
            let serverPayload = value;
            try {
                const parsed = JSON.parse(value);
                if (parsed.state && parsed.state.aiConfig) {
                    const cleanState = { ...parsed.state };
                    delete cleanState.aiConfig;
                    serverPayload = JSON.stringify({ ...parsed, state: cleanState });
                }
            } catch (e) {
                console.warn('[Storage] Payload filtering failed:', e);
            }

            // Fire and forget, logging errors if any
            fetch(`${SERVER_URL}/${name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: serverPayload,
            }).catch(e => console.error('[Storage] Background sync error:', e));

        } catch (error) {
            console.error('[Storage] Failed to initiate server sync:', error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        await browserDb.remove(name);
        await browserDb.remove(`${name}_ts`);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(name);
            localStorage.removeItem(`${name}_ts`);
        }
    },
};
