import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/*.astro',
      '.aiox-core/**',
      '.ai/**',
      '.aiox/**',
      '.agent/**',
      '.claude/**',
      '.cursor/**',
      '.codex/**',
      '.antigravity/**',
      '.gemini/**',
      '.github/agents/**',
      'outputs/**',
      'supabase/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['packages/*/src/**/*.ts', 'vitest.config.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
