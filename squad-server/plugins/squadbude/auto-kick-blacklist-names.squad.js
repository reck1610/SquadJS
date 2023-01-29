import BasePlugin from './base-plugin.js';

export default class AutoKickNonLatin extends BasePlugin {
  static get description() {
    return (
      'The <code>AutoKickNonLatin</code> plugin will automatically kick players that have no latin' +
      'characters in their name'
    );
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      kickMessage: {
        required: false,
        description: 'Message to send to players when they are kicked',
        default: 'Unassigned - automatically removed'
      },
      playerThreshold: {
        required: false,
        description:
          'Player count required for AutoKick to start kicking players, set to -1 to disable',
        default: 50
      },
      ignoreAdmins: {
        required: false,
        description:
          '<ul>' +
          '<li><code>true</code>: Admins will <b>NOT</b> be kicked</li>' +
          '<li><code>false</code>: Admins <b>WILL</b> be kicked</li>' +
          '</ul>',
        default: false
      },
      ignoreWhitelist: {
        required: false,
        description:
          '<ul>' +
          '<li><code>true</code>: Reserve slot players will <b>NOT</b> be kicked</li>' +
          '<li><code>false</code>: Reserve slot players <b>WILL</b> be kicked</li>' +
          '</ul>',
        default: false
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.adminPermission = 'canseeadminchat';
    this.whitelistPermission = 'reserve';
  }

  async mount() {
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async unmount() {
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
  }

  async onPlayerConnected(info) {
    const name = info.player.name || '';
    const containsLatinCharacters = name.match(/[a-zA-Z0-9]+/);

    if (name === '' || containsLatinCharacters) {
      return;
    }

    const admins = this.server.getAdminsWithPermission(this.adminPermission);
    const whitelist = this.server.getAdminsWithPermission(this.whitelistPermission);

    const isAdmin = admins.includes(info.player.steamID);
    const isWhitelist = whitelist.includes(info.player.steamID);

    if (isAdmin) {
      this.verbose(2, `Admin with non latin name: ${info.player.name}`);
      if (this.options.ignoreAdmins) {
        return;
      }
    }

    if (isWhitelist) {
      this.verbose(2, `Whitelist player with non latin name: ${info.player.name}`);
      if (this.options.ignoreWhitelist) {
        return;
      }
    }

    if (this.server.players.length < this.options.playerThreshold) {
      this.verbose(2, `Player with non latin name: ${info.player.name}`);
      return;
    }

    this.verbose(2, `Player with non latin name will be kicked: ${info.player.name}`);
    this.server.rcon.kick(info.player.steamID, this.options.kickMessage);
  }
}
