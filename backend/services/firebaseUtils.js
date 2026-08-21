import { getDatabase } from "../config/firebase.js";
import { FirebaseResume } from "./firebaseResume.js";
import { FirebaseUser } from "./firebaseUser.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";

/**
 * Firebase utility functions for common operations
 * Use these as templates for converting your controllers
 */

/**
 * Deduct credits from user
 * Used in many operations: resume analysis, cover letter generation, etc.
 */
export async function deductCredits(userId, creditsNeeded, action) {
  const user = await FirebaseUser.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (user.credits < creditsNeeded) {
    throw new AppError(`Insufficient credits. You need ${creditsNeeded}, you have ${user.credits}.`, 402);
  }

  user.credits -= creditsNeeded;
  await user.save();

  // Log usage
  const db = getDatabase();
  await db.ref(`usage/${db.ref("usage").push().key}`).set({
    userId,
    creditsUsed: creditsNeeded,
    action,
    createdAt: new Date().toISOString(),
  });

  return user;
}

/**
 * Get user's plan details
 */
export async function getUserPlan(userId) {
  const user = await FirebaseUser.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const planDetails = PLANS[user.plan];
  return {
    plan: user.plan,
    credits: user.credits,
    dailyLimit: planDetails?.dailyLimit || 0,
    monthlyLimit: planDetails?.monthlyLimit || 0,
  };
}

/**
 * Get user's resumes
 */
export async function getUserResumes(userId) {
  return FirebaseResume.find({ userId });
}

/**
 * Set user's master resume
 */
export async function setMasterResume(userId, resumeId) {
  // Unset previous master
  const resumes = await FirebaseResume.find({ userId });
  for (const resume of resumes) {
    if (resume.isMaster) {
      resume.isMaster = false;
      await resume.save();
    }
  }

  // Set new master
  const resume = await FirebaseResume.findById(resumeId);
  if (!resume || resume.userId !== userId) {
    throw new AppError("Resume not found or access denied.", 404);
  }

  resume.isMaster = true;
  await resume.save();
  return resume;
}

/**
 * Delete user's resume
 */
export async function deleteUserResume(userId, resumeId) {
  const resume = await FirebaseResume.findById(resumeId);
  if (!resume || resume.userId !== userId) {
    throw new AppError("Resume not found or access denied.", 404);
  }

  await resume.deleteOne();
}

/**
 * Track AI operation usage
 */
export async function logAIUsage(userId, action, creditsUsed, metadata = {}) {
  const db = getDatabase();
  const usageId = db.ref("usage").push().key;

  await db.ref(`usage/${usageId}`).set({
    userId,
    action,
    creditsUsed,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get user's total usage for a period
 * Note: This scans all usage records — consider Cloud Functions for better performance
 */
export async function getUserUsageStats(userId, days = 30) {
  const db = getDatabase();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const snap = await db.ref("usage").orderByChild("userId").equalTo(userId).get();

  if (!snap.exists()) {
    return { totalCreditsUsed: 0, actions: {}, period: `${days}d` };
  }

  const usage = snap.val();
  const recentUsage = Object.values(usage).filter((u) => u.timestamp >= cutoffDate);

  const stats = {
    totalCreditsUsed: recentUsage.reduce((sum, u) => sum + (u.creditsUsed || 0), 0),
    actions: {},
    period: `${days}d`,
  };

  for (const entry of recentUsage) {
    stats.actions[entry.action] = (stats.actions[entry.action] || 0) + 1;
  }

  return stats;
}

/**
 * Upgrade user plan
 */
export async function upgradeUserPlan(userId, newPlan) {
  const user = await FirebaseUser.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!PLANS[newPlan]) {
    throw new AppError("Invalid plan.", 400);
  }

  user.plan = newPlan;
  user.credits = PLANS[newPlan].creditsOnSignup;
  await user.save();

  // Log subscription update
  const db = getDatabase();
  const subId = db.ref("subscriptions").push().key;
  await db.ref(`subscriptions/${subId}`).set({
    userId,
    plan: newPlan,
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return user;
}

/**
 * Search resumes by text
 * Note: Firebase doesn't have full-text search — this does in-memory filtering
 * For production, use Cloud Functions or Firestore
 */
export async function searchResumesText(userId, query) {
  const resumes = await FirebaseResume.find({ userId });
  const lowerQuery = query.toLowerCase();

  return resumes.filter(
    (r) =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.extractedText?.toLowerCase().includes(lowerQuery) ||
      r.fileName?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Batch create resumes (useful for bulk operations)
 */
export async function createResumeBatch(userId, resumes) {
  const db = getDatabase();
  const updates = {};

  for (const resumeData of resumes) {
    const resumeId = db.ref("resumes").push().key;
    const resume = new FirebaseResume({
      ...resumeData,
      userId,
      _id: resumeId,
    });

    updates[`resumes/${resumeId}`] = {
      id: resume._id,
      userId: resume.userId,
      name: resume.name,
      fileName: resume.fileName,
      mimeType: resume.mimeType,
      sizeBytes: resume.sizeBytes,
      storageKey: resume.storageKey,
      extractedText: resume.extractedText,
      isMaster: resume.isMaster,
      createdAt: resume.createdAt.toISOString ? resume.createdAt.toISOString() : resume.createdAt,
      updatedAt: resume.updatedAt.toISOString ? resume.updatedAt.toISOString() : resume.updatedAt,
    };
  }

  await db.ref().update(updates);
}

export default {
  deductCredits,
  getUserPlan,
  getUserResumes,
  setMasterResume,
  deleteUserResume,
  logAIUsage,
  getUserUsageStats,
  upgradeUserPlan,
  searchResumesText,
  createResumeBatch,
};
