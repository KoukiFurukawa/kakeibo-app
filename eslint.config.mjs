import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn", // useEffectの依存配列に関する警告を有効化
      "react/no-unescaped-entities": "off", // JSX内のエスケープされていない文字の警告を無効化
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // TypeScriptで未使用の変数に関する警告を有効化
      "@typescript-eslint/no-implicit-any-catch": "off",
    }
  }
];

export default eslintConfig;
