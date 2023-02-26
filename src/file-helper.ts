import * as fs from 'fs'
import { App, Notice } from 'obsidian'
import * as path from 'path'
import { generateAll } from './converter'

export function cloneDir (vaultPath: string, blogPath: string, notePath: string, obsidianApp: App): void {
  blogDir = vaultPath + blogPath
  noteDir = vaultPath + notePath
  stackForRmFile = []
  stackForRmDir = []
  pairs = []
  app = obsidianApp
  generateDir = blogPath
  console.log(new Notice('开始shadow'))
  rmFile(blogDir)
}

class PairDir {
  src: string
  tar: string
  filter: never[]
  constructor (src: string, tar: string, filter: never[]) {
    this.src = src
    this.tar = tar
    this.filter = filter
  }
}
let app: App
let pairs: PairDir[] = [] // 待写入
let stackForRmFile: string[] = [] // 待删除文件
let stackForRmDir: string[] = [] // 待删除文件夹
let blogDir: string
let noteDir: string
let generateDir: string

/**
 * 删除指定路径下的所有文件
 * @param {*} path
 */
function rmFile (path: string): void {
  fs.readdir(path, (err, files) => {
    if (err != null) throw err
    let filesCount = files.length
    if (filesCount === 0) {
      if (stackForRmFile.length === 0) {
        console.log(new Notice('旧文件清理完成'))
        rmEmptyDir(blogDir)
      } else {
        rmFile(stackForRmFile.pop() as string)
      }
    } else {
      files.forEach(file => {
        const filePath = `${path}/${file}`
        fs.stat(filePath, (err, stats) => {
          if (err != null) throw err
          if (stats.isDirectory()) {
            stackForRmFile.push(filePath)
          } else {
            fs.unlink(filePath, (err) => { if (err != null) throw err })
          }
          filesCount--
          if (filesCount === 0) {
            if (stackForRmFile.length === 0) {
              console.log(new Notice('旧文件清理完成'))
              rmEmptyDir(blogDir)
            } else {
              rmFile(stackForRmFile.pop() as string)
            }
          }
        })
      }
      )
    }
  })
}

/**
 * 删除指定路径下的所有空文件夹
 * @param {*} path
 */

function rmEmptyDir (path: string): void {
  fs.readdir(path, (err, files) => {
    if (err != null) throw err
    const dirCount = files.length
    if (dirCount > 0) {
      files.forEach(file => {
        stackForRmDir.push(`${path}/${file}`)
      })
      rmEmptyDir(stackForRmDir.last() as string)
    } else {
      if (stackForRmDir.length === 0) {
        console.log(new Notice('结构清理完成'))
        copyNote(noteDir, blogDir, [])
      } else {
        fs.rmdir(path, () => {
          stackForRmDir.pop()
          if (stackForRmDir.length === 0) {
            console.log(new Notice('结构清理完成'))
            copyNote(noteDir, blogDir, [])
          } else { rmEmptyDir(stackForRmDir.last() as string) }
        })
      }
    }
  })
}

export function copyNote (src: string, tar: string, filter = []): void {
  fs.readdir(src, (err, files) => {
    if (err != null) throw err
    let filesCount = files.length
    if (filesCount === 0) {
      if (pairs.length === 0) {
        console.log(new Notice('克隆完成'))
        generateAll(app, generateDir).catch((err) => { console.log(err) })
      } else {
        const dirNode = pairs.pop()
        const src = dirNode?.src
        const tar = dirNode?.tar
        const f = dirNode?.filter
        copyNote(src as string, tar as string, f)
      }
    } else {
      files.forEach(filename => {
        const fileDir = path.join(src, filename)
        const filterFlag = filter.some(item => item === filename)
        if (!filterFlag) {
          fs.stat(fileDir, (err, stats) => {
            if (err != null) throw err
            if (stats.isFile()) {
              const destDir = path.join(tar, filename)
              fs.copyFile(fileDir, destDir, () => { })// 复制文件
            } else { // 创建文件夹
              const tarFiledir = path.join(tar, filename)
              fs.mkdir(tarFiledir, () => { })
              pairs.push(new PairDir(fileDir, tarFiledir, filter))
            }
            filesCount--
            if (filesCount === 0) {
              if (pairs.length === 0) {
                console.log(new Notice('克隆完成'))
                generateAll(app, generateDir).catch((err) => { console.log(err) })
              } else {
                const dirNode = pairs.pop()
                const src = dirNode?.src
                const tar = dirNode?.tar
                const f = dirNode?.filter
                copyNote(src as string, tar as string, f)
              }
            }
          })
        }
      })
    }
  })
}
