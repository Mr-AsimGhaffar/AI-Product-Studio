"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORWAYS, type Project } from "@/lib/studio-data";
import { ErrorAlert } from "../shared/error-alert";
import { EmptyState } from "../shared/empty-state";
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
  const featuredProject = recentProjects[0];

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_48%,oklch(0.42_0.035_55/0.75),transparent_38%)]" />
        <div className="grid min-h-[22rem] items-center gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:p-12">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c5ad93]">
              <Sparkles aria-hidden className="size-4" />
              {eyebrow}
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl tracking-[-0.045em] sm:text-5xl">
              {title}. Make your next product stand out.
            </h1>
            <p className="mt-4 max-w-lg text-pretty leading-relaxed text-primary-foreground/70">
              Turn a product idea into a complete visual catalog and
              marketplace-ready content, all from one brief.
            </p>
            <Button
              size="xl"
              onClick={onCreate}
              className="mt-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <WandSparkles data-icon="inline-start" aria-hidden />
              Create a product set
              <ArrowUpRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-3 top-8 z-10 rounded-xl border border-white/10 bg-primary/80 px-4 py-3 shadow-xl backdrop-blur sm:-left-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/55">
                Studio output
              </p>
              <p className="mt-1 text-sm font-medium">
                {featuredProject
                  ? `${featuredProject.images} product images`
                  : "Ready for your first brief"}
              </p>
            </div>
            <div className="relative aspect-[1.25] overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl">
              {featuredProject?.image ? (
                <Image
                  src={featuredProject.image}
                  alt={`${featuredProject.name} generated product photography`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 36vw, 90vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_55%_45%,oklch(0.47_0.035_55),transparent_66%)]"
                >
                  <div className="relative grid size-40 place-items-center rounded-full border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm sm:size-52">
                    <div className="grid size-28 place-items-center rounded-full border border-white/15 bg-white/5 sm:size-36">
                      <ImageIcon className="size-12 text-[#c5ad93] sm:size-16" />
                    </div>
                    <span className="absolute -right-2 top-8 size-7 rounded-full border-4 border-primary bg-[#b9553b]" />
                    <span className="absolute -bottom-1 left-7 size-6 rounded-full border-4 border-primary bg-[#3158bd]" />
                    <span className="absolute -left-2 top-16 size-5 rounded-full border-4 border-primary bg-[#e7dfd0]" />
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/75 to-transparent p-5 pt-16">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                    {featuredProject ? "Latest project" : "Your next collection"}
                  </p>
                  <p className="mt-1 truncate font-medium">
                    {featuredProject?.name ?? "A new visual world"}
                  </p>
                </div>
                <div aria-hidden className="flex shrink-0 -space-x-1.5">
                  {COLORWAYS.map(({ name, value }) => (
                    <span
                      key={name}
                      className="size-5 rounded-full border-2 border-primary"
                      style={{ backgroundColor: value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <EmptyState
            icon={<WandSparkles />}
            title="Your first product set starts here"
            description="Add a product idea and creative direction to build your first complete visual catalog."
            action={
              <Button size="xl" onClick={onCreate} className="rounded-full">
                <WandSparkles data-icon="inline-start" aria-hidden />
                Start your first project
              </Button>
            }
          />
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
