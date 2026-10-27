import { memo } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<Project["status"], string> = {
  Ready: "bg-success/90 text-success-foreground",
  Generating: "bg-warning/90 text-warning-foreground",
};

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
  onOpen: (id: string) => void;
};

export const ProjectCard = memo(function ProjectCard({
  project,
  priority,
  onOpen,
}: ProjectCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border bg-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="relative aspect-[1.15] overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.name} preview`}
            fill
            priority={priority}
            unoptimized
            sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur",
            statusStyles[project.status],
          )}
        >
          {project.status}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium">
              <button
                type="button"
                onClick={() => onOpen(project.id)}
                className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:rounded-xl"
              >
                {project.name}
              </button>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{project.type}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {project.date}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>{project.images} images</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 transition-colors group-hover:text-accent-text">
            Open project{" "}
            <ArrowRight
              aria-hidden
              className="size-3 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </article>
  );
});
