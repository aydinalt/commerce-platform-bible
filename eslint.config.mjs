import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "eslint.config.mjs",
      "node_modules/**"
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.mjs",
            "prisma.config.ts",
            "vitest.config.ts",
            "scripts/*.mjs",
            "apps/web/next.config.ts",
            /*
             * The file Vercel invokes (I37). It sits outside `apps/api`'s
             * `rootDir: "src"` on purpose — a TypeScript file there would
             * either be excluded from the build or force `dist/main.js` to
             * move, and that is what the Dockerfile and the process host
             * start.
             */
            "apps/api/api/index.js"
          ]
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  {
    rules: {
      /*
       * A leading underscore marks a parameter that exists because a signature
       * requires it, not because the body wants it. React's `useActionState`
       * hands every action a previous state and a form; an action that changes
       * a lifecycle takes neither, and inventing a use for them would be worse
       * than declaring them unused. The pattern is deliberately narrow: only
       * arguments, and only ones named to say so.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  }
);
