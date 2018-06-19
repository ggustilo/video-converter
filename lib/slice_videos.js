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
		let startTime = 0,
			videoLength,
			currentFilePath = path.resolve(inputPath, fileName);

		if (fileName != ".DS_Store") {
			ffprobe(currentFilePath, {path: ffprobeStatic.path}, function (err, info) {
				if (err) {
					console.log(err);
				} else if (info.streams[0].duration) {
					videoLength = info.streams[0].duration;
					console.log("Starting duration: ", videoLength);
				} else {
					console.log("No duration. Check video: ", fileName);
					return;
				}
			});

			//check is divisible evenly by 15

			while (startTime < videoLength) {
				let
					newFilePath = path.resolve(outputPath, fileName),
					command = ffmpeg({
						timeout: 180,
						logger: log

					}).on('start', function (commandLine) {

						log.info('Spawned Ffmpeg with command: ' + commandLine);

					}).on('error', function (err, stdout, stderr) {

						log.error('Cannot process video: ' + err.message);

					}).on('end', function (stdout, stderr) {

						log.info('Compression succeeded !');
					});
				console.log(currentFilePath);


				// command.addInput(currentFilePath)
				// 	.inputOptions([
				// 		'-ss' + startTime,
				// 		'-t' + clipLength
				// 	])
				// 	.output(newFilePath)
				// 	.run();
				startTime += 15;
			}
		} else {
			return;
		}
	});
};

module.exports = sliceVideos;






