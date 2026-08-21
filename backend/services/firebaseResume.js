import { getDatabase } from "../config/firebase.js";

/**
 * Firebase Resume adapter — replaces Mongoose Resume model
 */
export class FirebaseResume {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.fileName = data.fileName;
    this.mimeType = data.mimeType;
    this.sizeBytes = data.sizeBytes;
    this.storageKey = data.storageKey;
    this.extractedText = data.extractedText;
    this.isMaster = data.isMaster || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Save resume to Firebase
   */
  async save() {
    const db = getDatabase();
    const resumeId = this._id || db.ref("resumes").push().key;
    this._id = resumeId;
    this.updatedAt = new Date();

    const resumeData = {
      id: this._id,
      userId: this.userId,
      name: this.name,
      fileName: this.fileName,
      mimeType: this.mimeType,
      sizeBytes: this.sizeBytes,
      storageKey: this.storageKey,
      extractedText: this.extractedText,
      isMaster: this.isMaster,
      createdAt: this.createdAt.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`resumes/${resumeId}`).set(resumeData);
    return this;
  }

  /**
   * Find resume by ID
   */
  static async findById(id) {
    const db = getDatabase();
    const snap = await db.ref(`resumes/${id}`).get();
    if (!snap.exists()) return null;
    return new FirebaseResume(snap.val());
  }

  /**
   * Find one resume by query
   */
  static async findOne(query) {
    const db = getDatabase();

    if (query._id || query.id) {
      return this.findById(query._id || query.id);
    }

    if (query.userId) {
      const snap = await db
        .ref("resumes")
        .orderByChild("userId")
        .equalTo(query.userId)
        .limitToFirst(1)
        .get();

      if (!snap.exists()) return null;
      const resumes = snap.val();
      const resumeId = Object.keys(resumes)[0];
      return new FirebaseResume(resumes[resumeId]);
    }

    return null;
  }

  /**
   * Find many resumes (with optional query)
   */
  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("resumes");

    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(query.userId);
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const resumes = snap.val();
    return Object.values(resumes).map((data) => new FirebaseResume(data));
  }

  /**
   * Create and save
   */
  static async create(data) {
    const resume = new FirebaseResume(data);
    return resume.save();
  }

  /**
   * Update resume
   */
  async updateOne(updates) {
    const db = getDatabase();
    this.updatedAt = new Date();
    const resumeData = {
      ...this,
      ...updates,
      updatedAt: this.updatedAt.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`resumes/${this._id}`).update(resumeData);
    Object.assign(this, updates);
    return this;
  }

  /**
   * Delete resume
   */
  async deleteOne() {
    const db = getDatabase();
    await db.ref(`resumes/${this._id}`).remove();
  }
}

export default FirebaseResume;
