"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useBrief } from "@/hooks/use-brief";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { useProjects } from "@/hooks/use-projects";
import {
  api,
  imageUrl,
  type ProjectWithImages,
  type StoredImage,
} from "@/lib/api";
import type { Project, View } from "@/lib/studio-data";
import { AppShell } from "./layout/app-shell";
import { GenerationProgress } from "./generation-progress";
import { ViewSkeleton } from "./shared/view-skeleton";
import { DashboardView } from "./views/dashboard-view";

const CreationWizard = dynamic(() => import("./wizard/creation-wizard"), {
  loading: () => (
    <div className="p-8">
      <ViewSkeleton />
    </div>
  ),
});
const GalleryView = dynamic(() => import("./views/gallery-view"), {
  loading: () => <ViewSkeleton />,
});
const ListingsView = dynamic(() => import("./views/listings-view"), {
  loading: () => <ViewSkeleton />,
});
const ImageDetail = dynamic(
  () =>
    import("@/components/image-detail").then((module) => module.ImageDetail),
  {
    loading: () => (
      <div className="p-8">
        <ViewSkeleton />
      </div>
    ),
  },
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export function Studio() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [activeProject, setActiveProject] = useState<ProjectWithImages | null>(
    null,
  );
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");
  const {
    brief,
    update,
    toggleColor,
    totalImages,
    reset: resetBrief,
  } = useBrief();
  const { isGenerating, error, generate, cancel } = useImageGeneration();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refresh,
  } = useProjects();

  const projectCards = useMemo<Project[]>(
    () =>
      projects.map((project) => ({
        id: project.id,
        name: project.name,
        type: `${project.product} · ${project.colors.length} ${project.colors.length === 1 ? "color" : "colors"}`,
        status: "Ready",
        images: project.imageCount,
        date: formatDate(project.createdAt),
        image: project.coverImageId ? imageUrl(project.coverImageId) : null,
      })),
    [projects],
  );
  const describedCount = useMemo(
    () => projects.reduce((sum, project) => sum + project.describedCount, 0),
    [projects],
  );

  const context = useMemo(
    () => ({
      product: activeProject?.product ?? "",
      colors: activeProject?.colors ?? [],
      platform: activeProject?.platform ?? brief.platform,
    }),
    [activeProject, brief.platform],
  );

  const loadProject = useCallback(async (id: string) => {
    setActiveLoading(true);
    setActiveError("");
    try {
      setActiveProject(await api.getProject(id));
    } catch (err) {
      setActiveError(
        err instanceof Error ? err.message : "Could not load the project.",
      );
    } finally {
      setActiveLoading(false);
    }
  }, []);

  // Library defaults to the most recent project.
  useEffect(() => {
    if (
      view === "gallery" &&
      !activeProject &&
      !activeLoading &&
      !activeError &&
      projects.length > 0
    )
      loadProject(projects[0].id);
  }, [view, activeProject, activeLoading, activeError, projects, loadProject]);

  const goTo = useCallback((next: View) => setView(next), []);
  const openCreate = useCallback(() => setView("create"), []);
  const openLibrary = useCallback(() => setView("gallery"), []);
  const openProject = useCallback(
    (id: string) => {
      setSelectedImage(null);
      setActiveProject(null);
      setView("gallery");
      loadProject(id);
    },
    [loadProject],
  );
  const closeDetail = useCallback(() => setSelectedImage(null), []);
  const setPlatform = useCallback(
    (platform: string) => update("platform", platform),
    [update],
  );

  const handleImageUpdated = useCallback(
    (image: StoredImage) => {
      setActiveProject(
        (current) =>
          current && {
            ...current,
            images: current.images.map((item) =>
              item.id === image.id ? image : item,
            ),
          },
      );
      refresh();
    },
    [refresh],
  );

  const handleDeleteImage = useCallback(
    async (id: string) => {
      try {
        await api.deleteImage(id);
        setActiveProject(
          (current) =>
            current && {
              ...current,
              images: current.images.filter((item) => item.id !== id),
              imageCount: current.imageCount - 1,
            },
        );
        refresh();
        return true;
      } catch (err) {
        setActiveError(
          err instanceof Error ? err.message : "Could not delete the image.",
        );
        return false;
      }
    },
    [refresh],
  );

  const handleDeleteProject = useCallback(async () => {
    if (!activeProject) return false;
    try {
      await api.deleteProject(activeProject.id);
      await refresh();
      setActiveProject(null);
      return true;
    } catch (err) {
      setActiveError(
        err instanceof Error ? err.message : "Could not delete the project.",
      );
      return false;
    }
  }, [activeProject, refresh]);

  const handleGenerate = useCallback(async () => {
    const saved = await generate(brief);
    if (saved) {
      setActiveProject(saved);
      setActiveError("");
      setSelectedImage(null);
      setWizardStep(0);
      resetBrief();
      setView("gallery");
      refresh();
    }
  }, [generate, brief, refresh, resetBrief]);

  if (isGenerating)
    return (
      <GenerationProgress
        product={brief.product}
        totalImages={totalImages}
        onCancel={cancel}
      />
    );

  const images = activeProject?.images ?? [];

  if (view === "gallery" && selectedImage !== null && images[selectedImage]) {
    return (
      <ImageDetail
        images={images}
        index={selectedImage}
        context={context}
        onIndexChange={setSelectedImage}
        onBack={closeDetail}
        onImageUpdated={handleImageUpdated}
      />
    );
  }

  if (view === "create") {
    return (
      <CreationWizard
        step={wizardStep}
        onStepChange={setWizardStep}
        brief={brief}
        update={update}
        toggleColor={toggleColor}
        totalImages={totalImages}
        generationError={error}
        onExit={() => setView("dashboard")}
        onGenerate={handleGenerate}
      />
    );
  }

  return (
    <AppShell view={view} onNavigate={goTo}>
      {view === "gallery" ? (
        <GalleryView
          projects={projects}
          activeProjectId={activeProject?.id ?? null}
          onSelectProject={openProject}
          images={images}
          product={activeProject?.product ?? ""}
          loading={projectsLoading || activeLoading}
          error={projectsError || activeError}
          onOpenImage={setSelectedImage}
          onCreate={openCreate}
          onDeleteImage={handleDeleteImage}
          onDeleteProject={handleDeleteProject}
        />
      ) : view === "listings" ? (
        <ListingsView
          platform={brief.platform}
          onPlatformChange={setPlatform}
        />
      ) : (
        <DashboardView
          projects={projectCards}
          loading={projectsLoading}
          error={projectsError}
          describedCount={describedCount}
          onCreate={openCreate}
          onOpenLibrary={openLibrary}
          onOpenProject={openProject}
        />
      )}
    </AppShell>
  );
}
