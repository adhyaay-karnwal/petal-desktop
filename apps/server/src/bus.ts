import { EventEmitter } from 'node:events';

/**
 * In-process notifications between route modules and the project builder.
 * Content routes emit after every write; the builder recompiles and pushes
 * SSE events to connected editors.
 */
export type ProjectChange =
  | { type: 'files'; projectId: string; paths: string[]; deleted?: string[] }
  | { type: 'css-classes'; projectId: string; classes: string[] }
  | { type: 'project-deleted'; projectId: string };

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

export function emitProjectChange(change: ProjectChange) {
  emitter.emit('change', change);
}

export function onProjectChange(listener: (change: ProjectChange) => void) {
  emitter.on('change', listener);
  return () => emitter.off('change', listener);
}
