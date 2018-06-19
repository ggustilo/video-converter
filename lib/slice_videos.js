const config = require('config'),
	fs = require('fs'),
	ffmpegInstaller = require('@ffmpeg-installer/ffmpeg'),
	ffprobeInstaller = require('@ffprobe-installer/ffprobe'),
	ffmpeg = require('fluent-ffmpeg'),
	path = require('path'),
	ffprobe = require('ffprobe'),
	ffprobeStatic = require('ffprobe-static'),
	winston = require('winston');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const log = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/error.log'), level: 'error' }),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/combined.log') })
	]
});


const getVideoDuration = function(filePath, cb) {
	ffprobe(filePath, {path: ffprobeStatic.path}, function (err, info) {
		if (err) {
			console.log(err);
		} else if (info.streams[0].duration) {
			console.log("Starting duration: ", info.streams[0].duration);
			let safeInt = Number.parseInt(info.streams[0].duration);
			console.log(safeInt);
			cb(safeInt);
		} else {
			console.log("No duration. Check video: ", fileName);
			return 0;
		}
	});
};

const sliceVideo = function(videoLength, fileName, currentPath, outputPath, clipLength) {
	let startTime = 0,
		nameCounter = 0;

	console.log("Start time: " + startTime);

	console.log("Video length: " + videoLength);

	while (startTime <= videoLength) {

		let command = ffmpeg({
			timeout: 180,
			logger: log

		}).on('start', function (commandLine) {

			log.info('Spawned Ffmpeg with command: ' + commandLine);

		}).on('error', function (err, stdout, stderr) {

			log.error('Cannot process video: ' + err.message);

		}).on('end', function (stdout, stderr) {
			log.info('Slicing succeeded!');
		});

		command.addInput(currentPath)
			.seekInput(startTime)
			.duration(clipLength)
			.output(path.resolve(outputPath, fileName.split('.avi')[0] + '_Num_' + nameCounter + '.avi'))
			.run();

		startTime += clipLength;
		nameCounter += 1;
	}

	return nameCounter;
};

const sliceLeftoverVideo = function(fileName, currentPath, outputPath, clipLength, startTime, clipNum) {

	console.log("Start time: " + startTime);

	console.log("Video length: " + clipLength);

	let command = ffmpeg({
		timeout: 180,
		logger: log

	}).on('start', function (commandLine) {

		log.info('Spawned Ffmpeg with command: ' + commandLine);

	}).on('error', function (err, stdout, stderr) {

		log.error('Cannot process video: ' + err.message);

	}).on('end', function (stdout, stderr) {
		log.info('Slicing succeeded!');
	});


	command.addInput(currentPath)
		.seekInput(startTime)
		.duration(clipLength)
		.output(path.resolve(outputPath, fileName.split('.avi')[0] + '_Num_' + clipNum + '.avi'))
		.run();
};

const getCleanlyDividedDuration = function(duration, clipLength) {
	return (duration % clipLength) == 0 ?  duration : Math.floor(duration/clipLength) * clipLength;
};

const sliceVideos = function(inputPath, outputPath) {

	const fileNames = fs.readdirSync(path.resolve(inputPath));
	const clipLength = config.get('length_of_clip');

	fileNames.forEach((fileName) => {
		let currentFilePath = path.resolve(inputPath, fileName);

		if (fileName != ".DS_Store") {
			getVideoDuration(currentFilePath, (duration) => {
				//check is divisible evenly by 15

				let originalVideoLength = duration,
					cleanVideoLength = getCleanlyDividedDuration(duration, clipLength),
					lastSlice;

				console.log("Check");
				console.log(cleanVideoLength);

				if (cleanVideoLength > 0) {
					lastSlice = sliceVideo(cleanVideoLength, fileName, currentFilePath, outputPath, clipLength);
				}

				console.log("Last slice number: " + lastSlice);

				if (originalVideoLength > cleanVideoLength) {
					let lengthLeft = originalVideoLength - cleanVideoLength;
					console.log("Length in remainder video: "  + lengthLeft);
					sliceLeftoverVideo(fileName, currentFilePath, outputPath, lengthLeft, cleanVideoLength, lastSlice);
				}
			});

		} else {
			console.log('DS_Store file');
			return;
		}
	});
};

module.exports = sliceVideos;






