const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export type ProductDetails = {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  materials: string[];
  style: string;
  targetAudience: string;
  tags: string[];
  keywords: string[];
  altText: string;
  careInstructions: string;
  category: string;
};

export type StoredImage = {
  id: string;
  projectId: string;
  angle: string | null;
  prompt: string | null;
  model: string | null;
  mediaType: string;
  sizeBytes: number;
  details: ProductDetails | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredProject = {
  id: string;
  name: string;
  product: string;
  colors: string[];
  platform: string;
  brief: Record<string, unknown>;
  imageCount: number;
  describedCount: number;
  coverImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithImages = StoredProject & { images: StoredImage[] };

export type NewImage = {
  base64: string;
  mediaType: string;
  angle?: string;
  prompt?: string;
  model?: string;
  details?: ProductDetails;
};

export type NewProject = {
  name: string;
  product: string;
  colors: string[];
  platform: string;
  brief: Record<string, unknown>;
  images: NewImage[];
};

export const imageUrl = (id: string) => `${BASE_URL}/api/images/${id}/file`;
export const imageDownloadUrl = (id: string) => `${imageUrl(id)}?download`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the storage server. Make sure the backend is running.",
    );
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.error || `Request failed (${response.status}).`);
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const api = {
  listProjects: () =>
    request<{ projects: StoredProject[] }>("/api/projects").then(
      (data) => data.projects,
    ),
  getProject: (id: string) =>
    request<{ project: ProjectWithImages }>(`/api/projects/${id}`).then(
      (data) => data.project,
    ),
  createProject: (input: NewProject) =>
    request<{ project: ProjectWithImages }>(
      "/api/projects",
      json("POST", input),
    ).then((data) => data.project),
  updateProject: (
    id: string,
    input: Partial<
      Pick<NewProject, "name" | "product" | "colors" | "platform" | "brief">
    >,
  ) =>
    request<{ project: StoredProject }>(
      `/api/projects/${id}`,
      json("PUT", input),
    ).then((data) => data.project),
  deleteProject: (id: string) =>
    request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  listImages: (projectId?: string) =>
    request<{ images: StoredImage[] }>(
      `/api/images${projectId ? `?projectId=${projectId}` : ""}`,
    ).then((data) => data.images),
  getImage: (id: string) =>
    request<{ image: StoredImage }>(`/api/images/${id}`).then(
      (data) => data.image,
    ),
  createImage: (projectId: string, input: NewImage) =>
    request<{ image: StoredImage }>(
      "/api/images",
      json("POST", { projectId, ...input }),
    ).then((data) => data.image),
  updateImage: (
    id: string,
    input: { angle?: string | null; details?: ProductDetails | null },
  ) =>
    request<{ image: StoredImage }>(
      `/api/images/${id}`,
      json("PUT", input),
    ).then((data) => data.image),
  deleteImage: (id: string) =>
    request<void>(`/api/images/${id}`, { method: "DELETE" }),
};
