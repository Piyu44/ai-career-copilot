import fs from "fs/promises";
import path from "path";

/**
 * Storage abstraction for resume uploads.
 * Controllers use only this interface — swap `local` for an S3/Cloudinary
 * adapter later without touching any other file.
 *
 *   save(file)  → { key, url }
 *   read(key)   → Buffer
 *   remove(key)
 */

const localDriver = {
  async save(file, key) {
    const dir = process.env.UPLOAD_DIR || "uploads";
    await fs.mkdir(dir, { recursive: true });
    const dest = path.join(dir, key);
    await fs.copyFile(file.path, dest);
    await fs.unlink(file.path).catch(() => {});
    return { key, url: `/uploads/${key}` };
  },
  read: (key) => fs.readFile(path.join(process.env.UPLOAD_DIR || "uploads", key)),
  remove: (key) => fs.unlink(path.join(process.env.UPLOAD_DIR || "uploads", key)).catch(() => {}),
};

/* Reference shape for the future cloud driver:
const s3Driver = {
  async save(file, key) {
    await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: fs.createReadStream(file.path) }));
    return { key, url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}` };
  },
  read: (key) => s3.send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })),
  remove: (key) => s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })),
};
*/

export const storageService =
  process.env.STORAGE_DRIVER === "s3" ? localDriver /* swap to s3Driver when configured */ : localDriver;
