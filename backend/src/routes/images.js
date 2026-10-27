import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { asyncHandler, idSchema, notFound, parse } from "../http.js";

export const IMAGE_COLUMNS =
  "id, project_id, angle, prompt, model, media_type, size_bytes, details, created_at, updated_at";

export const serializeImage = (row) => ({
  id: row.id,
  projectId: row.project_id,
  angle: row.angle,
  prompt: row.prompt,
  model: row.model,
  mediaType: row.media_type,
  sizeBytes: row.size_bytes,
  details: row.details,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const imageInput = z.object({
  base64: z.string().min(1),
  mediaType: z.string().regex(/^image\/[\w.+-]+$/),
  angle: z.string().max(100).nullish(),
  prompt: z.string().max(5000).nullish(),
  model: z.string().max(200).nullish(),
  details: z.record(z.unknown()).nullish(),
});

export const insertImage = async (db, projectId, image) => {
  const data = Buffer.from(image.base64, "base64");
  const { rows } = await db.query(
    `INSERT INTO images (project_id, angle, prompt, model, media_type, data, size_bytes, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${IMAGE_COLUMNS}`,
    [
      projectId,
      image.angle ?? null,
      image.prompt ?? null,
      image.model ?? null,
      image.mediaType,
      data,
      data.length,
      image.details ?? null,
    ],
  );
  return serializeImage(rows[0]);
};

const createSchema = imageInput.extend({ projectId: idSchema });
const updateSchema = z
  .object({
    angle: z.string().max(100).nullable(),
    details: z.record(z.unknown()).nullable(),
  })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export const imagesRouter = Router();

imagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const projectId =
      req.query.projectId === undefined
        ? null
        : parse(idSchema, req.query.projectId);
    const { rows } = await pool.query(
      `SELECT ${IMAGE_COLUMNS} FROM images WHERE ($1::uuid IS NULL OR project_id = $1) ORDER BY created_at DESC, id`,
      [projectId],
    );
    res.json({ images: rows.map(serializeImage) });
  }),
);

imagesRouter.get(
  "/:id/file",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const { rows } = await pool.query(
      "SELECT media_type, data FROM images WHERE id = $1",
      [id],
    );
    if (!rows[0]) throw notFound("Image");
    res.set({
      "Content-Type": rows[0].media_type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    if (req.query.download !== undefined)
      res.attachment(
        `image-${id}.${rows[0].media_type.split("/")[1].replace("jpeg", "jpg")}`,
      );
    res.send(rows[0].data);
  }),
);

imagesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const { rows } = await pool.query(
      `SELECT ${IMAGE_COLUMNS} FROM images WHERE id = $1`,
      [id],
    );
    if (!rows[0]) throw notFound("Image");
    res.json({ image: serializeImage(rows[0]) });
  }),
);

imagesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { projectId, ...image } = parse(createSchema, req.body);
    const project = await pool.query("SELECT 1 FROM projects WHERE id = $1", [
      projectId,
    ]);
    if (!project.rowCount) throw notFound("Project");
    res.status(201).json({ image: await insertImage(pool, projectId, image) });
  }),
);

imagesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const body = parse(updateSchema, req.body);
    const { rows } = await pool.query(
      `UPDATE images SET
       angle = CASE WHEN $2 THEN $3 ELSE angle END,
       details = CASE WHEN $4 THEN $5::jsonb ELSE details END,
       updated_at = now()
     WHERE id = $1 RETURNING ${IMAGE_COLUMNS}`,
      [
        id,
        "angle" in body,
        body.angle ?? null,
        "details" in body,
        body.details === undefined || body.details === null
          ? null
          : JSON.stringify(body.details),
      ],
    );
    if (!rows[0]) throw notFound("Image");
    res.json({ image: serializeImage(rows[0]) });
  }),
);

imagesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const result = await pool.query("DELETE FROM images WHERE id = $1", [id]);
    if (!result.rowCount) throw notFound("Image");
    res.status(204).end();
  }),
);
