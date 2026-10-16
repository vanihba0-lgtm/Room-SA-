import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ROOM S A — Security & Secret Isolation Auditing', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const srcDir = path.resolve(rootDir, 'src');
  const envExamplePath = path.resolve(rootDir, '.env.example');

  // Helper to recursively collect files
  function getFiles(dir: string, ext = '.ts'): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.resolve(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath, ext));
      } else if (file.endsWith(ext) || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  // 10. No API secret being included in client-side build output or client sources
  it('10. verifies client-side sources and build output contain zero embedded API secrets', () => {
    const clientFiles = getFiles(srcDir);
    const forbiddenPatterns = [
      /AIza[0-9A-Za-z-_]{35}/, // Google API key format
      /sk-[0-9A-Za-z]{20,}/,   // Standard LLM key format
      /ghp_[0-9A-Za-z]{20,}/,  // GitHub token format
    ];

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        expect(pattern.test(content)).toBe(false);
      }
    }

    // Check dist folder if it exists
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      const distFiles = getFiles(distDir, '.js');
      for (const file of distFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of forbiddenPatterns) {
          expect(pattern.test(content)).toBe(false);
        }
      }
    }
  });

  it('confirms .env.example contains only safe commented template variables and placeholders', () => {
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const envContent = fs.readFileSync(envExamplePath, 'utf-8');

    // Must not contain any actual values assigned to keys
    expect(envContent).not.toMatch(/^GEMINI_API_KEY=[A-Za-z0-9_-]{20,}/m);
    expect(envContent).toContain('GEMINI_API_KEY=');
  });
});
