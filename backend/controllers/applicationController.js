import { FirebaseApplication } from "../services/firebaseModels.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/applications?status=&q= */
export const list = asyncHandler(async (req, res) => {
  const query = { userId: req.user._id || req.user.id };
  if (req.query.status) query.status = req.query.status;
  if (req.query.q) query.q = req.query.q;

  const docs = await FirebaseApplication.find(query);
  res.json(docs);
});

/** POST /api/applications */
export const create = asyncHandler(async (req, res) => {
  const doc = await FirebaseApplication.create({ ...req.body, userId: req.user._id || req.user.id });
  res.status(201).json(doc);
});

/** PUT /api/applications/:id — ownership enforced */
export const update = asyncHandler(async (req, res) => {
  const doc = await FirebaseApplication.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id || req.user.id },
    req.body
  );
  if (!doc) throw new AppError("Application not found.", 404);
  res.json(doc);
});

/** DELETE /api/applications/:id */
export const remove = asyncHandler(async (req, res) => {
  const doc = await FirebaseApplication.findOneAndDelete({ _id: req.params.id, userId: req.user._id || req.user.id });
  if (!doc) throw new AppError("Application not found.", 404);
  res.status(204).end();
});

export default {
  list,
  create,
  update,
  remove,
};
