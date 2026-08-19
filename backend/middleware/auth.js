import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Attaches req.user from a Bearer JWT. Sensitive fields stay excluded. */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError("Authentication required.", 401);

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new AppError("Session expired — log in again.", 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError("Account no longer exists.", 401);
  req.user = user;
  next();
});

/** Role/plan gate — e.g. requirePlan("starter", "pro") */
export const requirePlan =
  (...plans) =>
  (req, _res, next) => {
    if (!plans.includes(req.user.plan))
      return next(new AppError(`This feature needs the ${plans[0]} plan or above.`, 403));
    next();
  };
