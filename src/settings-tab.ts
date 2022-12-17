import {
  App,
  PluginSettingTab,
  Setting
} from 'obsidian'
import ShadowPage from './main'

export class ShadowPageSettingTab extends PluginSettingTab {
  private readonly plugin: ShadowPage
  constructor (app: App, plugin: ShadowPage) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const parms = this.plugin.config
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('上级路径')
      .setDesc('D:/vault/')
      .addText((text) => {
        text
          .setValue(parms.vaultPath)
          .onChange(async (value) => {
            parms.vaultPath = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('当前文件夹')
      .setDesc('note/')
      .addText((text) => {
        text
          .setValue(parms.notePath)
          .onChange(async (value) => {
            parms.notePath = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('目标文件夹')
      .setDesc('content/')
      .addText((text) => {
        text
          .setValue(parms.blogPath)
          .onChange(async (value) => {
            parms.blogPath = value
            await this.plugin.saveSettings()
          })
      })
  }
}
