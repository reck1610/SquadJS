import BasePlugin from './base-plugin.js';

export default class AdminChatBroadcasts extends BasePlugin {
  static get description() {
    return (
      'The <code>ChatCommands</code> plugin can be configured to make chat commands that broadcast or warn the ' +
      'caller with present messages.'
    );
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      warning: {
        required: false,
        description: 'Warning if this command is used an other chat',
        default: '',
        example: 'Use admin chat for this command!'
      },
      messages: {
        required: true,
        description:
          'An array of objects containing the following properties: ' +
          '<ul>' +
          '<li><code>command</code> - The command that initiates the message.</li>' +
          '<li><code>responses</code> - The messages to respond with.</li>' +
          '<li><code>delay</code> - Delay between messages in ms (defaults to 3s)</li>' +
          '<li><code>warning</code> - warning if used in other chat</li>' +
          '</ul>',
        default: [
          {
            commands: ['stream'],
            responses: ['Wir dulden keine Streamer!', 'We do not tolerate streamers!']
          }
        ]
      }
    };
  }

  async mount() {
    for (const message of this.options.messages) {
      for (const command of message.commands) {
        console.log('register: ' + command.toLowerCase());
        this.server.on(
          `CHAT_COMMAND:${command.toLowerCase()}`,
          async (data) => await this.processMessage(data, message)
        );
      }
    }
  }

  async processMessage(data, message) {
    if (data.chat !== 'ChatAdmin') {
      const warning = this.options.warning || message.warning || '';

      if (warning !== '') {
        await this.server.rcon.warn(data.player.steamID, warning);
      }
      return;
    }

    const responses = message.responses || [];

    for (const response of responses) {
      await this.server.rcon.broadcast(response);

      if (message.delay === 0) {
        continue;
      }
      const delay = message.delay || 3000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
