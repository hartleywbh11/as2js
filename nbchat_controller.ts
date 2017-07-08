
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

namespace NBChatController {
    "use strict";

    //Note: currently using namespace, when all major browsers have support for module loading then it can be changed to module here. --HY 26-Dec-2016.
    // <imports>
    import ParserWx = IRCwxParser;
    // </imports>

    // <function_pointers>
    let fnWriteToPresenter: NBChatCore.fnWriteToPresenterDef;
    let IRCSend: NBChatConnection.fnWriteToConnectionDef; // ToDo: rename later to fnWriteToConnection

    let onNoticeServerMessage: Function;
    let onJoin: Function;
    let onQuit: Function;
    let onPart: Function;
    let onNoticeChanBroadcast: Function;
    let onNoticeServerBroadcast: Function;
    let onNoticePrivate: Function;
    let onNotice: Function;
    // </function_pointers>

    // <variables>
    let debugArray: string[] = [];

    let ServerName: string, UserName: string, bConnectionRegistered: boolean, bIsKicked: boolean;
    // </variables>

    function addToDebugArray(s: string): void { // -- Function converstion completed 25-Dec-2016 HY
        debugArray.push(s);
        if (debugArray.length > 50) {
            debugArray.splice(0, 1);
        }
    }

    // ToDo: function DebugArrayPrint()

    function GotoChannel(): void {

    }

    export function nbChatMain(): number {
        // ToDo:
        return 0;
    }

    function onNbConnectionData(raw_str: string): void {
        if (IsUndefinedOrNull(raw_str)) return;
        if (raw_str.length === 0) return;

        raw_str = (raw_str.charAt(0) === ":") ? raw_str.substr(1) : raw_str;

        // trace incoming
        // Write("received: " + raw_str);
        addToDebugArray("<<:" + raw_str);

        let parser_item: NBChatCore.CommonParserReturnItem | null = ParserWx.parse(raw_str);

        if (parser_item != null) {

            switch (parser_item.type) {
                case NBChatCore.ParserReturnItemTypes.PingReply:
                    IRCSend(<string>parser_item.rval);
                    break;

                case NBChatCore.ParserReturnItemTypes.IRCwxError:
                    handleError(<string>parser_item.rval);
                    break;

                case NBChatCore.ParserReturnItemTypes.RPL_001_WELCOME:
                    {
                        let rpl_001 = <NBChatCore.Rpl001Welcome>parser_item.rval;
                        ServerName = rpl_001.serverName;
                        UserName = rpl_001.userName;
                        // ToDo: later
                        // onSetNick(this.UserName);
                        bConnectionRegistered = true;
                        GotoChannel();
                    }
                    break;

                case NBChatCore.ParserReturnItemTypes.RPL_251_LUSERCLIENT:
                case NBChatCore.ParserReturnItemTypes.RPL_265_LOCALUSERS:
                    onNoticeServerMessage(<string>parser_item.rval);
                    break;

                case NBChatCore.ParserReturnItemTypes.Join:
                    {
                        let join_item = <NBChatCore.JoinCls>parser_item.rval;
                        onJoin(join_item.user, join_item.ircmChannelName);
                    }
                    break;

                case NBChatCore.ParserReturnItemTypes.Quit:
                    onQuit(<string>parser_item.rval);
                    break;

                case NBChatCore.ParserReturnItemTypes.Part:
                    {
                        let part_item = <NBChatCore.PartCls>parser_item.rval;
                        onPart(part_item.nick, part_item.ircmChannelName);
                    }
                    break;

                case NBChatCore.ParserReturnItemTypes.Notice:
                    {
                        let notice_item = <NBChatCore.NoticeBaseCls>parser_item.rval;
                        let text_message = NBChatCore.TrimLeadingColon((notice_item.t3.length == 0) ? notice_item.t2 : notice_item.t3);
                        //t0: server_name | nick
                        //t1: server_name | notice_keyword | chan_name
                        //t2: chan_name | nick | text_message
                        //t3: text_message
                        if (notice_item.t0 == ServerName) {
                            //server message
                            if (!bIsKicked) {
                                if (notice_item.t1 == "WARNING" && text_message.indexOf("join a chatroom") > 0) GotoChannel();
                            }
                            onNoticeServerMessage(notice_item.t1 + " " + text_message);
                        } else if (notice_item.t2.indexOf("%") == 0) {
                            //channel broadcast
                            onNoticeChanBroadcast(ParserWx.GetNick(notice_item.t0), notice_item.t1, text_message);
                        } else if (notice_item.t1.indexOf("%") < 0) {
                            //server broadcast
                            if (bConnectionRegistered) onNoticeServerBroadcast(ParserWx.GetNick(notice_item.t0), text_message);
                            else onNoticeServerMessage(notice_item.t1 + " " + text_message);
                        } else if (notice_item.t3.indexOf(":") < 0) {
                            //private notice
                            onNoticePrivate(ParserWx.GetNick(notice_item.t0), notice_item.t1, text_message);
                        } else {
                            //notice message general handler
                            onNotice(ParserWx.GetNick(notice_item.t0), notice_item.t1, text_message)
                        }
                    }
                    break;
            }
        }
    }

    function WriteToPresenter(s: string): void { //-- Function converstion completed 25-Dec-2016 HY
        fnWriteToPresenter(s);
    }

    // ** Presenter functions here; they will be moved later.
    function handleError(sError: string): void { // -- Function converstion completed 25-Dec-2016 HY
        // ToDo: move out presentation logic from parser.
        WriteToPresenter("<font color='#FF0000'>Error: " + sError + "</font>");
    }
}