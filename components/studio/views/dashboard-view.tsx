"use client";

import { useEffect, useState } from "react";
import { ArrowRight, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Project } from "@/lib/studio-data";
import { ErrorAlert } from "../shared/error-alert";
import { PageHeading } from "../shared/page-heading";
import { ProjectCard } from "../shared/project-card";
import { StatCard } from "../shared/stat-card";
import { ViewSkeleton } from "../shared/view-skeleton";

type DashboardViewProps = {
  projects: Project[];
  loading: boolean;
  error: string;
  describedCount: number;
  onCreate: () => void;
  onOpenLibrary: () => void;
  onOpenProject: (id: string) => void;
};

const RECENT_LIMIT = 3;

function useGreeting() {
  const [greeting, setGreeting] = useState({
    eyebrow: "Welcome back",
    title: "Hello, Asim.",
  });
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    setGreeting({
      eyebrow: now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      title: `Good ${part}`,
    });
  }, []);
  return greeting;
}

export function DashboardView({
  projects,
  loading,
  error,
  describedCount,
  onCreate,
  onOpenLibrary,
  onOpenProject,
}: DashboardViewProps) {
  const { eyebrow, title } = useGreeting();
  const recentProjects = projects.slice(0, RECENT_LIMIT);
  const totalImages = projects.reduce(
    (sum, project) => sum + project.images,
    0,
  );

  return (
    <>
      <PageHeading
        size="large"
        eyebrow={eyebrow}
        title={title}
        description="Turn your next product idea into a complete visual catalog, without the production overhead."
        actions={
          <Button
            variant="outline"
            size="xl"
            onClick={onCreate}
            className="rounded-full bg-transparent"
          >
            <WandSparkles data-icon="inline-start" aria-hidden /> Start creating
          </Button>
        }
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Projects"
          value={String(projects.length)}
          note="Saved to your library"
        />
        <StatCard
          label="Images generated"
          value={String(totalImages)}
          note={`Across ${projects.length} ${projects.length === 1 ? "product" : "products"}`}
        />
        <StatCard
          label="Ready to list"
          value={String(describedCount)}
          note={`of ${totalImages} ${totalImages === 1 ? "image has" : "images have"} listing details`}
        />
      </dl>

      <section aria-labelledby="recent-projects" className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              id="recent-projects"
              className="text-lg font-semibold tracking-[-0.02em]"
            >
              Recent projects
            </h2>
            <p className="text-sm text-muted-foreground">
              Your latest product worlds, all in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="group inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md text-sm font-medium text-accent-text"
          >
            View all{" "}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
        {error ? (
          <ErrorAlert
            title="Couldn’t load your projects"
            message={error}
            hint="Start the backend (npm run dev in /backend) and refresh."
          />
        ) : loading ? (
          <ViewSkeleton />
        ) : recentProjects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
            No projects yet. Start creating to build your first set.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                priority={index < RECENT_LIMIT}
                onOpen={onOpenProject}
              />
            ))}
          </div>
        )}
      </section>

      <section
        aria-label="Creative toolkit"
        className="mt-12 flex flex-col gap-6 rounded-2xl bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#c5ad93]">
            Your creative toolkit
          </p>
          <h2 className="mt-2 font-serif text-2xl">
            One brief. Every channel.
          </h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/70">
            Generate the images, then turn them into marketplace-ready listings
            for every destination.
          </p>
        </div>
        <ul aria-label="Supported marketplaces" className="flex -space-x-2">
          {["AM", "EB", "ET", "+3"].map((label) => (
            <li
              key={label}
              className="grid size-10 place-items-center rounded-full border-2 border-primary bg-[#c5ad93] text-xs font-semibold text-primary"
            >
              {label}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
