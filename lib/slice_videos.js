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

	while (startTime <= videoLength) {

		command.addInput(currentPath)
			.seekInput(startTime)
			.duration(clipLength)
			.output(path.resolve(outputPath, fileName.split('.avi')[0] + '_Num_' + nameCounter + '.avi'))
			.run();

		startTime += clipLength;
		nameCounter += 1;
	}

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
				let videoLength = getCleanlyDividedDuration(duration, clipLength);

				console.log("Check");
				console.log(videoLength);

				if (videoLength > 0) {
					sliceVideo(videoLength, fileName, currentFilePath, outputPath, clipLength);
				}
			});

		} else {
			console.log('DS_Store file');
			return;
		}
	});
};

module.exports = sliceVideos;






