import Image from "next/image";
import { Download, ImagePlus, Trash2, WandSparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  imageDownloadUrl,
  imageUrl,
  type StoredImage,
  type StoredProject,
} from "@/lib/api";
import { cn } from "@/lib/utils";
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
  onDeleteImage: (id: string) => void;
  onDeleteProject: () => void;
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

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
  const name = product || "Your product";

  return (
    <>
      <PageHeading
        eyebrow="Visual library"
        title="Image library"
        description="Browse, approve, and export every generated asset."
      />

      <section aria-labelledby="generated-images" className="mt-9">
        {projects.length > 1 && (
          <nav aria-label="Products" className="mb-6 flex flex-wrap gap-2">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                aria-pressed={project.id === activeProjectId}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  project.id === activeProjectId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {project.name} · {project.imageCount}
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
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="generated-images"
                className="text-lg font-semibold tracking-[-0.02em]"
              >
                {name} · generated images
              </h2>
              <span className="text-sm text-muted-foreground">
                {images.length} saved
                <button
                  type="button"
                  onClick={() =>
                    window.confirm(`Delete "${name}" and all its images?`) &&
                    onDeleteProject()
                  }
                  className="ml-4 text-destructive hover:underline"
                >
                  Delete project
                </button>
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {images.map((image, index) => {
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
                      <span className="truncate font-medium">{label}</span>
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
                            window.confirm(`Delete this ${label} image?`) &&
                            onDeleteImage(image.id)
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
          </>
        )}
      </section>
    </>
  );
}
