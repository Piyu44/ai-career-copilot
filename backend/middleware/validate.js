/** Zod body validation — rejects malformed input before it reaches controllers. */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return next(Object.assign(new Error("Validation failed"), { name: "ValidationError", errors: Object.fromEntries(details.map((d) => [d, { message: d }])) }));
  }
  req.body = result.data;
  next();
};
