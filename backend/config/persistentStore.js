const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const COLLECTIONS = ['users', 'activities', 'grievances', 'documents', 'chat', 'saved_schemes'];

const store = {
  users: [],
  activities: [],
  grievances: [],
  documents: [],
  chat: [],
  saved_schemes: [],
};

// Safe load from disk
const loadFromDisk = () => {
  for (const col of COLLECTIONS) {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        if (raw && raw.trim()) {
          store[col] = JSON.parse(raw);
          console.log(`[PersistentStore] Loaded ${store[col].length} ${col} from ${col}.json`);
        }
      } else {
        // Initialize empty file
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      }
    } catch (err) {
      console.warn(`[PersistentStore] Warning loading ${col}.json:`, err.message);
      store[col] = [];
    }
  }
};

// Safe atomic save to disk
const saveToDisk = (col) => {
  if (!COLLECTIONS.includes(col)) return;
  const filePath = path.join(DATA_DIR, `${col}.json`);
  const tmpPath = path.join(DATA_DIR, `${col}.json.tmp`);
  try {
    const data = JSON.stringify(store[col] || [], null, 2);
    fs.writeFileSync(tmpPath, data, 'utf8');
    try {
      fs.renameSync(tmpPath, filePath);
    } catch {
      // Windows file locking fallback
      fs.writeFileSync(filePath, data, 'utf8');
      if (fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    }
  } catch (err) {
    console.error(`[PersistentStore] Error persisting ${col}.json:`, err.message);
  }
};

// Initial load
loadFromDisk();

// Database CRUD Helpers
const find = (collection, filterFn) => {
  const items = store[collection] || [];
  if (typeof filterFn !== 'function') return [...items];
  return items.filter(filterFn);
};

const findOne = (collection, filterFn) => {
  const items = store[collection] || [];
  if (typeof filterFn !== 'function') return items[0] || null;
  return items.find(filterFn) || null;
};

const insert = (collection, doc) => {
  if (!store[collection]) store[collection] = [];
  const cleanDoc = doc.toObject ? doc.toObject() : { ...doc };
  if (!cleanDoc._id && !cleanDoc.id) {
    cleanDoc._id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
  if (!cleanDoc.createdAt) cleanDoc.createdAt = new Date().toISOString();
  if (!cleanDoc.updatedAt) cleanDoc.updatedAt = new Date().toISOString();

  // Prepend or append depending on collection (activities/grievances prefer newest first)
  if (['activities', 'grievances', 'documents'].includes(collection)) {
    store[collection].unshift(cleanDoc);
  } else {
    store[collection].push(cleanDoc);
  }
  saveToDisk(collection);
  return cleanDoc;
};

const update = (collection, filterFn, updateObj) => {
  if (!store[collection]) return null;
  const idx = store[collection].findIndex(filterFn);
  if (idx === -1) return null;

  const current = store[collection][idx];
  const updated = {
    ...current,
    ...updateObj,
    updatedAt: new Date().toISOString(),
  };

  if (updateObj.metadata && current.metadata) {
    updated.metadata = { ...current.metadata, ...updateObj.metadata };
  }

  store[collection][idx] = updated;
  saveToDisk(collection);
  return updated;
};

const remove = (collection, filterFn) => {
  if (!store[collection]) return false;
  const initialLength = store[collection].length;
  store[collection] = store[collection].filter((item) => !filterFn(item));
  const removed = store[collection].length < initialLength;
  if (removed) {
    saveToDisk(collection);
  }
  return removed;
};

const count = (collection, filterFn) => {
  if (!store[collection]) return 0;
  if (typeof filterFn !== 'function') return store[collection].length;
  return store[collection].filter(filterFn).length;
};

// Bidirectional synchronization with MongoDB Atlas
const syncWithMongoDB = async (mongooseInstance) => {
  if (!mongooseInstance || mongooseInstance.connection.readyState !== 1) {
    return;
  }

  try {
    console.log('[PersistentStore] Synchronizing persistent local store with MongoDB Atlas...');

    const User = require('../models/User');
    const Activity = require('../models/Activity');
    const Grievance = require('../models/Grievance');
    const Document = require('../models/Document');
    const ChatMessage = require('../models/ChatMessage');
    let SavedScheme = null;
    try {
      SavedScheme = require('../models/SavedScheme');
    } catch {}

    const modelMap = [
      { name: 'users', model: User },
      { name: 'activities', model: Activity },
      { name: 'grievances', model: Grievance },
      { name: 'documents', model: Document },
      { name: 'chat', model: ChatMessage },
    ];
    if (SavedScheme) {
      modelMap.push({ name: 'saved_schemes', model: SavedScheme });
    }

    for (const { name, model } of modelMap) {
      try {
        // 1. Fetch all items from Mongo
        const mongoItems = await model.find({}).lean();
        const mongoIds = new Set(mongoItems.map((item) => (item._id || item.id).toString()));

        // 2. Push any disk items not in Mongo to Mongo
        for (const diskItem of store[name]) {
          const diskId = (diskItem._id || diskItem.id || '').toString();
          if (diskId && !mongoIds.has(diskId)) {
            try {
              await model.create(diskItem);
              console.log(`[PersistentStore] Uploaded ${name} record ${diskId} to MongoDB`);
            } catch (err) {
              // Ignore duplicate key errors if already exists with another key
            }
          }
        }

        // 3. Merge Mongo items back into disk store if not already present
        const diskIds = new Set(store[name].map((item) => (item._id || item.id || '').toString()));
        let addedCount = 0;
        for (const mongoItem of mongoItems) {
          const mongoId = (mongoItem._id || mongoItem.id || '').toString();
          if (mongoId && !diskIds.has(mongoId)) {
            store[name].push(mongoItem);
            addedCount++;
          }
        }

        if (addedCount > 0) {
          saveToDisk(name);
          console.log(`[PersistentStore] Merged ${addedCount} records from MongoDB into local ${name}.json`);
        }
      } catch (colErr) {
        console.warn(`[PersistentStore] Sync note for ${name}:`, colErr.message);
      }
    }

    console.log('[PersistentStore] Bidirectional sync completed successfully.');
  } catch (error) {
    console.warn('[PersistentStore] MongoDB sync notice:', error.message);
  }
};

module.exports = {
  store,
  loadFromDisk,
  saveToDisk,
  find,
  findOne,
  insert,
  update,
  remove,
  count,
  syncWithMongoDB,
};

