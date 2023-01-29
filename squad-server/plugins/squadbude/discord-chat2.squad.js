import DiscordBasePlugin2 from './discord-base-plugin2.js';

export default class DiscordChat2 extends DiscordBasePlugin2 {
  static get description() {
    return 'The <code>DiscordChat</code> plugin will log in-game chat to a Discord channel.';
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin2.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log admin broadcasts to.',
        default: '',
        example: '667741905228136459'
      },
      color: {
        required: false,
        description: 'The color of the embed.',
        default: 'Yellow'
      },
      ignoreChats: {
        required: false,
        default: ['ChatAdmin'],
        description: 'A list of chat names to ignore.'
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onChatMessage = this.onChatMessage.bind(this);
  }

  async mount() {
    this.server.on('CHAT_MESSAGE', this.onChatMessage);
  }

  async unmount() {
    this.server.removeEventListener('CHAT_MESSAGE', this.onChatMessage);
  }

  getChatColor(chat, teamID) {
    switch (chat) {
      case 'ChatAll':
        return 'WHITE';
      case 'ChatTeam':
        return teamID === 1 ? 'BLUE' : 'RED';
      case 'ChatSquad':
        return 'GREEN';
      case 'ChatAdmin':
        return 'AQUA';
    }
    return this.options.color;
  }

  async onChatMessage(info) {
    if (this.options.ignoreChats.includes(info.chat)) return;

    await this.sendDiscordMessage({
      embed: {
        description: `**${info.player.name}** [:link:](https://steamcommunity.com/profiles/${info.steamID}) [:warning:](https://communitybanlist.com/search/${info.steamID})\n ${info.message}`,
        color: this.getChatColor(info.chat, info.player.teamID),
        footer: {
          text: `${info.player.name} • Team: ${info.player.teamID} Squad: ${
            info.player.squadID || 'Unassigned'
          } • ${info.chat}`
        },
        timestamp: info.time.toISOString()
      }
    });
  }
}
