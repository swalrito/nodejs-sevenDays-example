'use strict'
const http = require('http')
const path = require('path')
const fs = require('fs')


let  MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
}

function validateFile(pathnames,callback){
    (function next(i,len){
        //递归检测pathnames数组的每一个path路径的文件是否存在
        if(i<len){
            fs.stat(pathnames[i],function(err,stats){
                if(err){
                    callback(err)
                }
                //检测的对象是否是file
                else if(!stats.isFile()){
                    callback(new Error())
                }
                else{
                    next(i+1,len)
                }
            })
        }
        //检测完毕
        else{
            callback(null,pathnames)
        }
    })(0,pathnames.length)
}

function outputFiles(pathnames,writer){
    (function next(i,len){
        if(i<len){
            //建立一个读取文件的stream
            let reader = fs.createReadStream(pathnames[i])
            //将读取到的文件写入response这个writer中，并且在stream读取完毕后，并不结束wiriter
            reader.pipe(writer,{end:false})
            //递归进行读取下一个文件
            reader.on('end',function(){
                next(i+1,len)
            })
        }
        else{
            //最后一个文件读取完毕后，关闭writer
            writer.end()
        }
    })(0,pathnames.length)
}

function main(argv){
    let config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root=config.root || '.',
        port = config.port || '80'
    http.createServer(function(request,response){
        let urlInfo = parseURL(root,request.url)
        validateFile(urlInfo.pathnames,function(err,pathnames){
            if(err){
                response.writeHead(404)
                response.end(err.message)
            }
            else{
                response.writeHead(200,{
                    'Content-Type':urlInfo.mime
                })
                outputFiles(pathnames, response);
            }
        })
    }).listen(port)
}

function parseURL (root,url){
    let base,pathnames,parts
    console.log(url)
    if(url.indexOf('??')===-1){
       url = url.replace('/','/??')
    }
    parts=url.split('??')
    console.log(parts)
    base=parts[0] //url 公共部分
    //文件路径
    pathnames=parts[1].split(',').map(function(value){
        return path.join(root,base,value)
    })
    console.log(pathnames)
    //文件信息
    return {
        mime:MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames:pathnames
    }
}
main(process.argv.slice(2))