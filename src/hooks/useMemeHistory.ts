import { useState, useCallback, useRef } from 'react';
import { MemeTextLayer, MemeStickerLayer, MemeFilters, HeaderStyle, MemeSound } from '../types';

export interface MemeCanvasSnapshot {
  imageSrc: string;
  templateName: string;
  textLayers: MemeTextLayer[];
  stickers: MemeStickerLayer[];
  filters: MemeFilters;
  headerStyle: HeaderStyle;
  attachedSound?: MemeSound | null;
}

const MAX_HISTORY = 30;

function deepCloneSnapshot(snapshot: MemeCanvasSnapshot): MemeCanvasSnapshot {
  return {
    imageSrc: snapshot.imageSrc,
    templateName: snapshot.templateName,
    textLayers: snapshot.textLayers.map((l) => ({ ...l })),
    stickers: snapshot.stickers.map((s) => ({ ...s })),
    filters: { ...snapshot.filters },
    headerStyle: snapshot.headerStyle,
    attachedSound: snapshot.attachedSound ? { ...snapshot.attachedSound } : null,
  };
}

export function useMemeHistory(initialState: MemeCanvasSnapshot) {
  const [past, setPast] = useState<MemeCanvasSnapshot[]>([]);
  const [future, setFuture] = useState<MemeCanvasSnapshot[]>([]);

  // Ref to hold current snapshot for immediate access without closure staleness
  const currentSnapshotRef = useRef<MemeCanvasSnapshot>(initialState);
  currentSnapshotRef.current = initialState;

  // Record a new state in history before performing an action
  const recordChange = useCallback(() => {
    const clone = deepCloneSnapshot(currentSnapshotRef.current);
    setPast((prev) => {
      const next = [...prev, clone];
      if (next.length > MAX_HISTORY) {
        return next.slice(next.length - MAX_HISTORY);
      }
      return next;
    });
    setFuture([]); // Clear future on new branch of changes
  }, []);

  // Undo: revert to last state
  const undo = useCallback((applySnapshot: (s: MemeCanvasSnapshot) => void) => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      const currentClone = deepCloneSnapshot(currentSnapshotRef.current);
      setFuture((prevFuture) => [currentClone, ...prevFuture]);

      applySnapshot(deepCloneSnapshot(previous));
      return newPast;
    });
  }, []);

  // Redo: re-apply undone state
  const redo = useCallback((applySnapshot: (s: MemeCanvasSnapshot) => void) => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      const currentClone = deepCloneSnapshot(currentSnapshotRef.current);
      setPast((prevPast) => [...prevPast, currentClone]);

      applySnapshot(deepCloneSnapshot(next));
      return newFuture;
    });
  }, []);

  const resetHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    recordChange,
    undo,
    redo,
    resetHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyLength: past.length,
    futureLength: future.length,
  };
}
