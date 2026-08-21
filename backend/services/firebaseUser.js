import { getDatabase, getAuth } from "../config/firebase.js";
import bcrypt from "bcryptjs";

/**
 * Firebase User adapter — replaces Mongoose User model
 * Methods mimic the Mongoose interface where practical
 */
export class FirebaseUser {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.name = data.name;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.plan = data.plan || "free";
    this.credits = data.credits || 0;
    this.resetToken = data.resetToken;
    this.resetExpires = data.resetExpires;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Hash password before saving (mimics Mongoose pre-hook)
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
    return bcrypt.compare(candidate, this.passwordHash);
  }

  /**
   * Get safe JSON (no hashes/tokens)
   */
  toSafeJSON() {
    return {
      id: this._id,
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
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      plan: this.plan,
      credits: this.credits,
      resetToken: this.resetToken || null,
      resetExpires: this.resetExpires || null,
      createdAt: this.createdAt.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`users/${userId}`).set(userData);
    return this;
  }

  /**
   * Static method: find by ID
   */
  static async findById(id) {
    const db = getDatabase();
    const snap = await db.ref(`users/${id}`).get();
    if (!snap.exists()) return null;
    return new FirebaseUser(snap.val());
  }

  /**
   * Static method: find by email (requires reading all users — use sparingly)
   */
  static async findOne(query) {
    const db = getDatabase();

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

    if (query._id || query.id) {
      return this.findById(query._id || query.id);
    }

    return null;
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
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`users/${this._id}`).update(userData);
    return this;
  }

  /**
   * Delete user
   */
  async deleteOne() {
    const db = getDatabase();
    await db.ref(`users/${this._id}`).remove();
  }

  /**
   * Check if user already has selected password field
   */
  select(fields) {
    // Firebase doesn't have field selection like Mongoose
    // This is a no-op method for compatibility
    return this;
  }
}

export default FirebaseUser;
