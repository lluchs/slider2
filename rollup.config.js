import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'

export default {
	entry: 'src/slider.js',
	format: 'iife',
	moduleName: 'Slider2',
	dest: 'out/slider.js',
	sourceMap: true,
	plugins: [
		buble({jsx: 'h'}),
		resolve(),
	],
}
