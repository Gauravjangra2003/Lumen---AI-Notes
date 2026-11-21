"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notesKeys } from "../api/keys";
import { addShareInvite, fetchShareInvites, removeShareInvite } from "../api/sharing";
import type { ShareInvite } from "../types";

export function useShareInvites(noteId: string, enabled = true) {
  return useQuery({
    queryKey: notesKeys.invites(noteId),
    queryFn: () => fetchShareInvites(noteId),
    enabled,
  });
}

export function useAddShareInvite(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => addShareInvite(noteId, email),
    onSuccess: (invite) => {
      queryClient.setQueryData<ShareInvite[]>(notesKeys.invites(noteId), (invites = []) => [
        ...invites,
        invite,
      ]);
    },
    onError: (error) => {
      const alreadyInvited = "code" in error && error.code === "23505";
      toast.error(alreadyInvited ? "That person already has access." : "Couldn't add that person.");
    },
  });
}

export function useRemoveShareInvite(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => removeShareInvite(noteId, email),
    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.invites(noteId) });
      const previous = queryClient.getQueryData<ShareInvite[]>(notesKeys.invites(noteId));
      queryClient.setQueryData<ShareInvite[]>(notesKeys.invites(noteId), (invites) =>
        invites?.filter((invite) => invite.email !== email),
      );
      return { previous };
    },
    onError: (_error, _email, context) => {
      queryClient.setQueryData(notesKeys.invites(noteId), context?.previous);
      toast.error("Couldn't remove that person.");
    },
  });
}
