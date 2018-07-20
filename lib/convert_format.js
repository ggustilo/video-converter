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
    timeout = config.get('timeout');


const convertFiles = function(inputPath, outputPath) {

    const fileNames = fs.readdirSync(path.resolve(inputPath));

    fileNames.forEach((fileName) => {
        if (fileName != ".DS_Store") {
            let name = fileName.split('.' + currentFormat)[0],
                currentFilePath = path.resolve(inputPath, name + '.' + currentFormat),
                newFilePath = path.resolve(outputPath, name + '.' + desiredFormat),
                command = ffmpeg({
                    timeout: timeout,
                    logger: log
                }).on('start', function(commandLine) {

                    log.info('Spawned Ffmpeg with command: ' + commandLine);

                }).on('error', function(err, stdout, stderr) {

                    log.error('Cannot process video: ' + err.message);

                }).on('end', function(stdout, stderr) {

                    log.info('Transcoding succeeded !');
                });

            command.addInput(currentFilePath)
                .output(newFilePath)
                .run();
        } else {
            console.log('DS_Store file');
            return;
        }
    });
};


module.exports = convertFiles;