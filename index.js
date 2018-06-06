const config = require('config'),
	convert = require('./lib/convert_format'),
	compress = require('./lib/compress');

const original_file_path = config.get('original_file_path'),
	reformat_output_path = config.get('reformat_output_path'),
	compressed_output_path = config.get('compressed_output_path'),
	sliced_output_path = config.get('sliced_output_path'),
	renamed_output_path = config.get('renamed_output_path');

// convert(original_file_path, reformat_output_path);
compress(reformat_output_path, compressed_output_path);