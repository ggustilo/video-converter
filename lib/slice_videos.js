const config = require('config'),
	fs = require('fs'),
	ffmpegPath = require('@ffmpeg-installer/ffmpeg').path,
	ffprobePath = require('@ffprobe-installer/ffprobe').path;
	ffmpeg = require('fluent-ffmpeg'),
	path = require('path'),
	winston = require('winston');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const log = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/error.log'), level: 'error' }),
		new winston.transports.File({ filename: path.resolve(__dirname, 'log/combined.log') })
	]
});

const clipLength = config.get('length_of_clip');

// $vidLength = <the length of your video in seconds>
// $vstart = 0;
// $c = 0;
// while ($start -lt $vidlength){
// 	ffmpeg -ss $vstart -t 180 -i inputvid.mp4 -c:v v210 -c:a pcms16le ("output_{0:0000}.avi" -f $c);
// 	$vstart += 180;
// 	$c++;
// }

const sliceVideos = function(inputPath, outputPath) {

	const fileNames = fs.readdirSync(path.resolve(inputPath));

	fileNames.forEach((fileName) => {
		let startTime = 0;
		let videoLength; // use ffprobe

		//check is divisible evenly by 15
		
		while (startTime < videoLength) {
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
					.inputOptions([
						'-ss' + startTime,
						'-t' + 15
					])
					.output(newFilePath)
					.run();
			} else {
				return;
			}
			startTime += 15;
		}

	});
};

module.exports = sliceVideos;






