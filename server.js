'use strict'
const http = require('http')
const path = require('path')
const fs = require('fs')


let  MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
}

function combineFiles(pathnames,callback){
    let output=[];
    (function next (i,len){
        if(i<len){
            fs.readFile(pathnames[i],function(err,data){
                if(err){
                    callback(err)
                }
                else{
                    output.push(data)
                    next(i+1,len)
                }
            })
        }
        else{
            callback(null, Buffer.concat(output))
        }
    })(0,pathnames.length)

}

function main(argv){
    let config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root=config.root || '.',
        port = config.port || '80'
    http.createServer(function(request,response){
        let urlInfo = parseURL(root,request.url)
        combineFiles(urlInfo.pathnames,function(err,data){
            if(err){
                response.writeHead(404)
                response.end(err.message)
            }
            else{
                response.writeHead(200,{
                    'Content-Type': urlInfo.mime
                })
                response.end(data)
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