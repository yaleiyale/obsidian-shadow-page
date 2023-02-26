import { Notice, Plugin } from 'obsidian'
import { cloneDir } from './file-helper'
import { ShadowPageSettingTab } from './settings-tab'
export default class ShadowPage extends Plugin {
  config!: Config
  async onload (): Promise<void> {
    console.log('Loading ShadowPage plugin.')
    await this.loadSettings()
    this.addSettingTab(new ShadowPageSettingTab(this.app, this))
    // Execute Build
    this.addCommand({
      id: 'shadow-page',
      name: 'shadow page',
      callback: () => {
        if (this.config.vaultPath === '' || this.config.notePath === '' || this.config.blogPath === '') {
          console.log(new Notice('参数未初始化'))
        } else {
          cloneDir(this.config.vaultPath, this.config.blogPath, this.config.notePath, this.app)
        }
      },
      hotkeys: []
    })
  }

  onunload (): void {
    console.log('Unloading ShadowPage plugin')
  }

  // Load settings infromation
  async loadSettings (): Promise<void> {
    this.config = Object.assign({}, DEFAULT_CONFIG, await this.loadData())
  }

  // When saving settings
  async saveSettings (): Promise<void> {
    await this.saveData(this.config)
  }
}

interface Config {
  vaultPath: string
  notePath: string
  blogPath: string
}

const DEFAULT_CONFIG: Config = {
  vaultPath: '',
  notePath: '',
  blogPath: ''
}
