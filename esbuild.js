const esbuild = require("esbuild");
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs/promises');

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
const postcssPlugin = {
	name: 'postcss',
	setup(build) {
		build.onLoad({ filter: /\.css$/ }, async (args) => {
			const css = await fs.readFile(args.path, 'utf8');
			const result = await postcss([
				tailwindcss,
				autoprefixer,
			]).process(css, {
				from: args.path,
			});

			return {
				contents: result.css,
				loader: 'css',
			};
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
				esbuildProblemMatcherPlugin
			],
		}),
		esbuild.context({
			entryPoints: ['src/tools/toolComponents.ts', 'src/styles/tailwind.css'],
			bundle: true,
			format: 'iife',
			minify: production,
			sourcemap: !production,
			sourcesContent: false,
			platform: 'browser',
			outdir: 'dist',
			logLevel: 'silent',
			plugins: [
				esbuildProblemMatcherPlugin,
				postcssPlugin
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
