
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

function IsUndefinedOrNull(object: any): boolean {
    "use strict";
    if (object === undefined || object === null) { return true; }
    return false;
}

namespace NBChatCore {
    "use strict";

    export const enum ParserReturnItemTypes {
        Undefined = 0,
        PingReply
    }

    export class CommonParserReturnItem {
        Type: ParserReturnItemTypes;
        ReturnMessage: string;
    }
}