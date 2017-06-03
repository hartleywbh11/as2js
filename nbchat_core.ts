
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
        PingReply,
        IRCwxError,
        RPL_001_WELCOME,
        RPL_251_LUSERCLIENT,
        RPL_265_LOCALUSERS,
        Join,
        Quit,
        Part,
        Notice
    }

    export type fnWriteToPresenterDef = (s: string) => void;

    export class Rpl001Welcome {
        serverName: string;
        userName: string;
    }

    export const enum UserLevels {
        Staff = 128,
        Superowner = 64,
        Owner = 32,
        Host = 16,
        Helpop = 8
    }

    export const enum UserProfileIcons {
        NoProfile = 0,
        NoGender,
        NoGenderWPic,
        Female,
        FemaleWPic,
        Male,
        MaleWPic
    }

    export class IRCmUser {
        nick: string;
        fullident: string;
        ident: string;
        host: string;
        ilevel: number = 0;
        iprofile: number = 0;
        away: boolean = false;
        awaymsg: string = "";
        voice: boolean = false;
        ignore: boolean = false;
    }

    export class JoinCls {
        user: IRCmUser;
        ircmChannelName: string;
    }

    export class PartCls {
        nick: string;
        ircmChannelName: string;
    }

    export class NoticeBaseCls {
        t0: string;
        t1: string;
        t2: string;
        t3: string;
    }

    export class CommonParserReturnItem {
        type: ParserReturnItemTypes;

        // Returned value
        rval: string | Rpl001Welcome | JoinCls | PartCls | NoticeBaseCls;
    }
}