import { App, CachedMetadata, Notice, TFile } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'

let app: App
let blogPath: string
export async function generateAll (obsidianApp: App, path: string): Promise<void> {
  app = obsidianApp
  blogPath = path
  const files = app.vault.getMarkdownFiles()
  for (const file of files) {
    await generateOnePage(file)
  }
  console.log(new Notice('shadow完成'))
}

async function generateOnePage (currentFile: TFile): Promise<any> {
  // check front matter: shadow:true
  const metadataCache = app.metadataCache
  const frontMatter = (metadataCache.getCache((currentFile).path) as CachedMetadata).frontmatter
  if ((frontMatter != null) && frontMatter.shadow === true) {
    // new text
    const shadowContent = await generateMarkdown(currentFile)
    // create folder
    const filePath = currentFile?.path
    // write file
    const realPath = '../' + blogPath + filePath
    await app.vault.adapter.write(realPath, shadowContent)
  }
}

async function generateMarkdown (file: TFile): Promise<string> {
  const vault = app.vault
  let text = await vault.cachedRead(file)
  text = await convertDataViews(text, file.path)
  return text
}

async function convertDataViews (text: string, path: string): Promise<string> {
  let replacedText = text
  const dataViewRegex: RegExp = /```dataview(.+?)```/gsm
  const dvApi = getAPI()
  const matches = text.matchAll(dataViewRegex)
  if (matches === null) return 'no DataView'

  for (const queryBlock of matches) {
    try {
      const block = queryBlock[0]
      const query = queryBlock[1]
      let markdown = await (dvApi as DataviewApi).tryQueryMarkdown(query, path)
      const filePathRegex: RegExp = /\[\[[^\|]+\|/gsm
      const paths = markdown.matchAll(filePathRegex)
      for (const filepath of paths) {
        markdown = markdown.replace(filepath[0], '[[')
      }
      replacedText = replacedText.replace(block, markdown)
    } catch (e) {
      console.log(new Notice('Unable to render dataview query.'))
      console.log(e)
      return queryBlock[0]
    }
  }
  return replacedText
}
