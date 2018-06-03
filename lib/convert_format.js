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

const currentFormat = config.get('current_format'),
	desiredFormat = config.get('desired_format'),
	outputPath = config.get('output_path'),
	videoFilePath = config.get('video_file_path');

const fileNames = fs.readdirSync(path.resolve(__dirname, videoFilePath));

let command = ffmpeg({

	timeout: 60,
	logger: log

}).on('start', function(commandLine) {

	log.info('Spawned Ffmpeg with command: ' + commandLine);

}).on('codecData', function(data) {

	log.debug('Input is ' + data.video + ' video');

}).on('progress', function(progress) {

	log.debug('Processing: ' + progress.percent + '% done');

}).on('stderr', function(stderrLine) {

	log.debug('Stderr output: ' + stderrLine);

}).on('error', function(err, stdout, stderr) {

	log.error('Cannot process video: ' + err.message);

}).on('end', function(stdout, stderr) {

	log.info('Transcoding succeeded !');

});



const convertFiles = function() {

	fileNames.forEach((fileName) => {

		let name = fileName.split('.' + currentFormat)[0];
		let currentFilePath = path.resolve(__dirname, videoFilePath, name + '.' + currentFormat),
			newFilePath = path.resolve(__dirname, outputPath, name + '.' + desiredFormat);

		command.addInput(currentFilePath)
			.output(newFilePath)
			.run();
	});
};

setTimeout(function() {
	console.log('Ffmpeg has been killed');
	command.kill();
}, 60000);

module.exports = convertFiles;






