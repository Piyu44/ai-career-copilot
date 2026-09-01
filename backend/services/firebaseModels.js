import { getDatabase } from "../config/firebase.js";

/**
 * Firebase Subscription adapter
 */
export class FirebaseSubscription {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.plan = data.plan || "free";
    this.billingCycle = data.billingCycle || "monthly";
    this.status = data.status || "active";
    this.gateway = data.gateway || "razorpay";
    this.gatewayOrderId = data.gatewayOrderId || null;
    this.gatewaySubscriptionId = data.gatewaySubscriptionId || null;
    this.currentPeriodStart = data.currentPeriodStart || new Date();
    this.renewalDate = data.renewalDate || null;
    this.creditsGrantedThisPeriod = data.creditsGrantedThisPeriod || 0;
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
      billingCycle: this.billingCycle,
      status: this.status,
      gateway: this.gateway,
      gatewayOrderId: this.gatewayOrderId,
      gatewaySubscriptionId: this.gatewaySubscriptionId,
      currentPeriodStart: this.currentPeriodStart?.toISOString ? this.currentPeriodStart.toISOString() : this.currentPeriodStart,
      renewalDate: this.renewalDate?.toISOString ? this.renewalDate.toISOString() : this.renewalDate,
      creditsGrantedThisPeriod: this.creditsGrantedThisPeriod,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`subscriptions/${subscriptionId}`).set(subData);
    return this;
  }

  static async findOne(query = {}) {
    const db = getDatabase();

    if (query._id || query.id) {
      const snap = await db.ref(`subscriptions/${query._id || query.id}`).get();
      return snap.exists() ? new FirebaseSubscription(snap.val()) : null;
    }

    if (query.userId) {
      const snap = await db
        .ref("subscriptions")
        .orderByChild("userId")
        .equalTo(String(query.userId))
        .limitToFirst(1)
        .get();

      if (!snap.exists()) return null;
      const subs = snap.val();
      const subId = Object.keys(subs)[0];
      return new FirebaseSubscription(subs[subId]);
    }

    return null;
  }

  static async findOneAndUpdate(query, updateData, options = {}) {
    let sub = await this.findOne(query);
    if (!sub && options.upsert) {
      sub = new FirebaseSubscription({ ...query, ...updateData });
      return sub.save();
    }
    if (sub) {
      Object.assign(sub, updateData);
      return sub.save();
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
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
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
    this.company = data.company || "";
    this.role = data.role || "";
    this.status = data.status || "applied";
    this.location = data.location || "";
    this.salary = data.salary || "";
    this.url = data.url || "";
    this.notes = data.notes || "";
    this.dateApplied = data.dateApplied || new Date();
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
      company: this.company,
      role: this.role,
      status: this.status,
      location: this.location,
      salary: this.salary,
      url: this.url,
      notes: this.notes,
      dateApplied: this.dateApplied?.toISOString ? this.dateApplied.toISOString() : this.dateApplied,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`applications/${appId}`).set(appData);
    return this;
  }

  static async findOne(query) {
    const db = getDatabase();
    if (query._id || query.id) {
      const snap = await db.ref(`applications/${query._id || query.id}`).get();
      if (!snap.exists()) return null;
      const app = new FirebaseApplication(snap.val());
      if (query.userId && String(app.userId) !== String(query.userId)) return null;
      return app;
    }
    return null;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("applications");

    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(String(query.userId));
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const apps = snap.val();
    let results = Object.values(apps).map((data) => new FirebaseApplication(data));

    if (query.status) {
      results = results.filter((a) => a.status === query.status);
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      results = results.filter(
        (a) => a.company?.toLowerCase().includes(q) || a.role?.toLowerCase().includes(q)
      );
    }

    return results.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
  }

  static async findOneAndUpdate(query, updateData, options = {}) {
    const app = await this.findOne(query);
    if (!app) return null;
    Object.assign(app, updateData);
    return app.save();
  }

  static async findOneAndDelete(query) {
    const app = await this.findOne(query);
    if (!app) return null;
    await app.deleteOne();
    return app;
  }

  static async create(data) {
    const app = new FirebaseApplication(data);
    return app.save();
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
    this.credits = data.credits || 0;
    this.creditsUsed = data.creditsUsed || Math.abs(this.credits);
    this.balanceAfter = data.balanceAfter;
    this.action = data.action;
    this.meta = data.meta || {};
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const usageId = this._id || db.ref("usage").push().key;
    this._id = usageId;

    const usageData = {
      id: this._id,
      userId: this.userId,
      credits: this.credits,
      creditsUsed: this.creditsUsed,
      balanceAfter: this.balanceAfter,
      action: this.action,
      meta: this.meta,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
    };

    await db.ref(`usage/${usageId}`).set(usageData);
    return this;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("usage");

    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(String(query.userId));
    }

    const snap = await ref.get();
    if (!snap.exists()) return [];

    const usage = snap.val();
    const results = Object.values(usage).map((data) => new FirebaseUsage(data));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async create(data) {
    const usage = new FirebaseUsage(data);
    return usage.save();
  }
}

/**
 * Firebase JobAnalysis adapter
 */
export class FirebaseJobAnalysis {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.resumeId = data.resumeId;
    this.jobTitle = data.jobTitle;
    this.company = data.company;
    this.location = data.location;
    this.jobDescription = data.jobDescription;
    this.matchScore = data.matchScore || 0;
    this.matchStrengths = data.matchStrengths || [];
    this.missingSkills = data.missingSkills || [];
    this.tailoredSuggestions = data.tailoredSuggestions || [];
    this.keywords = data.keywords || [];
    this.provider = data.provider || "mock";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const id = this._id || db.ref("jobAnalyses").push().key;
    this._id = id;
    this.updatedAt = new Date();

    const data = {
      id: this._id,
      userId: this.userId,
      resumeId: this.resumeId || null,
      jobTitle: this.jobTitle,
      company: this.company,
      location: this.location || "",
      jobDescription: this.jobDescription,
      matchScore: this.matchScore,
      matchStrengths: this.matchStrengths,
      missingSkills: this.missingSkills,
      tailoredSuggestions: this.tailoredSuggestions,
      keywords: this.keywords,
      provider: this.provider,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };

    await db.ref(`jobAnalyses/${id}`).set(data);
    return this;
  }

  static async findOne(query) {
    const db = getDatabase();
    if (query._id || query.id) {
      const snap = await db.ref(`jobAnalyses/${query._id || query.id}`).get();
      if (!snap.exists()) return null;
      const item = new FirebaseJobAnalysis(snap.val());
      if (query.userId && String(item.userId) !== String(query.userId)) return null;
      return item;
    }
    return null;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("jobAnalyses");
    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(String(query.userId));
    }
    const snap = await ref.get();
    if (!snap.exists()) return [];
    const items = snap.val();
    return Object.values(items)
      .map((data) => new FirebaseJobAnalysis(data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async findOneAndDelete(query) {
    const item = await this.findOne(query);
    if (!item) return null;
    const db = getDatabase();
    await db.ref(`jobAnalyses/${item._id}`).remove();
    return item;
  }

  static async create(data) {
    const item = new FirebaseJobAnalysis(data);
    return item.save();
  }
}

/**
 * Firebase GeneratedResume adapter
 */
export class FirebaseGeneratedResume {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.improvedText = data.improvedText || "";
    this.summary = data.summary || "";
    this.changes = data.changes || [];
    this.variant = data.variant || 0;
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const id = this._id || db.ref("generatedResumes").push().key;
    this._id = id;
    const data = {
      id: this._id,
      userId: this.userId,
      improvedText: this.improvedText,
      summary: this.summary,
      changes: this.changes,
      variant: this.variant,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
    };
    await db.ref(`generatedResumes/${id}`).set(data);
    return this;
  }

  static async create(data) {
    const item = new FirebaseGeneratedResume(data);
    return item.save();
  }
}

/**
 * Firebase Interview adapter
 */
export class FirebaseInterview {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.role = data.role;
    this.type = data.type || "technical";
    this.difficulty = data.difficulty || "medium";
    this.questions = data.questions || [];
    this.answers = data.answers || [];
    this.currentQuestionIndex = data.currentQuestionIndex || 0;
    this.status = data.status || "in-progress";
    this.averageScore = data.averageScore || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const id = this._id || db.ref("interviews").push().key;
    this._id = id;
    this.updatedAt = new Date();

    const data = {
      id: this._id,
      userId: this.userId,
      role: this.role,
      type: this.type,
      difficulty: this.difficulty,
      questions: this.questions,
      answers: this.answers,
      currentQuestionIndex: this.currentQuestionIndex,
      status: this.status,
      averageScore: this.averageScore,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`interviews/${id}`).set(data);
    return this;
  }

  static async findOne(query) {
    const db = getDatabase();
    if (query._id || query.id) {
      const snap = await db.ref(`interviews/${query._id || query.id}`).get();
      if (!snap.exists()) return null;
      const item = new FirebaseInterview(snap.val());
      if (query.userId && String(item.userId) !== String(query.userId)) return null;
      return item;
    }
    return null;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("interviews");
    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(String(query.userId));
    }
    const snap = await ref.get();
    if (!snap.exists()) return [];
    const items = snap.val();
    return Object.values(items)
      .map((data) => new FirebaseInterview(data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async create(data) {
    const item = new FirebaseInterview(data);
    return item.save();
  }
}

/**
 * Firebase CoverLetter adapter
 */
export class FirebaseCoverLetter {
  constructor(data = {}) {
    this._id = data._id || data.id;
    this.userId = data.userId;
    this.company = data.company;
    this.position = data.position;
    this.tone = data.tone || "professional";
    this.jobDescription = data.jobDescription || "";
    this.letter = data.letter || "";
    this.highlights = data.highlights || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = getDatabase();
    const id = this._id || db.ref("coverLetters").push().key;
    this._id = id;
    this.updatedAt = new Date();

    const data = {
      id: this._id,
      userId: this.userId,
      company: this.company,
      position: this.position,
      tone: this.tone,
      jobDescription: this.jobDescription,
      letter: this.letter,
      highlights: this.highlights,
      createdAt: this.createdAt?.toISOString ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt?.toISOString ? this.updatedAt.toISOString() : this.updatedAt,
    };
    await db.ref(`coverLetters/${id}`).set(data);
    return this;
  }

  static async find(query = {}) {
    const db = getDatabase();
    let ref = db.ref("coverLetters");
    if (query.userId) {
      ref = ref.orderByChild("userId").equalTo(String(query.userId));
    }
    const snap = await ref.get();
    if (!snap.exists()) return [];
    const items = snap.val();
    return Object.values(items)
      .map((data) => new FirebaseCoverLetter(data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async create(data) {
    const item = new FirebaseCoverLetter(data);
    return item.save();
  }
}

export default {
  FirebaseSubscription,
  FirebaseApplication,
  FirebaseUsage,
  FirebaseJobAnalysis,
  FirebaseGeneratedResume,
  FirebaseInterview,
  FirebaseCoverLetter,
};
