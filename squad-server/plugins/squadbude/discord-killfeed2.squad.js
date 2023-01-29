import DiscordBasePlugin2 from './discord-base-plugin2.js';

export default class DiscordKillFeed2 extends DiscordBasePlugin2 {
  static get description() {
    return (
      'The <code>DiscordKillFeed2</code> plugin logs all wounds and related information to a Discord channel for ' +
      'admins to review. This is a compact version with teamkill indicator.'
    );
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      ...DiscordBasePlugin2.optionsSpecification,
      channelID: {
        required: true,
        description: 'The ID of the channel to log teamkills to.',
        default: '',
        example: '667741905228136459'
      },
      color: {
        required: false,
        description: 'The color of the embeds.',
        default: 16761867
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onWound = this.onWound.bind(this);
  }

  async mount() {
    this.server.on('PLAYER_WOUNDED', this.onWound);
  }

  async unmount() {
    this.server.removeEventListener('PLAYER_WOUNDED', this.onWound);
  }

  async onWound(info) {
    if (!info.attacker) return;

    const fields = [
      {
        name: 'Attacker',
        value: `${info.attacker.name} [:link:](https://steamcommunity.com/profiles/${info.attacker.steamID}) [:warning:](https://communitybanlist.com/search/${info.attacker.steamID})`,
        inline: true
      },
      {
        name: "Victim's Name",
        value: info.victim
          ? `${info.victim.name} [:link:](https://steamcommunity.com/profiles/${info.victim.steamID})`
          : 'Unknown',
        inline: true
      }
    ];

    let type = 'Kill';
    let color = 'GREEN';
    if (info.teamkill) {
      type = 'Teamkill';
      color = 'RED';
    }
    if (info.attacker.steamID === info.victim.steamID) {
      type = 'Suicide';
      color = 'YELLOW';
    }

    await this.sendDiscordMessage({
      embed: {
        title: `${type}: ${info.weapon}`,
        color: color,
        fields: fields,
        timestamp: info.time.toISOString()
      }
    });
  }
}
