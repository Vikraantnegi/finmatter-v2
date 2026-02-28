import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

const webApiFiles = ["apps/web-api/**/*.{js,jsx,ts,tsx}"];
const tsOnlyFiles = [
  "apps/backend/**/*.ts",
  "apps/mobile/**/*.{ts,tsx}",
  "packages/ai/**/*.ts",
  "packages/domain/**/*.ts",
];

export default [
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/out/**",
    "**/.expo/**",
    "**/next-env.d.ts",
  ]),
  // Next.js rules for web-api only
  ...nextVitals.map((c) => ({ ...c, files: webApiFiles })),
  ...nextTs.map((c) => ({ ...c, files: webApiFiles })),
  // Node/CommonJS env for config files (e.g. babel.config.js)
  {
    files: ["apps/mobile/**/*.js", "**/*.cjs"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
      },
    },
  },
  // Allow require() in config files (metro, tailwind, babel) — they run as CommonJS
  {
    files: ["**/*.config.js", "**/babel.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // TypeScript recommended for backend, mobile, packages
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: tsOnlyFiles,
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
      },
    }
  ),
  // Next.js: App Router (no pages directory)
  {
    files: webApiFiles,
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
