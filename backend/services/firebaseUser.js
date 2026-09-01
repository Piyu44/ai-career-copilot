import { getDatabase } from "../config/firebase.js";
import bcrypt from "bcryptjs";

/**
 * Firebase User adapter — replaces Mongoose User model
 * Methods mimic the standard database interface
 */
export class FirebaseUser {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.name = data.name || "";
    this.email = (data.email || "").toLowerCase();
    this.passwordHash = data.passwordHash || "";
    this.plan = data.plan || "free";
    this.credits = data.credits !== undefined ? data.credits : 10;
    this.resetToken = data.resetToken || null;
    this.resetExpires = data.resetExpires || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Hash password before saving
   */
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith("$2")) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    }
  }

  /**
   * Compare password
   */
  async comparePassword(candidate) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidate, this.passwordHash);
  }

  /**
   * Get safe JSON (no hashes/tokens)
   */
  toSafeJSON() {
    return {
      id: this._id,
      _id: this._id,
      name: this.name,
      email: this.email,
      plan: this.plan,
      credits: this.credits,
      createdAt: this.createdAt,
    };
  }

  /**
   * Save user to Firebase
   */
  async save() {
    const db = getDatabase();
    const userId = this._id || db.ref("users").push().key;
    this._id = userId;
    this.updatedAt = new Date();

    await this.hashPassword();

    const userData = {
      id: this._id,
      _id: this._id,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      plan: this.plan,
      credits: this.credits,
      resetToken: this.resetToken || null,
      resetExpires: this.resetExpires?.toISOString ? this.resetExpires.toISOString() : this.resetExpires,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`users/${userId}`).set(userData);
    return this;
  }

  /**
   * Static method: find by ID
   */
  static async findById(id) {
    if (!id) return null;
    const db = getDatabase();
    const snap = await db.ref(`users/${id}`).get();
    if (!snap.exists()) return null;
    return new FirebaseUser(snap.val());
  }

  /**
   * Static method: find by query
   */
  static async findOne(query = {}) {
    const db = getDatabase();

    if (query._id || query.id) {
      return this.findById(query._id || query.id);
    }

    if (query.email) {
      const snap = await db
        .ref("users")
        .orderByChild("email")
        .equalTo(query.email.toLowerCase())
        .limitToFirst(1)
        .get();

      if (!snap.exists()) return null;
      const users = snap.val();
      const userId = Object.keys(users)[0];
      return new FirebaseUser(users[userId]);
    }

    if (query.resetToken) {
      const snap = await db
        .ref("users")
        .orderByChild("resetToken")
        .equalTo(query.resetToken)
        .limitToFirst(1)
        .get();

      if (!snap.exists()) return null;
      const users = snap.val();
      const userId = Object.keys(users)[0];
      return new FirebaseUser(users[userId]);
    }

    return null;
  }

  /**
   * Static method: find multiple users
   */
  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("users");

    if (query.plan) {
      ref = ref.orderByChild("plan").equalTo(query.plan);
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const users = snap.val();
    return Object.values(users).map((data) => new FirebaseUser(data));
  }

  /**
   * Static method: find by ID and update
   */
  static async findByIdAndUpdate(id, updates = {}, options = {}) {
    const user = await this.findById(id);
    if (!user) return null;

    if (updates.$inc) {
      for (const [k, v] of Object.entries(updates.$inc)) {
        user[k] = (user[k] || 0) + v;
      }
    }
    const cleanUpdates = { ...updates };
    delete cleanUpdates.$inc;

    Object.assign(user, cleanUpdates);
    return user.save();
  }

  /**
   * Static method: find one and update
   */
  static async findOneAndUpdate(query, updates = {}, options = {}) {
    const user = await this.findOne(query);
    if (!user) return null;

    if (updates.$inc) {
      for (const [k, v] of Object.entries(updates.$inc)) {
        user[k] = (user[k] || 0) + v;
      }
    }
    const cleanUpdates = { ...updates };
    delete cleanUpdates.$inc;

    Object.assign(user, cleanUpdates);
    return user.save();
  }

  /**
   * Static method: create and save
   */
  static async create(data) {
    const user = new FirebaseUser(data);
    return user.save();
  }

  /**
   * Update user
   */
  async updateOne(updates) {
    const db = getDatabase();
    this.updatedAt = new Date();
    const userData = {
      ...this,
      ...updates,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`users/${this._id}`).update(userData);
    Object.assign(this, updates);
    return this;
  }

  /**
   * Delete user
   */
  async deleteOne() {
    const db = getDatabase();
    await db.ref(`users/${this._id}`).remove();
  }

  select(fields) {
    return this;
  }
}

export default FirebaseUser;
