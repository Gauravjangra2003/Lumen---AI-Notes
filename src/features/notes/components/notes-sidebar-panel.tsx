"use client";

import { useEffect, type KeyboardEvent, type PointerEvent } from "react";
import { PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  previewSidebarWidth,
  setSidebarCollapsed,
  setSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  toggleSidebar,
  useSidebarCollapsed,
  useSidebarWidth,
} from "@/stores/sidebar-store";

import { NotesSidebar } from "./notes-sidebar";

const KEYBOARD_STEP = 16;
/** Dragging this far past the minimum width collapses the sidebar instead. */
const COLLAPSE_OVERSHOOT = 80;
const COLLAPSE_BUTTON_ID = "sidebar-collapse";
const EXPAND_BUTTON_ID = "sidebar-expand";

function collapse() {
  setSidebarCollapsed(true);
  document.getElementById(EXPAND_BUTTON_ID)?.focus();
}

function expand() {
  setSidebarCollapsed(false);
  document.getElementById(COLLAPSE_BUTTON_ID)?.focus();
}

/** Desktop sidebar: resizable by dragging its edge and collapsible with ⌘\. */
export function NotesSidebarPanel() {
  const collapsed = useSidebarCollapsed();

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative hidden h-full w-(--sidebar-width) shrink-0 transition-[width] duration-200 ease-out md:block sidebar-collapsed:w-0 sidebar-resizing:transition-none">
      <div className="h-full overflow-hidden" inert={collapsed}>
        <NotesSidebar className="w-(--sidebar-width) border-r" onCollapse={collapse} />
      </div>
      <SidebarResizeHandle />
    </div>
  );
}

function SidebarResizeHandle() {
  const width = useSidebarWidth();

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();

    const handle = event.currentTarget;
    const root = document.documentElement;
    const startX = event.clientX;
    const startWidth = handle.parentElement?.getBoundingClientRect().width ?? width;
    let nextWidth = startWidth;

    handle.setPointerCapture(event.pointerId);
    root.setAttribute("data-sidebar-resizing", "");

    function handleMove(moveEvent: globalThis.PointerEvent) {
      nextWidth = startWidth + moveEvent.clientX - startX;
      previewSidebarWidth(nextWidth);
    }

    function handleEnd() {
      handle.removeEventListener("pointermove", handleMove);
      handle.removeEventListener("pointerup", handleEnd);
      handle.removeEventListener("pointercancel", handleEnd);
      root.removeAttribute("data-sidebar-resizing");

      if (nextWidth < SIDEBAR_MIN_WIDTH - COLLAPSE_OVERSHOOT) {
        setSidebarWidth(startWidth);
        collapse();
      } else {
        setSidebarWidth(nextWidth);
      }
    }

    handle.addEventListener("pointermove", handleMove);
    handle.addEventListener("pointerup", handleEnd);
    handle.addEventListener("pointercancel", handleEnd);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = {
      ArrowLeft: width - KEYBOARD_STEP,
      ArrowRight: width + KEYBOARD_STEP,
      Home: SIDEBAR_MIN_WIDTH,
      End: SIDEBAR_MAX_WIDTH,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSidebarWidth(next);
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize, double-click to reset"
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => setSidebarWidth(SIDEBAR_DEFAULT_WIDTH)}
      className="absolute inset-y-0 -right-1.5 z-20 w-3 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:transition-colors hover:after:bg-ring focus-visible:after:bg-ring sidebar-collapsed:hidden sidebar-resizing:after:bg-ring"
    />
  );
}

/** Floating button that brings a collapsed desktop sidebar back. */
export function SidebarExpandButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          id={EXPAND_BUTTON_ID}
          size="icon-sm"
          variant="ghost"
          aria-label="Open sidebar"
          onClick={expand}
          className="fixed top-3 left-3 z-30 hidden bg-background/80 backdrop-blur md:sidebar-collapsed:inline-flex"
        >
          <PanelLeftOpen />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">Open sidebar (⌘\)</TooltipContent>
    </Tooltip>
  );
}
