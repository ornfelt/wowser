import EventEmitter from 'events';

import Message from './message';
import GamePacket from '../packet';
import GameOpcode from '../opcode';
import ChatEnum from './chatEnum';

class ChatHandler extends EventEmitter {

  // Creates a new chat handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;
    this.playerNames = this.session.game.playerNames;

    var welcome = new Message('system', 'Welcome to Drassil WoW Web Client! [ Chat developed by ornfelt ]',0);

    // Holds messages
    this.sayMessages = [
        welcome,
        new Message('info', 'This is an info message',0),
        new Message('error', 'This is an error message',0),
        new Message('area', 'Player: This is a message emitted nearby',0),
        new Message('whisper outgoing', 'To Someone: This is an outgoing whisper',0),
        new Message('whisper incoming', 'Someone: This is an incoming whisper',0)
    ];

    this.guildMessages = [
        welcome,
        new Message('guild', '[Guild] Someone: This is your guild channel (if you have a guild)',0)
    ];
    this.worldMessages = [
        welcome,
        new Message('channel', '[World]: This is the official world channel',0),
    ]

    this.logsMessages = [
        welcome,
        new Message('info', '[Logs]: This is a log window',0),
    ]

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_GM_MESSAGECHAT', ::this.handleGmMessage);
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', ::this.handleMessage);
  }

  // Creates chat message
  create() {
    return new Message();
  }

  // Sends given message
  send(_message,type) {
    var size=64+_message.length;

    var channel = ChatEnum.channel+"\0";


    if (type==ChatEnum.CHAT_MSG_CHANNEL) {
        size += channel.length;
    }

    const app = new GamePacket(GameOpcode.CMSG_MESSAGE_CHAT, size);
    app.writeUnsignedInt(type); // type
    app.writeUnsignedInt(0); // lang , 0: universal [TODO: use race specific ]

    switch(type) {
        case ChatEnum.CHAT_MSG_SAY:
        case ChatEnum.CHAT_MSG_GUILD:
              app.writeString(_message);
        break;
        case ChatEnum.CHAT_MSG_CHANNEL:
              app.writeString(channel);
              app.writeString(_message);
        break;
    }

    this.session.game.send(app);
    return true;
  }

  handleGmMessage(gp) {
    this.handleMessage(gp,true);
  }

  // Message handler (SMSG_MESSAGE_CHAT)
  handleMessage(gp,isGm) {
    var guid2 = 0;

    const type = gp.readUnsignedByte(); // type
    const lang = gp.readUnsignedInt(); // language
    const guid1 = gp.readGUID();
    const unk1 = gp.readUnsignedInt();

    if (isGm === true)
    {
        var nameLen =  gp.readUnsignedInt();
        var senderName = gp.readString(nameLen);

        this.playerNames[guid1.low] = {
            name : senderName,
            isGm : true
        };

    } else {
        if (!this.playerNames[guid1.low]) {
            this.playerNames[guid1.low]= { name: guid1.low };
            this.session.game.askName(guid1);
        }
    }

    var channelName="";

    var len = 0;
    var text = "";
    var flags = 0;
    var senderName = "";
    var recvGuid = "";

    switch(type) {
      case ChatEnum.CHAT_MSG_CHANNEL:
        // hardcoded channel
        channelName = gp.readString(5);
        if (channelName !== ChatEnum.channel)
          return;

        var _unk=gp.readUnsignedInt();
        len = gp.length - gp.index - 1; // channel buffer min size

        text = gp.readString(len);
        break;

      case ChatEnum.CHAT_MSG_WHISPER_FOREIGN:
        len = gp.readUnsignedInt();
        senderName = gp.readString(len);

        recvGuid = gp.readGUID();

        if (!this.playerNames[recvGuid.low]) {
            this.playerNames[recvGuid.low]= { name: recvGuid.low };
            this.session.game.askName(recvGuid);
        }
      break;
      default:
        guid2 = gp.readGUID(); // guid2

        if (!this.playerNames[guid2.low]) {
            this.playerNames[guid2.low]= { name: guid2.low };
            this.session.game.askName(guid2);
        }

        len = gp.readUnsignedInt();

        text = gp.readString(len);
        flags = gp.readUnsignedByte(); // flags
      break;
    }

    const message = null;

    switch(type) {
        case ChatEnum.CHAT_MSG_SAY:
            message = new Message("area", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_SYSTEM:
            message = new Message("system", text, 0); // hardcoded guid
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_EMOTE:
            message = new Message("me", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_YELL:
            message = new Message("yell", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_GUILD:
            message = new Message("guild", text, guid1.low);
            this.guildMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_CHANNEL:
            message = new Message("channel", text, guid1.low);
            this.worldMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_WHISPER:
            message = new Message("whisper incoming", text, guid1.low, guid2.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_WHISPER_FOREIGN:
            message = new Message("whisper incoming", text, senderName, recvGuid.low);
            this.sayMessages.push(message);
        break;
        default:
            message = new Message("info", text, guid1.low);
            this.logsMessages.push(message);
        break;
    }

    this.emit('message', message);
  }

}

export default ChatHandler;
