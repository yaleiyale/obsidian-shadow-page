import { CachedMetadata, Notice, Plugin, TFile } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'
export default class ShadowpagePlugin extends Plugin {
  onload (): void {
    console.log('Loading ShadowPage plugin.')
    // Execute Build
    this.addCommand({
      id: 'generate-shadow-page',
      name: 'generate shadow page',
      callback: async () => {
        await this.generateAll()
      },
      hotkeys: []
    })
  }

  onunload (): void {
    console.log('Unloading ShadowPage plugin')
  }

  async generateAll ():Promise<void> {
    const files = this.app.vault.getMarkdownFiles()
    for (const file of files) {
      await this.generateOnePage(file)
    }
    console.log(new Notice('shadow done'))
  }

  async generateOnePage (currentFile: TFile): Promise<any> {
    // check front matter: shadow:true
    const metadataCache = this.app.metadataCache
    const frontMatter = (metadataCache.getCache((currentFile).path) as CachedMetadata).frontmatter
    if ((frontMatter != null) && frontMatter.shadow === true) {
      // new text
      const shadowContent = await this.generateMarkdown(currentFile)
      // create folder
      const path = currentFile?.path
      const folder = path.replace('/' + (currentFile).name, '')
      if (!await this.app.vault.adapter.exists(folder)) {
        await this.app.vault.createFolder(folder)
      }
      // write file
      await this.app.vault.adapter.write(path, shadowContent)
    }
  }

  async generateMarkdown (file: TFile): Promise<string> {
    const vault = this.app.vault
    let text = await vault.cachedRead(file)
    text = await this.convertDataViews(text, file.path)
    return text
  }

  async convertDataViews (text: string, path: string): Promise<string> {
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
          console.log(filepath[0])
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
}
