/* 
 *
 * Copyright (C) 2006 - 2016  Net-Bits.Net
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

function parseString(raw) 
	{
		
		if (raw.length > 0)
		{
			var toks = [];
			var ircmsg = (raw.charAt(0) == ":")?raw.substr(1):raw;
			
			//trace incoming
			//Write("received: " + ircmsg);
			AddtoDebugArray("<<:" + ircmsg);
			
			toks = ircmsg.split(" ");
			
			//if (toks.length > 4) Write("toks[4](u): " + toks[4]);
			
			switch (toks[0].toLowerCase()) 
			{
			case "error" :
				handleError(toks.join(" "));
				return;
				
			case "ping" :
				PingReply(toks.slice(1));
				return;
			}
			// End of switch
			
			switch (toks[1].toLowerCase()) 
			{
			case "001" : //Welcome to the Internet Relay Network
				ServerName = toks[0];
				this.UserName = toks[2];
				onSetNick(this.UserName);
				_bConnectionRegistered = true;
				GotoRoom();
				break;
			
			case "251" :
				onNoticeServerMessage(toks.slice(3).join(" ").substr(1));
				break;
				
			case "265" :
				onNoticeServerMessage(toks.slice(3).join(" ").substr(1));
				break;
				
			case "join" :
				parseJoin(toks[0], toks[2], toks[3]);
				break;
				
			case "quit" :
				onQuit(getNick(toks[0]));
				break;
				
			case "part" :
				onPart(getNick(toks[0]), toks[2]);
				break;
				
			case "notice" :
				if (toks[0] == ServerName)
				{
					//Server Message
					if (!_bIsKicked)
					{
						if (toks[2] == "WARNING" && raw.indexOf("join a chatroom") > 0) GotoRoom();
					}
					
					onNoticeServerMessage(toks.slice(2).join(" "));
				}
				else if (toks[3].indexOf("%") == 0)
				{
					//channel broadcast
					onNoticeChanBroadcast(getNick(toks[0]), toks[3], strip(toks.slice(4).join(" ")));
				}
				else if (toks[2].indexOf("%") < 0)
				{
					//server broadcast
					if (_bConnectionRegistered == true) onNoticeServerBroadcast(getNick(toks[0]), strip(toks.slice(3).join(" ")));
					else onNoticeServerMessage(toks.slice(2).join(" "));
				}
				else if (toks[4].indexOf(":") == 0)
				{
					//private notice
					onNoticePrivate(getNick(toks[0]), toks[2], strip(toks.slice(4).join(" ")));
				}
				else
				{
					//normal notice
					onNotice(getNick(toks[0]), toks[2], strip(toks.slice(3).join(" ")));
				}
				break;
			
			case "kick" :
				if (toks[3].toLowerCase() == this.UserName.toLowerCase()) _bIsKicked = true; //use same case because server is case-insensitve for nicks.
				//Write("MeKicked: KickedNick: " + toks[3] + "; clientNick: " + this.UserName + "; KickedFlag: " + _bIsKicked);
				onKick(getNick(toks[0]), toks[2], toks[3], strip(toks.slice(4).join(" ")));
				break;
				
			case "privmsg" :
				if (toks[0].charAt(0) == "%") onChanPrivmsg(toks[0], toks[2], strip(toks.slice(3).join(" ")));
				else if (toks[3].charAt(0) == ":") onPrivmsg(getNick(toks[0]), toks[2], toks.slice(3).join(" ").substr(1));
				else onPrivmsgPr(getNick(toks[0]), toks[2], toks[3], toks.slice(4).join(" ").substr(1));
				break;
				
			case "whisper" :
			//Format> (:)>Test!0092132f753fba195ff8ce4f53704f74c8@masked WHISPER %#Test >Test2 :message
				onWhisper(getNick(toks[0]), toks[2], toks[3], toks.slice(4).join(" ").slice(1));
				break;
				
			case "821" : //unaway message
			/*
				Formats>
					Personal> 	(:)<user> 821 :User unaway
					Channel> 	(:)<user> 821 <chan> :User unaway
			*/
			
				if (toks[2].indexOf("%") == 0) on821Chan(getNick(toks[0]), toks[2], toks.slice(3).join(" ").slice(1));
				else on821Pr(getNick(toks[0]), toks.slice(2).join(" ").slice(1));
				break;
				
			case "822" : //away message
			/*
				Formats>
					Personal> 	(:)<user> 822 :<user message>
					Channel> 	(:)<user> 822 <chan> :<user message>
			*/
				if (toks[2].indexOf("%") == 0) on822Chan(getNick(toks[0]), toks[2], toks.slice(3).join(" ").slice(1));
				else on822Pr(getNick(toks[0]), toks.slice(2).join(" ").slice(1));
				break;
				
			case "301":
				on301(toks[3], toks.slice(4).join(" ").slice(1));
				break;
				
			case "302":
				on302(toks[2], toks[3].slice(1));
				break;
				
			case "353" : //names list reply
				parseNamesList(ircmsg);
				break;
				
			case "366" : //names list end reply
				onEndofNamesList();
				break;
				
			case "324"	: //channel modes reply
				parse324(toks[3], toks[4], toks[5], toks);
				break;
				
			case "433" : //nick already in use error
			//Format> (:)ChatDriveIrcServer.1 433 >Test >Test :Nickname is already in use
				onErrorReplies(toks[1], toks[2], toks[3], strip(toks.slice(4).join(" ")));
				if (UserName.length < 40) UserName = UserName + random(20000);
				else
				{
					UserName = UserName.substr(0, 32);
					UserName = UserName + random(20000);
				}
				if (_bConnectionRegistered == false) onSetNick(UserName);
				
				IRCSend("NICK " + UserName);
				
				if (_IsAuthRequestSent) sendAuthInfo();
				break;
				
			case "nick" :
			//Format> (:)>Test!0092132f753fba195ff8ce4f53704f74c8@masked NICK :>Test10555
				onNick(getNick(toks[0]), strip(toks[2]));
				break;
				
			case "authuser" :
				_IsAuthRequestSent = true;
				
				sendAuthInfo();
				break;
				
			case "mode" :
				//parseMode(sFrom, sChan, sModes, sParam, aModes)
				//printToks(toks);
				parseMode(getNick(toks[0]), toks[2], toks[3], toks[4], toks);
				break;
				
			case "341" : //invite confirmation
				on341(toks[2], toks[3], toks[4]);
				break;
				
			case "invite" :
				onInvite(getNick(toks[0]), toks[2], strip(toks[3]));
				break;
				
			case "data" :
			/*
				:<servername> DATA <nickby> <type> :<message>
				:<servername> DATA <nickby> PID :<nickof> <pid>
				:user@masked DATA <channel> <userto> <tag> :<message>
			*/
				onDataIRC(toks[2], toks[3], strip(toks.slice(4).join(" ")));
				onDataIRC2(getNick(toks[0]), toks[2], toks[3], toks[4], strip(toks.slice(5).join(" ")));
				break;
				
			case "knock" :
				onKnock(toks[0], toks[2], strip(toks.slice(3).join(" ")));
				break;
				
			case "prop" :
				onProp(getNick(toks[0]), toks[2], toks[3], strip(toks.slice(4).join(" ")));
				break;
				
			case "332" :
				on332(toks[3], strip(toks.slice(4).join(" ")));
				break;
				
			case "801": //IRCRPL_ACCESSADD
            case "802": //IRCRPL_ACCESSDELETE
            case "803": //IRCRPL_ACCESSSTART
            case "804": //IRCRPL_ACCESSLIST
            case "805": //IRCRPL_ACCESSEND
            case "820": //IRCRPL_ACCESSEND
            case "903": //IRCERR_BADLEVEL
            case "913": //IRCERR_NOACCESS
            case "914": //IRCERR_DUPACCESS
            case "915": //IRCERR_MISACCESS
            case "916": //IRCERR_TOOMANYACCESSES
				onAccessNRelatedReplies(toks[1], ircmsg);
				break;
				
			case "900": //IRCERR_BADCOMMAND
            case "901": //IRCERR_TOOMANYARGUMENTS
            case "925": //IRCERR_TOOMANYARGUMENTS
               	onAccessNRelatedReplies(toks[1], ircmsg);
            	break;
			
			case "818":
            case "819":
				onPropReplies(toks[1], toks[3], ircmsg);
				break;
				
			default :
				if (isNaN(toks[1]) == false) 
				{
					if (toks[1] == "432" && _bConnectionRegistered)
					{
						if (this.UserName[0] != ">") break;
					}
					onErrorReplies(toks[1], toks[2], toks[3], strip(toks.slice(4).join(" ")));
				}
				
				//unhandledCommand(ircmsg);
				break;
			}
			// End of switch
		}
		// end if
	}
	// End of the function