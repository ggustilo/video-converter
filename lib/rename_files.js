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

const controlPercentage = config.get('control_percentage'),
    timeout = config.get('timeout');

const renameFiles = function(inputPath, outputPath) {

    const fileNames = fs.readdirSync(path.resolve(inputPath)),
        numFilesForControl = Math.floor(fileNames.length / (100 / controlPercentage));
    let count = 0;

    fileNames.forEach((fileName) => {
        if (fileName != ".DS_Store") {
            let fileNumber = parseInt((fileName.split('_Num_')[1]).split('.avi')[0]);

            if (count < numFilesForControl) {
                let currentFilePath = path.resolve(inputPath, fileName),
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

                console.log(currentFilePath);

                command.addInput(currentFilePath)
                    .output(path.resolve(outputPath, fileName.split('.avi')[0] + '_CONTROL' + '.avi'))
                    .run();
            }
            count += 1;
        } else {
            console.log('DS_Store file');
            return;
        }

    });

};

module.exports = renameFiles;