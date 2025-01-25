import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from "@typescript-eslint/parser";
import perfectionist from 'eslint-plugin-perfectionist';

export default tseslint.config(
	{
		ignores: ['**/*.js']
	},
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: 2020,
				sourceType: 'module'
			}
		}
	},
	perfectionist.configs['recommended-natural']
);
