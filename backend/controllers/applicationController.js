import Application from "../models/Application.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/applications?status=&q= */
export const list = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.$or = [
    { company: { $regex: req.query.q, $options: "i" } },
    { role: { $regex: req.query.q, $options: "i" } },
  ];
  res.json(await Application.find(filter).sort("-dateApplied").lean());
});

/** POST /api/applications */
export const create = asyncHandler(async (req, res) => {
  const doc = await Application.create({ ...req.body, userId: req.user._id });
  res.status(201).json(doc);
});

/** PUT /api/applications/:id — ownership enforced */
export const update = asyncHandler(async (req, res) => {
  const doc = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!doc) throw new AppError("Application not found.", 404);
  res.json(doc);
});

/** DELETE /api/applications/:id */
export const remove = asyncHandler(async (req, res) => {
  const doc = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!doc) throw new AppError("Application not found.", 404);
  res.status(204).end();
});
