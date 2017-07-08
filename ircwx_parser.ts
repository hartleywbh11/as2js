/*
 * Copyright (C) 2006-2016  Net-Bits.Net
 *
 * Contact: nucleusae@gmail.com
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 *
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this library; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *  02111-1307  USA.
 */

namespace IRCwxParser {
    "use strict";

    import IRCmUser = NBChatCore.IRCmUser;
    import UserProfileIcons = NBChatCore.UserProfileIcons;
    import UserLevels = NBChatCore.UserLevels;
    import ParserReturnTypes = NBChatCore.ParserReturnItemTypes;

    // ToDo: function getHost(...)

    export function GetNick(dat: string): string {
        //Note: this not in core because it maybe protocol dependent, hence in ircwx parser module. -- 7-Jul-2017 HY
        return (dat.slice(0, dat.indexOf("!")));
    }

    // ToDo: function parse324(...)

    function parseJoin(userstr: string, flags: string, chan: string): NBChatCore.JoinCls { // -- Function converstion completed 19-Dec-2016 HY

        let oUser: IRCmUser = new IRCmUser();
        let pos1: number = -1, pos2: number = -1;

        pos1 = userstr.indexOf("!");
        oUser.nick = userstr.substr(0, pos1);
        pos1++;
        pos2 = userstr.indexOf("@", pos1);
        oUser.fullident = userstr.substr(pos1, (pos2 - pos1));
        pos1 = oUser.fullident.lastIndexOf(".") + 1;
        oUser.ident = oUser.fullident.substr(pos1);
        pos2++;
        oUser.host = userstr.substr(pos2);

        oUser.ilevel = 0;

        switch (flags.charAt(0)) {
            case "A":
                oUser.away = true;
                break;
            case "U":
                oUser.away = false;
                break;
        }

        switch (flags.substr(1, 2)) {
            case "UN":
                oUser.iprofile = UserProfileIcons.NoProfile;
                break;
            case "UP":
                oUser.iprofile = UserProfileIcons.NoGenderWPic;
                break;
            case "FN":
                oUser.iprofile = UserProfileIcons.Female;
                break;
            case "MN":
                oUser.iprofile = UserProfileIcons.Male;
                break;
            case "FP":
                oUser.iprofile = UserProfileIcons.FemaleWPic;
                break;
            case "MP":
                oUser.iprofile = UserProfileIcons.MaleWPic;
                break;
        }

        switch (flags.charAt(3)) {
            case "V":
                oUser.voice = true;
                break;
            case "N":
                oUser.voice = false;
                break;
        }

        if (oUser.nick.charAt(0) === "^") {
            oUser.ilevel = UserLevels.Staff;
        }

        return { user: oUser, ircmChannelName: chan.substr(1) }; //strip colon before channel name
    }

    // ToDo: function parseMode(...)

    // ToDo: parseNamesList(...)

    // **Important Note: kept "NBChatCore." to show which one is used from core modules/namespace. -- HY 26-Dec-2016
    export function parse(ircmsg: string): NBChatCore.CommonParserReturnItem | null { // -- Function converstion partial complete 26-Dec-2016 HY

        if (ircmsg.length > 0) {
            let toks: string[] = [];

            toks = ircmsg.split(" ");

            // if (toks.length > 4) Write("toks[4](u): " + toks[4]);

            switch (toks[0].toLowerCase()) {
                case "error":
                    return { type: ParserReturnTypes.IRCwxError, rval: toks.join(" ") };

                case "ping":
                    return { type: ParserReturnTypes.PingReply, rval: pingReply(toks[1]) };
            }
            // End of switch

            switch (toks[1].toLowerCase()) {
                case "001": // Welcome to the Internet Relay Network
                    return { type: ParserReturnTypes.RPL_001_WELCOME, rval: <NBChatCore.Rpl001Welcome>{ serverName: toks[0], userName: toks[2] } };

                case "251":
                    return { type: ParserReturnTypes.RPL_251_LUSERCLIENT, rval: toks.slice(3).join(" ").substr(1) };

                case "265":
                    return { type: ParserReturnTypes.RPL_265_LOCALUSERS, rval: toks.slice(3).join(" ").substr(1) };

                case "join":
                    return { type: ParserReturnTypes.Join, rval: parseJoin(toks[0], toks[2], toks[3]) };

                case "quit":
                    return { type: ParserReturnTypes.Quit, rval: GetNick(toks[0]) };

                // *** conversion completed till here.

                case "part":
                    return { type: ParserReturnTypes.Quit, rval: <NBChatCore.PartCls>{ nick: GetNick(toks[0]), ircmChannelName: toks[2] } };

                case "notice":
                    //server warning
                    //:SrvNamePanther01 NOTICE WARNING :If you do not auth/register yourself/join a chatroom or you will be disconnected.

                    //channel broadcast
                    //:nick!ident@domain NOTICE %#Channel %#Channel :message.

                    //server broadcast
                    //:nick!ident@domain NOTICE SrvNamePanther01 :message.

                    //private notice
                    //:nick!ident@domain NOTICE %#Channel nick_target :message.

                    //normal notice
                    //:nick!ident@domain NOTICE %#Channel :message.

                    //0: ServerName | Nick
                    //1: not needed
                    //2: server_name | notice_keyword | chan_name
                    //3: chan_name | nick

                    if (toks.length > 4) {
                        return { type: ParserReturnTypes.Notice, rval: <NBChatCore.NoticeBaseCls>{ t0: toks[0], t1: toks[2], t2: toks[3], t3: toks.slice(4).join(" ") } };
                    } else if (toks.length > 3) {
                        return { type: ParserReturnTypes.Notice, rval: <NBChatCore.NoticeBaseCls>{ t0: toks[0], t1: toks[2], t2: toks.slice(3).join(" ") } };
                    }
                    
                    case "kick":
                //        if (toks[3].toLowerCase() == this.UserName.toLowerCase()) _bIsKicked = true; //use same case because server is case-insensitve for nicks.
                //        //Write("MeKicked: KickedNick: " + toks[3] + "; clientNick: " + this.UserName + "; KickedFlag: " + _bIsKicked);
                //        onKick(getNick(toks[0]), toks[2], toks[3], strip(toks.slice(4).join(" ")));
                //        break;

                //    case "privmsg":
                //        if (toks[0].charAt(0) == "%") onChanPrivmsg(toks[0], toks[2], strip(toks.slice(3).join(" ")));
                //        else if (toks[3].charAt(0) == ":") onPrivmsg(getNick(toks[0]), toks[2], toks.slice(3).join(" ").substr(1));
                //        else onPrivmsgPr(getNick(toks[0]), toks[2], toks[3], toks.slice(4).join(" ").substr(1));
                //        break;

                //    case "whisper":
                //        //Format> (:)>Test!0092132f753fba195ff8ce4f53704f74c8@masked WHISPER %#Test >Test2 :message
                //        onWhisper(getNick(toks[0]), toks[2], toks[3], toks.slice(4).join(" ").slice(1));
                //        break;

                //    case "821": //unaway message
                //        /*
                //            Formats>
                //                Personal> 	(:)<user> 821 :User unaway
                //                Channel> 	(:)<user> 821 <chan> :User unaway
                //        */

                //        if (toks[2].indexOf("%") == 0) on821Chan(getNick(toks[0]), toks[2], toks.slice(3).join(" ").slice(1));
                //        else on821Pr(getNick(toks[0]), toks.slice(2).join(" ").slice(1));
                //        break;

                //    case "822": //away message
                //        /*
                //            Formats>
                //                Personal> 	(:)<user> 822 :<user message>
                //                Channel> 	(:)<user> 822 <chan> :<user message>
                //        */
                //        if (toks[2].indexOf("%") == 0) on822Chan(getNick(toks[0]), toks[2], toks.slice(3).join(" ").slice(1));
                //        else on822Pr(getNick(toks[0]), toks.slice(2).join(" ").slice(1));
                //        break;

                //    case "301":
                //        on301(toks[3], toks.slice(4).join(" ").slice(1));
                //        break;

                //    case "302":
                //        on302(toks[2], toks[3].slice(1));
                //        break;

                //    case "353": //names list reply
                //        parseNamesList(ircmsg);
                //        break;

                //    case "366": //names list end reply
                //        onEndofNamesList();
                //        break;

                //    case "324": //channel modes reply
                //        parse324(toks[3], toks[4], toks[5], toks);
                //        break;

                //    case "433": //nick already in use error
                //        //Format> (:)ChatDriveIrcServer.1 433 >Test >Test :Nickname is already in use
                //        onErrorReplies(toks[1], toks[2], toks[3], strip(toks.slice(4).join(" ")));
                //        if (UserName.length < 40) UserName = UserName + random(20000);
                //        else {
                //            UserName = UserName.substr(0, 32);
                //            UserName = UserName + random(20000);
                //        }
                //        if (_bConnectionRegistered == false) onSetNick(UserName);

                //        IRCSend("NICK " + UserName);

                //        if (_IsAuthRequestSent) sendAuthInfo();
                //        break;

                //    case "nick":
                //        //Format> (:)>Test!0092132f753fba195ff8ce4f53704f74c8@masked NICK :>Test10555
                //        onNick(getNick(toks[0]), strip(toks[2]));
                //        break;

                //    case "authuser":
                //        _IsAuthRequestSent = true;

                //        sendAuthInfo();
                //        break;

                //    case "mode":
                //        //parseMode(sFrom, sChan, sModes, sParam, aModes)
                //        //printToks(toks);
                //        parseMode(getNick(toks[0]), toks[2], toks[3], toks[4], toks);
                //        break;

                //    case "341": //invite confirmation
                //        on341(toks[2], toks[3], toks[4]);
                //        break;

                //    case "invite":
                //        onInvite(getNick(toks[0]), toks[2], strip(toks[3]));
                //        break;

                //    case "data":
                //        /*
                //            :<servername> DATA <nickby> <type> :<message>
                //            :<servername> DATA <nickby> PID :<nickof> <pid>
                //            :user@masked DATA <channel> <userto> <tag> :<message>
                //        */
                //        onDataIRC(toks[2], toks[3], strip(toks.slice(4).join(" ")));
                //        onDataIRC2(getNick(toks[0]), toks[2], toks[3], toks[4], strip(toks.slice(5).join(" ")));
                //        break;

                //    case "knock":
                //        onKnock(toks[0], toks[2], strip(toks.slice(3).join(" ")));
                //        break;

                //    case "prop":
                //        onProp(getNick(toks[0]), toks[2], toks[3], strip(toks.slice(4).join(" ")));
                //        break;

                //    case "332":
                //        on332(toks[3], strip(toks.slice(4).join(" ")));
                //        break;

                //    case "801": //IRCRPL_ACCESSADD
                //    case "802": //IRCRPL_ACCESSDELETE
                //    case "803": //IRCRPL_ACCESSSTART
                //    case "804": //IRCRPL_ACCESSLIST
                //    case "805": //IRCRPL_ACCESSEND
                //    case "820": //IRCRPL_ACCESSEND
                //    case "903": //IRCERR_BADLEVEL
                //    case "913": //IRCERR_NOACCESS
                //    case "914": //IRCERR_DUPACCESS
                //    case "915": //IRCERR_MISACCESS
                //    case "916": //IRCERR_TOOMANYACCESSES
                //        onAccessNRelatedReplies(toks[1], ircmsg);
                //        break;

                //    case "900": //IRCERR_BADCOMMAND
                //    case "901": //IRCERR_TOOMANYARGUMENTS
                //    case "925": //IRCERR_TOOMANYARGUMENTS
                //        onAccessNRelatedReplies(toks[1], ircmsg);
                //        break;

                //    case "818":
                //    case "819":
                //        onPropReplies(toks[1], toks[3], ircmsg);
                //        break;

                //    default:
                //        if (isNaN(toks[1]) == false) {
                //            if (toks[1] == "432" && _bConnectionRegistered) {
                //                if (this.UserName[0] != ">") break;
                //            }
                //            onErrorReplies(toks[1], toks[2], toks[3], strip(toks.slice(4).join(" ")));
                //        }

                //        //unhandledCommand(ircmsg);
                //        break;
            }
            // End of switch
        }
        // end if

        return null;
    }

    //Note: Ping reply is part of ircwx protocol, keep it here. 
    function pingReply(s: string): string { //-- Function converstion completed 25-Dec-2016 HY
        return "PONG " + s;
    }

    // ToDo: function strip(dat)

    // ToDo: function unhandledCommand(sCmd) //Comment: not sure about this, will see in the end.

    // ToDo: function sendToChan(chan, msg) //Comment: probably better in the controller but depends on operational flow.

    //Test function
    export function ircmParserTestFun(): boolean {
        return true;
    }
}