import * as fs from 'fs'
import * as path from 'path'
export function copyNote (srcPath: string, tarPath: string, filter = []): void {
  fs.readdir(srcPath, (err, files) => {
    if (err != null) { console.log(err) } else {
      files.forEach(filename => {
        const filedir = path.join(srcPath, filename)
        const filterFlag = filter.some(item => item === filename)
        if (!filterFlag) {
          fs.stat(filedir, (err, stats) => {
            if (err != null) { console.log(err) } else {
              if (stats.isFile()) { // 复制文件
                const destPath = path.join(tarPath, filename)
                fs.copyFile(filedir, destPath, err => console.log(err))
              } else { // 创建文件夹
                const tarFiledir = path.join(tarPath, filename)
                fs.mkdir(tarFiledir, err => console.log(err))
                copyNote(filedir, tarFiledir, filter) // 递归
              }
            }
          })
        }
      }
      )
    }
  }
  )
}
function emptyDir (path: string): void {
  fs.readdir(path, (err, files) => {
    if (err != null) { console.log(err) } else {
      files.forEach(file => {
        const filePath = `${path}/${file}`
        fs.stat(filePath, (err, stats) => {
          if (err != null) { console.log(err) } else {
            if (stats.isDirectory()) {
              emptyDir(filePath)
            } else {
              fs.unlink(filePath, (err) => console.log(err))
            }
          }
        })
      })
    }
  })
}
/**
 * 删除指定路径下的所有空文件夹
 * @param {*} path
 */
function rmEmptyDir (path: string, level = 0): void {
  fs.readdir(path, (err, files) => {
    if (err != null) { console.log(err) } else {
      if (files.length > 0) {
        let tempFile = 0
        files.forEach(file => {
          tempFile++
          rmEmptyDir(`${path}/${file}`, 1)
        })
        if (tempFile === files.length && level !== 0) {
          fs.rmdir(path, (err) => console.log(err))
        }
      } else {
        level !== 0 && fs.rmdir(path, (err) => console.log(err))
      }
    }
  })
}

/**
 * 清空指定路径下的所有文件及文件夹
 * @param {*} path
 */
export function clearDir (path: string): void {
  emptyDir(path)
  rmEmptyDir(path)
}
