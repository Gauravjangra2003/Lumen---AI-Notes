"use client";

import { z } from "zod";

import { createPersistedStore } from "@/lib/persisted-store";

import {
  clampSidebarWidth,
  SIDEBAR_COLLAPSED_ATTRIBUTE,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_WIDTH_PROPERTY,
} from "./sidebar-config";

export { SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH } from "./sidebar-config";

const sidebarSchema = z.object({
  width: z.number().transform(clampSidebarWidth).catch(SIDEBAR_DEFAULT_WIDTH),
  collapsed: z.boolean().catch(false),
});

type SidebarState = z.infer<typeof sidebarSchema>;

/** Sets the sidebar width without saving it, for live feedback while dragging. */
export function previewSidebarWidth(width: number) {
  document.documentElement.style.setProperty(
    SIDEBAR_WIDTH_PROPERTY,
    `${clampSidebarWidth(width)}px`,
  );
}

function applyToDocument({ width, collapsed }: SidebarState) {
  previewSidebarWidth(width);
  document.documentElement.toggleAttribute(SIDEBAR_COLLAPSED_ATTRIBUTE, collapsed);
}

const sidebarStore = createPersistedStore<SidebarState>({
  key: SIDEBAR_STORAGE_KEY,
  defaults: { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false },
  parse: (raw) => sidebarSchema.parse(raw ?? {}),
  onChange: applyToDocument,
});

export const useSidebarWidth = () => sidebarStore.useStore((state) => state.width);
export const useSidebarCollapsed = () => sidebarStore.useStore((state) => state.collapsed);

export const setSidebarWidth = (width: number) =>
  sidebarStore.setState({ width: clampSidebarWidth(width) });
export const setSidebarCollapsed = (collapsed: boolean) => sidebarStore.setState({ collapsed });
export const toggleSidebar = () =>
  sidebarStore.setState((state) => ({ collapsed: !state.collapsed }));
