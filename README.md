# video-converter
convert format, slice into clips, and set controls

1. Set up the config
2. Run `npm install` on the command line
3. To run a step, type:
    - node index.js --command
    - command options should be run in order (convert, compress, slice, controls)
    - check the paths you set up in the config to make sure each command executed properly
    - run the next command

Note: I have set the timeouts for each step at 3 minutes, but this may become necessary to change for larger file sets.

