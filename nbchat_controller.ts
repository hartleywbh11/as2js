
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
    // </function_pointers>

    // <variables>
    let ServerName: string, UserName: string, bConnectionRegistered: boolean;
     // </variables>

    export function nbChatMain(): number {
        let raw_str: string = "";

        let parser_item: NBChatCore.CommonParserReturnItem = ParserWx.parse(raw_str);

        if (!IsUndefinedOrNull(parser_item)) {

            switch (parser_item.Type) {
                case NBChatCore.ParserReturnItemTypes.PingReply:
                    //ToDo: send it to connection.
                    break;

                case NBChatCore.ParserReturnItemTypes.IRCwxError:
                    handleError(<string>parser_item.ReturnMessage);
                    break;

                case NBChatCore.ParserReturnItemTypes.RPL_001_WELCOME:
                    {
                        let rpl_001 = <NBChatCore.Rpl001Welcome>parser_item.ReturnMessage;
                        ServerName = rpl_001.serverName;
                        UserName = rpl_001.userName;
                        // ToDo: later
                        // onSetNick(this.UserName);
                        bConnectionRegistered = true;
                        GotoChannel();
                    }
                    break;
            }
        }

        return 0;
    }

    function GotoChannel(): void {

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