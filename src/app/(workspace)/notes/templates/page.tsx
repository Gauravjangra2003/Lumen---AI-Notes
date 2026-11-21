import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { TemplateGallery } from "@/features/templates";

export const metadata: Metadata = {
  title: "Templates",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Templates"
        description="Pick a design to start a new note. Shuffle for fresh ideas."
      />
      <TemplateGallery />
    </div>
  );
}
