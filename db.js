// db.js - IndexedDB Manager for SpendTrail v3.7

class SpendTrailDB {
  constructor() {
    this.db = null;
    this.DB_NAME = 'SpendTrailDB';
    this.DB_VERSION = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Database failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🔧 Setting up IndexedDB structure...');

        if (!db.objectStoreNames.contains('income')) {
          const incomeStore = db.createObjectStore('income', {
            keyPath: 'id',
            autoIncrement: true
          });
          incomeStore.createIndex('date', 'date', { unique: false });
          incomeStore.createIndex('category', 'category', { unique: false });
          incomeStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', {
            keyPath: 'id',
            autoIncrement: true
          });
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
          expenseStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('✅ IndexedDB structure created');
      };
    });
  }

  async getData() {
    try {
      const income = await this.getAll('income');
      const expenses = await this.getAll('expenses');
      
      const cleanIncome = income.map(({ id, ...rest }) => rest);
      const cleanExpenses = expenses.map(({ id, ...rest }) => rest);
      
      return { 
        income: cleanIncome, 
        expenses: cleanExpenses,
        _rawIncome: income,
        _rawExpenses: expenses
      };
    } catch (error) {
      console.error('Error getting data:', error);
      return { income: [], expenses: [], _rawIncome: [], _rawExpenses: [] };
    }
  }

  async setData(data) {
    try {
      await this.clear('income');
      await this.clear('expenses');

      if (data.income && data.income.length > 0) {
        for (const item of data.income) {
          await this.add('income', item);
        }
      }

      if (data.expenses && data.expenses.length > 0) {
        for (const item of data.expenses) {
          await this.add('expenses', item);
        }
      }

      return true;
    } catch (error) {
      console.error('Error setting data:', error);
      return false;
    }
  }

  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const dataToAdd = { ...data };
      delete dataToAdd.id;
      
      const request = store.add(dataToAdd);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateByIndex(storeName, index, newData) {
    try {
      const all = await this.getAll(storeName);
      if (index >= 0 && index < all.length) {
        const entry = all[index];
        const updatedEntry = { ...entry, ...newData };
        return await this.update(storeName, entry.id, updatedEntry);
      }
      return false;
    } catch (error) {
      console.error('Error updating by index:', error);
      return false;
    }
  }

  async deleteByIndex(storeName, index) {
    try {
      const all = await this.getAll(storeName);
      if (index >= 0 && index < all.length) {
        const entry = all[index];
        return await this.delete(storeName, entry.id);
      }
      return false;
    } catch (error) {
      console.error('Error deleting by index:', error);
      return false;
    }
  }

  async update(storeName, id, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const updatedData = { ...data, id };
      const request = store.put(updatedData);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usageMB: (estimate.usage / (1024 * 1024)).toFixed(2),
        quotaMB: (estimate.quota / (1024 * 1024)).toFixed(2),
        percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      };
    }
    return null;
  }
}

const dbInstance = new SpendTrailDB();
