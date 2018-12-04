# espidf-app-builder
CLI utility for creating ESP-IDF apps

```
Usage: app -name -path

Options:
  -v, --version                 output the version number
  -a, --app <application name>  application name
  -p, --path <path>             path where application will be created
  -h, --help                    output usage information
```

Will create a directory structure and minimal set of files required for ESP-IDF appplication:

```
├─ /components
├─ /main
├─── app.c
├─── component.mk
├─ CMakeLists.txt
├─ Makefile

```

After application structure created, don't forget to run config

```
make menuconfig
```
