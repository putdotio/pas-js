import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import pkg from './package.json'

export default [
	{
		input: 'src/index.js',
		output: [
			{
				name: 'Pas',
				file: pkg.browser,
				format: 'umd'
			},
			{
				file: pkg.main,
				format: 'cjs'
			},
			{
				file: pkg.module,
				format: 'es'
			}
		],
		plugins: [
			resolve({
				module: true,
				jsnext: true,
				main: true,
				browser: true,
			}),
			commonjs({
				include: 'node_modules/**'
			}),
			json(),
		]
	},
];
