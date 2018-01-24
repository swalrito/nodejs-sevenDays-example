#!/bin/sh
if[! -f "pid"]
then
    node ../lib/demo.js ../config/config.json
    echo $! > pid
fi