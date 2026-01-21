import { jest } from '@jest/globals';
import { promises as fs } from 'fs';

// Mock os.platform
const mockPlatform = jest.fn(() => 'darwin');
jest.mock('os', () => ({
  ...jest.requireActual('os') as any,
  platform: mockPlatform,
}));

// Mock fs.symlink
jest.mock('fs', () => ({
  promises: {
    symlink: jest.fn(),
  },
}));

import { createSymlink } from '../utils.js';

describe('createSymlink', () => {
  const target = '/path/to/target';
  const path = '/path/to/link';

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.mockReturnValue('darwin'); // Default to darwin
  });

  it('should use "dir" type on MacOS platforms', async () => {
    mockPlatform.mockReturnValue('darwin');
    await createSymlink(target, path);
    expect(fs.symlink).toHaveBeenCalledWith(target, path, 'dir');
  });

  it('should use "dir" type on Linux', async () => {
    mockPlatform.mockReturnValue('linux');
    await createSymlink(target, path);
    expect(fs.symlink).toHaveBeenCalledWith(target, path, 'dir');
  });

  it('should use "junction" type on Windows', async () => {
    mockPlatform.mockReturnValue('win32');
    await createSymlink(target, path);
    expect(fs.symlink).toHaveBeenCalledWith(target, path, 'junction');
  });
});
