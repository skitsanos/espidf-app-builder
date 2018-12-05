#!/usr/bin/env node

/**
 * espidf-app-builder
 * @version 1.0
 * @author skitsanos
 */

const program = require('commander');
const winston = require('winston');
const Transport = require('winston-transport');
const fs = require('fs');

class FileTransport extends Transport
{
    constructor(opts)
    {
        super(opts);
    }

    log(info, callback)
    {
        fs.appendFile(process.cwd() + '/esp32app.log', `${info.level} ${info.message}\n`, (err) =>
        {
            if (err)
            {
                console.log(err.message);
            }
        });
        callback();
    }
}

const loggingFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(info =>
    {
        return ` ${(new Date()).getTime()} ${info.level}: ${info.message}`;
    }));

const log = winston.createLogger({
    exitOnError: false,
    transports: [
        new FileTransport(
            {
                format: loggingFormat,
                timestamp: true
            }
        ),
        new winston.transports.Console({
            format: loggingFormat
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
    .usage('--app --path')
    .option('-a, --app <application name>', 'application name')
    .option('-p, --path <path>', 'path where application will be created')
    .parse(process.argv);

log.info('espidf-app-builder %s', program.version());

if (program.app === undefined || program.path === undefined)
{
    log.warn('Missing parameters, run ' + program.name() + ' --help for more details');
    process.exit(0);
}
else
{
    app.createStructure(program.path, program.app);
}
