import { promises as fs } from 'fs';
import { platform } from 'os';

/**
 * Creates a symlink compatible with Windows and Unix-like systems.
 * On Windows, it uses 'junction' for directories to avoid admin privilege requirements.
 * 
 * @param target The path to the file or directory being linked to.
 * @param path The path where the symlink will be created.
 */
export async function createSymlink(target: string, path: string): Promise<void> {
  // 'junction' is key for Windows to allow directory links without admin rights
  const type = platform() === 'win32' ? 'junction' : 'dir';
  await fs.symlink(target, path, type);
}
