#!/usr/bin/env node

/**
 * espidf-app-builder
 * @version 1.0
 * @author skitsanos
 */

const program = require('commander');
const winston = require('winston');
const fs = require('fs');

const log = winston.createLogger({
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' })
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.printf(info =>
                {
                    return ` ${(new Date()).getTime()} ${info.level}: ${info.message}`;
                }))
        })
    ]
});

const app = {
    createStructure: function (path, app_name)
    {
        if (!fs.existsSync(path))
        {
            log.error('Path not found %s, please make sure path provided is correct', path);
            process.exit(0);
        }
        else
        {
            /**
             * /components
             *
             * /main
             *  CMakeLists.txt
             *  component.mk
             *
             */
            log.info('Creating folder structure...');
            fs.mkdir(path + '/main', err =>
            {
                if (err)
                {
                    log.error(err.message);
                }

                fs.writeFile(path + '/main/component.mk', '#\n#\n#\n', (err, data) =>
                {
                    if (err)
                    {
                        log.error(err.message);
                    }
                    log.info(`${path}/main/component.mk added`);
                });

                fs.writeFile(path + '/main/app.c', `#include <stdio.h>\nvoid app_main(){\nprintf("Hello from ESP32!\\n");\n}`, (err, data) =>
                {
                    if (err)
                    {
                        log.error(err.message);
                    }
                    log.info(`${path}/app.c added`);
                });
            });

            //creating /components folder
            fs.mkdir(path + '/components', err =>
            {
                if (err)
                {
                    log.error(err.message);
                }
            });

            //creating Makefile
            fs.writeFile(path + '/Makefile', `PROJECT_NAME := ${app_name}\ninclude $(IDF_PATH)/make/project.mk`, (err, data) =>
            {
                if (err)
                {
                    log.error(err.message);
                }
                log.info(`${path}/Makefile added`);
            });

            //creating CMakeLists.txt
            fs.writeFile(path + '/CMakeLists.txt', `cmake_minimum_required(VERSION 3.5)\ninclude($ENV{IDF_PATH}/tools/cmake/project.cmake)\nproject(${app_name})`, (err, data) =>
            {
                if (err)
                {
                    log.error(err.message);
                }
                log.info(`${path}/CMakeLists.txt added`);
            });
        }
    }
};

program
    .version('1.0.0', '-v, --version')
    .usage('-name -path')
    .option('-a, --app <application name>', 'application name')
    .option('-p, --path <path>', 'path where application will be created')
    .parse(process.argv);

log.info('espidf-app-builder %s', program.version());

if (program.app === undefined && program.path === undefined)
{
    log.warn('Missing parameters, run ' + program.name() + ' --help for more details');
    process.exit(0);
}
else
{
    app.createStructure(program.path, program.app);
}