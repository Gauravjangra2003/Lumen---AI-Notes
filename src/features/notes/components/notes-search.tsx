"use client";

import { useRef } from "react";
import { ListFilter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useNotesView } from "../hooks/use-notes-view";
import type { NotesFilter, NotesSort } from "../types";

const SORT_OPTIONS: { value: NotesSort; label: string }[] = [
  { value: "created", label: "Date created" },
  { value: "updated", label: "Last edited" },
  { value: "title", label: "Title (A–Z)" },
];

const FILTER_OPTIONS: { value: NotesFilter; label: string }[] = [
  { value: "all", label: "All notes" },
  { value: "shared", label: "Shared notes" },
];

type NotesSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function NotesSearch({ query, onQueryChange }: NotesSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { sort, filter, setSort, setFilter } = useNotesView();
  const isFiltered = filter !== "all";

  return (
    <div className="flex items-center gap-1 px-2 pb-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.preventDefault();
              onQueryChange("");
            }
          }}
          placeholder="Search notes"
          aria-label="Search notes by title or content"
          className="h-8 w-full rounded-md border border-transparent bg-sidebar-accent/60 pr-7 pl-7 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Clear search"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <X />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={isFiltered ? "Sort and filter (filter on)" : "Sort and filter"}
            className={cn("relative", isFiltered && "text-sky-500 hover:text-sky-500")}
          >
            <ListFilter />
            {isFiltered && (
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-sky-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => setSort(value as NotesSort)}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filter}
            onValueChange={(value) => setFilter(value as NotesFilter)}
          >
            {FILTER_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
