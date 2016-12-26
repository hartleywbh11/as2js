
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

/// <reference path="ircwx_parser.ts" />

namespace NBChatController {
    //Note: currently using namespace, when all major browsers have support for module loading then it can be changed to module here. --HY 26-Dec-2016.
    import ParserWx = IRCwxParser;

    export function WChatMain(): number {
        let raw_str = "";

        let parser_item = ParserWx.Parse(raw_str);

        switch (parser_item.Type) {
            case NBChatCore.ParserReturnItemTypes.PingReply:
                //ToDo: send it to connection.
        }

        return 0;
    }
}