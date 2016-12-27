# Description
It is a conversion project for flash/actionscript components of Net-Bits.Net Webchat to Typescript.
Source files to convert are here:
- https://github.com/net-bits-net/nbwebchat_v3/blob/master/FlashComponent/ajaxfc.fla.code.as
- https://github.com/net-bits-net/nbwebchat_v3/blob/master/FlashComponent/NBClasses/chatsocket.as

Anyone can contribute by forking the master and submit updates to be incorporated into the master.

Any help is appreciated :)

#Instructions
- Since I'm most familiar with flash/actionscript code, I'll add to .ts files functions to translate.
- Make a comment next to the function name when you are starting to work on a function so there are no double work or conflicts with other people translating code. For example:
```sh
 export function Parse(raw: string): NBChatCore.CommonParserReturnItem { //-- Function converstion partial complete 26-Dec-2016 HY
 ```
 - When done update the comment to show it is completed. For example:
```sh
 function PingReply(s: string) : string { //-- Function converstion completed 25-Dec-2016 HY
 ```
 - If there is a problem/bug/fix needed in your translated code, fix it please unless you are leaving the project then somebody else will take over. Any new person would need time to understand it and best person to fix the code is the person who has written it, hence, this rule. But this is not hard and fast rule, it is just to keep things easier to manage.
 - Our Typescript projects follow standard guidelines and conventions of MS Typescript project: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines . But naming for module local or function local variable like "let parser_item = ..." that improves readability is ok.
 
