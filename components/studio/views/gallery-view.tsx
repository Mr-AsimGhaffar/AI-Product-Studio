"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  ImagePlus,
  Search,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  imageDownloadUrl,
  imageUrl,
  type StoredImage,
  type StoredProject,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../shared/confirm-dialog";
import { EmptyState } from "../shared/empty-state";
import { ErrorAlert } from "../shared/error-alert";
import { PageHeading } from "../shared/page-heading";
import { ViewSkeleton } from "../shared/view-skeleton";

type GalleryViewProps = {
  projects: StoredProject[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  images: StoredImage[];
  product: string;
  loading: boolean;
  error: string;
  onOpenImage: (index: number) => void;
  onCreate: () => void;
  onDeleteImage: (id: string) => Promise<boolean>;
  onDeleteProject: () => Promise<boolean>;
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

type Deletion =
  | { kind: "project"; name: string }
  | { kind: "image"; id: string; label: string };

export default function GalleryView({
  projects,
  activeProjectId,
  onSelectProject,
  images,
  product,
  loading,
  error,
  onOpenImage,
  onCreate,
  onDeleteImage,
  onDeleteProject,
}: GalleryViewProps) {
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [colorFilter, setColorFilter] = useState("all");
  const [deletion, setDeletion] = useState<Deletion | null>(null);
  const name = product || "Your product";
  const projectColorways = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.colors))).sort(),
    [projects],
  );
  const visibleProjects = useMemo(
    () =>
      colorFilter === "all"
        ? projects
        : projects.filter((project) => project.colors.includes(colorFilter)),
    [colorFilter, projects],
  );
  const visibleImages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return images
      .filter((image) => {
        const hasDetails = Boolean(image.details);
        if (listingFilter === "ready" && !hasDetails) return false;
        if (listingFilter === "needs-details" && hasDetails) return false;
        if (!query) return true;
        const searchable = [
          image.angle,
          image.details?.title,
          image.details?.category,
          image.details?.altText,
          ...(image.details?.tags ?? []),
          ...(image.details?.keywords ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) =>
        sortOrder === "oldest"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [images, listingFilter, search, sortOrder]);

  const confirmDeletion = () => {
    if (!deletion) return Promise.resolve(false);
    return deletion.kind === "project"
      ? onDeleteProject()
      : onDeleteImage(deletion.id);
  };

  return (
    <>
      <PageHeading
        eyebrow="Visual library"
        title="Image library"
        description="Browse, approve, and export every generated asset."
      />

      <section aria-labelledby="generated-images" className="mt-9">
        {projects.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Browse by product or narrow projects by colorway.
            </p>
            <label>
              <span className="sr-only">Filter projects by colorway</span>
              <select
                value={colorFilter}
                onChange={(event) => {
                  const nextColor = event.target.value;
                  const nextProjects =
                    nextColor === "all"
                      ? projects
                      : projects.filter((project) =>
                          project.colors.includes(nextColor),
                        );
                  setColorFilter(nextColor);
                  if (
                    nextProjects.length > 0 &&
                    !nextProjects.some((project) => project.id === activeProjectId)
                  ) {
                    onSelectProject(nextProjects[0].id);
                  }
                }}
                className="h-11 min-w-40 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/25"
              >
                <option value="all">All colorways</option>
                {projectColorways.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {projects.length > 1 && (
          <nav aria-label="Products" className="mb-6 flex flex-wrap gap-3">
            {visibleProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                aria-pressed={project.id === activeProjectId}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl border py-2 pl-2 pr-4 text-left text-sm transition",
                  project.id === activeProjectId
                    ? "border-accent bg-accent-soft text-foreground ring-1 ring-accent"
                    : "bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {project.coverImageId ? (
                    <Image
                      src={imageUrl(project.coverImageId)}
                      alt=""
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlus
                      aria-hidden
                      className="absolute inset-0 m-auto size-4"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-48 truncate font-medium">
                    {project.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {project.imageCount}{" "}
                    {project.imageCount === 1 ? "image" : "images"}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        )}
        {error ? (
          <ErrorAlert
            title="Couldn’t load your images"
            message={error}
            hint="Start the backend (npm run dev in /backend) and refresh."
          />
        ) : loading ? (
          <ViewSkeleton />
        ) : images.length === 0 ? (
          <EmptyState
            icon={<ImagePlus />}
            title="No generated images yet"
            description="Create a project and your generated product photography will appear here, ready to review and download."
            action={
              <Button size="xl" onClick={onCreate} className="rounded-full">
                <WandSparkles data-icon="inline-start" aria-hidden /> Create
                your first set
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="generated-images"
                  className="text-lg font-semibold tracking-[-0.02em]"
                >
                  {name} · generated images
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, review listing details, and export your assets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletion({ kind: "project", name })}
                className="min-h-11 rounded-md px-2 text-sm text-destructive transition hover:bg-destructive-soft"
              >
                Delete project
              </button>
            </div>

            <div className="mb-5 grid gap-3 rounded-2xl border bg-card p-3 sm:grid-cols-[minmax(12rem,1fr)_auto_auto] sm:p-4">
              <label className="relative block">
                <span className="sr-only">Search images in {name}</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search angles, titles, or tags"
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/25"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="sr-only">Filter by listing status</span>
                <select
                  value={listingFilter}
                  onChange={(event) => setListingFilter(event.target.value)}
                  className="h-11 w-full min-w-40 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/25"
                >
                  <option value="all">All listing statuses</option>
                  <option value="ready">Details ready</option>
                  <option value="needs-details">Needs details</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="sr-only">Sort images</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="h-11 w-full min-w-36 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/25"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Showing {visibleImages.length} of {images.length}{" "}
                {images.length === 1 ? "image" : "images"}
              </span>
              {visibleImages.length !== images.length && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setListingFilter("all");
                  }}
                  className="min-h-11 rounded-md px-2 font-medium text-accent-text hover:bg-accent-soft"
                >
                  Clear filters
                </button>
              )}
            </div>

            {visibleImages.length === 0 ? (
              <EmptyState
                icon={<Search />}
                title="No images match these filters"
                description="Try a different search or clear the listing-status filter to see more of this project."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleImages.map((image) => {
                  const index = images.findIndex((item) => item.id === image.id);
                  const label = image.angle
                    ? titleCase(image.angle)
                    : `Angle ${index + 1}`;
                  return (
                    <li
                      key={image.id}
                      className="overflow-hidden rounded-xl border bg-card transition duration-300 hover:shadow-lg hover:shadow-black/5"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenImage(index)}
                        aria-label={`Open details for ${label} view`}
                        className="group relative block aspect-square w-full overflow-hidden bg-muted"
                      >
                        <Image
                          src={imageUrl(image.id)}
                          alt={
                            image.details?.altText ??
                            `${name} generated ${label} view`
                          }
                          fill
                          unoptimized
                          sizes="(min-width: 1536px) 18vw, (min-width: 1024px) 25vw, 50vw"
                          className="object-cover transition duration-500 ease-out group-hover:scale-105"
                        />
                      </button>
                      <div className="flex items-center justify-between gap-2 p-3 text-sm">
                        <div className="min-w-0">
                          <span className="block truncate font-medium">
                            {label}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block text-xs",
                              image.details
                                ? "text-success-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {image.details ? "Details ready" : "Needs details"}
                          </span>
                        </div>
                        <span className="flex shrink-0">
                          <a
                            href={imageDownloadUrl(image.id)}
                            aria-label={`Download ${label} view`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "text-accent-text",
                            )}
                          >
                            <Download aria-hidden /> Save
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setDeletion({
                                kind: "image",
                                id: image.id,
                                label,
                              })
                            }
                            aria-label={`Delete ${label} view`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "text-destructive",
                            )}
                          >
                            <Trash2 aria-hidden />
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
      <ConfirmDialog
        open={Boolean(deletion)}
        title={
          deletion?.kind === "project"
            ? `Delete "${deletion.name}"?`
            : `Delete ${deletion?.kind === "image" ? deletion.label : "image"}?`
        }
        description={
          deletion?.kind === "project"
            ? "This permanently deletes the project and every image in it."
            : "This permanently removes the image from your project."
        }
        confirmLabel={deletion?.kind === "project" ? "Delete project" : "Delete image"}
        error={error}
        onConfirm={confirmDeletion}
        onOpenChange={(open) => {
          if (!open) setDeletion(null);
        }}
      />
    </>
  );
}
