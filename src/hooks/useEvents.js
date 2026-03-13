import { useState, useEffect, useCallback } from "react";
import { eventsAPI } from "@/lib/api";

/**
 * Hook to fetch all events
 */
export function useEvents() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const events = await eventsAPI.getAll();
      setData(events);
    } catch (err) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { data, loading, error, refetch: fetchEvents };
}

/**
 * Hook to fetch a single event by slug
 */
export function useEvent(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const event = await eventsAPI.getBySlug(slug);
        setData(event);
      } catch (err) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  return { data, loading, error };
}

/**
 * Hook for event mutations with optimistic updates
 */
export function useEventMutations(onSuccess) {
  const createMutation = useMutation(eventsAPI.create);
  const updateMutation = useMutation(eventsAPI.update);
  const deleteMutation = useMutation(eventsAPI.delete);

  const createEvent = async (eventData, optimisticUpdate) => {
    if (optimisticUpdate) optimisticUpdate();
    try {
      const result = await createMutation.mutate(eventData);
      onSuccess?.();
      return result;
    } catch (error) {
      throw error; // Let caller handle rollback
    }
  };

  const updateEvent = async (slug, eventData, optimisticUpdate) => {
    if (optimisticUpdate) optimisticUpdate();
    try {
      const result = await updateMutation.mutate(slug, eventData);
      onSuccess?.();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteEvent = async (slug, optimisticUpdate) => {
    if (optimisticUpdate) optimisticUpdate();
    try {
      const result = await deleteMutation.mutate(slug);
      onSuccess?.();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading:
      createMutation.loading ||
      updateMutation.loading ||
      deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
}
