import { getDatabase } from "../config/firebase.js";

/**
 * Firebase Subscription adapter
 */
export class FirebaseSubscription {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.plan = data.plan || "free";
    this.renewalDate = data.renewalDate;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const subscriptionId = this._id || db.ref("subscriptions").push().key;
    this._id = subscriptionId;
    this.updatedAt = new Date();

    const subData = {
      id: this._id,
      userId: this.userId,
      plan: this.plan,
      renewalDate: this.renewalDate || null,
      createdAt: this.createdAt.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`subscriptions/${subscriptionId}`).set(subData);
    return this;
  }

  static async findOne(query) {
    const db = getDatabase();

    if (query._id || query.id) {
      const snap = await db.ref(`subscriptions/${query._id || query.id}`).get();
      return snap.exists() ? new FirebaseSubscription(snap.val()) : null;
    }

    if (query.userId) {
      const snap = await db
        .ref("subscriptions")
        .orderByChild("userId")
        .equalTo(query.userId)
        .limitToFirst(1)
        .get();

      if (!snap.exists()) return null;
      const subs = snap.val();
      const subId = Object.keys(subs)[0];
      return new FirebaseSubscription(subs[subId]);
    }

    return null;
  }

  static async create(data) {
    const sub = new FirebaseSubscription(data);
    return sub.save();
  }

  async updateOne(updates) {
    const db = getDatabase();
    this.updatedAt = new Date();
    const subData = {
      ...this,
      ...updates,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`subscriptions/${this._id}`).update(subData);
    Object.assign(this, updates);
    return this;
  }

  async deleteOne() {
    const db = getDatabase();
    await db.ref(`subscriptions/${this._id}`).remove();
  }
}

/**
 * Firebase Application adapter
 */
export class FirebaseApplication {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.jobId = data.jobId;
    this.status = data.status || "pending";
    this.appliedAt = data.appliedAt || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const appId = this._id || db.ref("applications").push().key;
    this._id = appId;
    this.updatedAt = new Date();

    const appData = {
      id: this._id,
      userId: this.userId,
      jobId: this.jobId,
      status: this.status,
      appliedAt: this.appliedAt.toISOString ? this.appliedAt.toISOString() : this.appliedAt,
      createdAt: this.createdAt.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`applications/${appId}`).set(appData);
    return this;
  }

  static async findOne(query) {
    const db = getDatabase();

    if (query._id || query.id) {
      const snap = await db.ref(`applications/${query._id || query.id}`).get();
      return snap.exists() ? new FirebaseApplication(snap.val()) : null;
    }

    return null;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("applications");

    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(query.userId);
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const apps = snap.val();
    return Object.values(apps).map((data) => new FirebaseApplication(data));
  }

  static async create(data) {
    const app = new FirebaseApplication(data);
    return app.save();
  }

  async updateOne(updates) {
    const db = getDatabase();
    this.updatedAt = new Date();
    const appData = {
      ...this,
      ...updates,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`applications/${this._id}`).update(appData);
    Object.assign(this, updates);
    return this;
  }

  async deleteOne() {
    const db = getDatabase();
    await db.ref(`applications/${this._id}`).remove();
  }
}

/**
 * Firebase Usage adapter
 */
export class FirebaseUsage {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.creditsUsed = data.creditsUsed || 0;
    this.action = data.action;
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const usageId = this._id || db.ref("usage").push().key;
    this._id = usageId;

    const usageData = {
      id: this._id,
      userId: this.userId,
      creditsUsed: this.creditsUsed,
      action: this.action,
      createdAt: this.createdAt.toISOString ? this.createdAt.toISOString() : this.createdAt,
    };

    await db.ref(`usage/${usageId}`).set(usageData);
    return this;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("usage");

    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(query.userId);
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const usage = snap.val();
    return Object.values(usage).map((data) => new FirebaseUsage(data));
  }

  static async create(data) {
    const usage = new FirebaseUsage(data);
    return usage.save();
  }
}

export default {
  FirebaseSubscription,
  FirebaseApplication,
  FirebaseUsage,
};
