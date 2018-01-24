'use strict'
const cp = require('child_process')
let worker
function spawn(server,config){
    worker = cp.spawn('node',[server,config])
    worker.on('exit',function(code){
        if(code!==0){
            spawn(server,config)
        }
    })
}

function main(argv){
   spawn('server.js',argv[0])
   process.on('SIGTERM',function(){
       //给子进程发送SINTERM信号
       worker.kill()
       //退出进程
       process.exit(0)
   })
}

main(process.argv.slice(2))