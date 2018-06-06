const config = require('config'),
	fs = require('fs'),
	ffmpegPath = require('@ffmpeg-installer/ffmpeg').path,
	ffmpeg = require('fluent-ffmpeg'),
	path = require('path'),
	winston = require('winston');

ffmpeg.setFfmpegPath(ffmpegPath);

const log = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/error.log'), level: 'error' }),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/combined.log') })
	]
});


const compressVideos = function(inputPath, outputPath) {

	const fileNames = fs.readdirSync(path.resolve(inputPath));

	fileNames.forEach((fileName) => {
		if (fileName != ".DS_Store") {
			let currentFilePath = path.resolve(inputPath, fileName),
				newFilePath = path.resolve(outputPath, fileName),
				command = ffmpeg({
					timeout: 180,
					logger: log

				}).on('start', function(commandLine) {

					log.info('Spawned Ffmpeg with command: ' + commandLine);

				}).on('error', function(err, stdout, stderr) {

					log.error('Cannot process video: ' + err.message);

				}).on('end', function(stdout, stderr) {

					log.info('Compression succeeded !');
				});

			command.addInput(currentFilePath)
				.fps(15)
				.videoBitrate('200k')
				.size('550x?')
				.keepDAR()
				.output(newFilePath)
				.run();
		} else {
			return;
		}

	});
};

module.exports = compressVideos;






