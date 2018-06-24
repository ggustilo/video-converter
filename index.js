const config = require('config'),
	convert = require('./lib/convert_format'),
	compress = require('./lib/compress'),
	slice_videos = require('./lib/slice_videos'),
	rename_files = require('./lib/rename_files');

const argv = require('yargs')
		.alias('convert', 'convert')
		.alias('compress', 'compress')
		.alias('slice', 'slice')
		.alias('controls', 'controls')
		.argv;

const original_file_path = config.get('original_file_path'),
	reformat_output_path = config.get('reformat_output_path'),
	compressed_output_path = config.get('compressed_output_path'),
	sliced_output_path = config.get('sliced_output_path'),
	renamed_output_path = config.get('renamed_output_path');


if (argv.convert) {
	convert(original_file_path, reformat_output_path);
} else if (argv.compress) {
	compress(reformat_output_path, compressed_output_path);
} else if (argv.slice) {
	slice_videos(compressed_output_path, sliced_output_path);
} else if (argv.controls) {
	rename_files(sliced_output_path, renamed_output_path);
} else {
	console.log('Unknown arguments');
}
