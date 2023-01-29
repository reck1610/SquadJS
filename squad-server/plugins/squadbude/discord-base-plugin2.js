import BasePlugin from '../base-plugin.js';

export default class DiscordBasePlugin2 extends BasePlugin {
  static get optionsSpecification() {
    return {
      discordClient: {
        required: true,
        description: 'Discord connector name.',
        connector: 'discord',
        default: 'discord'
      }
    };
  }

  async prepareToMount() {
    this.channel = await this.options.discordClient.channels.fetch(this.options.channelID);
  }

  async sendDiscordMessage(message) {
    await this.channel.send(message);
  }
}
