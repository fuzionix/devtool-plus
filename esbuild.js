const esbuild = require("esbuild");
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/**
 * @type {import('esbuild').Plugin}
 */
const tailwindPlugin = {
	name: 'tailwind',
	
	setup(build) {
		build.onEnd(async () => {
			const cssInput = path.join(__dirname, 'src', 'styles', 'tailwind.css');
			const cssOutput = path.join(__dirname, 'dist', 'tailwind.css');

			try {
				const css = await fs.promises.readFile(cssInput, 'utf8');
				const result = await postcss([
					tailwindcss({
						content: [
							'./src/**/*.{ts,tsx}',
							'./src/**/**/*.{ts,tsx}',
						],
					}),
					autoprefixer,
				]).process(css, { from: cssInput, to: cssOutput });

				await fs.promises.mkdir(path.dirname(cssOutput), { recursive: true });
				await fs.promises.writeFile(cssOutput, result.css);
			} catch (error) {
				console.error('Error processing Tailwind CSS:', error);
			}
		});
	},
};


async function main() {
	const contexts = await Promise.all([
		esbuild.context({
			entryPoints: ['src/extension.ts'],
			bundle: true,
			format: 'cjs',
			minify: production,
			sourcemap: !production,
			sourcesContent: false,
			platform: 'node',
			outfile: 'dist/extension.js',
			external: ['vscode'],
			logLevel: 'silent',
			plugins: [
				esbuildProblemMatcherPlugin,
				tailwindPlugin
			],
		}),
		esbuild.context({
			entryPoints: ['src/tools/toolComponents.ts'],
			bundle: true,
			format: 'iife',
			minify: production,
			sourcemap: !production,
			sourcesContent: false,
			platform: 'browser',
			outfile: 'dist/toolComponents.js',
			logLevel: 'silent',
			plugins: [
				esbuildProblemMatcherPlugin,
				tailwindPlugin
			],
		})
	]);

	if (watch) {
		await Promise.all(contexts.map(ctx => ctx.watch()));
	} else {
		await Promise.all(contexts.map(ctx => ctx.rebuild()));
		await Promise.all(contexts.map(ctx => ctx.dispose()));
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
