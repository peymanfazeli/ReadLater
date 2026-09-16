// Adapter boundary: keeps the persistence technology (AsyncStorage today)
// behind a tiny surface so a future storage migration is a single-file change.
export interface MessageStorage {
  // Raw stored JSON for the whole messages collection, or null when nothing
  // has ever been written.
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
}
