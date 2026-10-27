import { z } from "zod";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new HttpError(
      400,
      result.error.issues
        .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
        .join("; "),
    );
  return result.data;
};

export const idSchema = z.string().uuid();

export const notFound = (what) => new HttpError(404, `${what} not found.`);

export function errorHandler(error, _req, res, _next) {
  if (error.type === "entity.too.large")
    return res.status(413).json({ error: "Payload too large." });
  if (error instanceof SyntaxError && "body" in error)
    return res.status(400).json({ error: "Invalid JSON." });
  if (error instanceof HttpError)
    return res.status(error.status).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
}
