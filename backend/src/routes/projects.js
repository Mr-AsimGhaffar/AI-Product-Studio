import { Router } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../db.js";
import { asyncHandler, idSchema, notFound, parse } from "../http.js";
import {
  IMAGE_COLUMNS,
  imageInput,
  insertImage,
  serializeImage,
} from "./images.js";

const serializeProject = (row) => ({
  id: row.id,
  name: row.name,
  product: row.product,
  colors: row.colors,
  platform: row.platform,
  brief: row.brief,
  imageCount:
    row.image_count === undefined ? undefined : Number(row.image_count),
  describedCount:
    row.described_count === undefined ? undefined : Number(row.described_count),
  coverImageId: row.cover_image_id ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const projectFields = {
  name: z.string().trim().min(1).max(200),
  product: z.string().trim().min(1).max(200),
  colors: z.array(z.string().max(50)).max(20),
  platform: z.string().trim().min(1).max(50),
  brief: z.record(z.unknown()),
};

const createSchema = z.object({
  ...projectFields,
  colors: projectFields.colors.default([]),
  platform: projectFields.platform.default("Amazon"),
  brief: projectFields.brief.default({}),
  images: z.array(imageInput).max(24).default([]),
});
const updateSchema = z
  .object(projectFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

const LIST_SQL = `
  SELECT p.*, COUNT(i.id) AS image_count,
         COUNT(i.id) FILTER (WHERE i.details IS NOT NULL) AS described_count,
         (SELECT id FROM images WHERE project_id = p.id ORDER BY created_at, id LIMIT 1) AS cover_image_id
  FROM projects p LEFT JOIN images i ON i.project_id = p.id`;

export const projectsRouter = Router();

projectsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      `${LIST_SQL} GROUP BY p.id ORDER BY p.created_at DESC`,
    );
    res.json({ projects: rows.map(serializeProject) });
  }),
);

projectsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const { rows } = await pool.query(
      `${LIST_SQL} WHERE p.id = $1 GROUP BY p.id`,
      [id],
    );
    if (!rows[0]) throw notFound("Project");
    const images = await pool.query(
      `SELECT ${IMAGE_COLUMNS} FROM images WHERE project_id = $1 ORDER BY created_at, id`,
      [id],
    );
    res.json({
      project: {
        ...serializeProject(rows[0]),
        images: images.rows.map(serializeImage),
      },
    });
  }),
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { images, ...fields } = parse(createSchema, req.body);
    const project = await withTransaction(async (db) => {
      const { rows } = await db.query(
        "INSERT INTO projects (name, product, colors, platform, brief) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          fields.name,
          fields.product,
          fields.colors,
          fields.platform,
          JSON.stringify(fields.brief),
        ],
      );
      const saved = [];
      for (const image of images)
        saved.push(await insertImage(db, rows[0].id, image));
      return {
        ...serializeProject(rows[0]),
        imageCount: saved.length,
        describedCount: saved.filter((image) => image.details).length,
        coverImageId: saved[0]?.id ?? null,
        images: saved,
      };
    });
    res.status(201).json({ project });
  }),
);

projectsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const body = parse(updateSchema, req.body);
    const has = (key) => key in body;
    const { rows } = await pool.query(
      `UPDATE projects SET
       name = CASE WHEN $2 THEN $3 ELSE name END,
       product = CASE WHEN $4 THEN $5 ELSE product END,
       colors = CASE WHEN $6 THEN $7::text[] ELSE colors END,
       platform = CASE WHEN $8 THEN $9 ELSE platform END,
       brief = CASE WHEN $10 THEN $11::jsonb ELSE brief END,
       updated_at = now()
     WHERE id = $1 RETURNING *`,
      [
        id,
        has("name"),
        body.name ?? null,
        has("product"),
        body.product ?? null,
        has("colors"),
        body.colors ?? null,
        has("platform"),
        body.platform ?? null,
        has("brief"),
        body.brief ? JSON.stringify(body.brief) : null,
      ],
    );
    if (!rows[0]) throw notFound("Project");
    res.json({ project: serializeProject(rows[0]) });
  }),
);

projectsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    if (!result.rowCount) throw notFound("Project");
    res.status(204).end();
  }),
);
