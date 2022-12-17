import * as fs from 'fs'
import * as path from 'path'
export function copyNote (srcPath: string, tarPath: string, filter = []): void {
  const files = fs.readdirSync(srcPath)
  files.forEach(filename => {
    const filedir = path.join(srcPath, filename)
    const filterFlag = filter.some(item => item === filename)
    if (!filterFlag) {
      const stats = fs.statSync(filedir)
      if (stats.isFile()) { // 复制文件
        const destPath = path.join(tarPath, filename)
        fs.copyFileSync(filedir, destPath)
      } else { // 创建文件夹
        const tarFiledir = path.join(tarPath, filename)
        fs.mkdirSync(tarFiledir)
        copyNote(filedir, tarFiledir, filter) // 递归
      }
    }
  })
}
function emptyDir (path: string): void {
  const files = fs.readdirSync(path)
  files.forEach(file => {
    const filePath = `${path}/${file}`
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      emptyDir(filePath)
    } else {
      fs.unlinkSync(filePath)
    }
  })
}

/**
 * 删除指定路径下的所有空文件夹
 * @param {*} path
 */
function rmEmptyDir (path: string, level = 0): void {
  const files = fs.readdirSync(path)
  if (files.length > 0) {
    let tempFile = 0
    files.forEach(file => {
      tempFile++
      rmEmptyDir(`${path}/${file}`, 1)
    })
    if (tempFile === files.length && level !== 0) {
      fs.rmdirSync(path)
    }
  } else {
    level !== 0 && fs.rmdirSync(path)
  }
}

/**
 * 清空指定路径下的所有文件及文件夹
 * @param {*} path
 */
export function clearDir (path: string): void {
  emptyDir(path)
  rmEmptyDir(path)
}
