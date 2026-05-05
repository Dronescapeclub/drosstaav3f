I couldn't decide what the name of the bot should be while developing it, so the bot's name might be referred to as either
DroSStAA, DroStAV, DStAA, etc. DM spicyTumors if there are any problems with the code. Code is intended to be run on windows
on VSCode, WebStorm, etc. when running locally (on laptop, PC, all that). Experimenting with 24/7 uptime on KOYEB.

NOTES:
-Procfile starts with "web:" so KOYEB health checks don't scream in console
-.env, credentials.json, and token.json are "keys" to the program & data, DO NOT SHARE PUBLICLY.
-Don't change stuff if you don't know what you're doing (hope thats obvious)
-Theres a dronescape discord account with a test server connected if you don't want to clutter the club channel testing stuff
(email: dronescapeclub@gmail.com, password: [same as the gmail account's password] )
-If it ain't broke don't fix it
-KOYEB utilizes uptimerobot.com to prevent it from going into deep sleep after 1 hour
-uptimerobot account is logged in through dronescapeclub@gmail.com github
-check uptimerobot status at http://stats.uptimerobot.com/s7d6ztQhdv

running on KOYEB:
1:login to KOYEB using dronescapeclub@gmail.com via. signing in through Github, NOT email
    1a: email used is dronescapeclub@gmail.com, password is [same as the gmail account's password]
2: might say "Your Koyeb Pro trial has expired" or something like that, click "manage account" near top right
3: select "dronescapeclub1" instead of "dronescapeclub" in dropdown near the top left, then press wait
4: click "drosstaav3" in "Overview" tab
5: click "Redeploy" button on top right to start/restart the bot
(make sure to check uptimerobot to see why it's shut down for whatever reason)

How to start bot locally on VSCode:
1: download Node.js onto computer
2: right click on the folder named "drosstaa3" and click "Open in Terminal"
3: in the command prompt that opens, type "code ." (WITHOUT THE QUOTATION MARKS)
4: open the console in VSCode (should be opened after step 3) and paste these following commands and press enter for each line:

node -v
npm init -y
npm install discord.js dotenv googleapis readline fs path striptags quoted-printable pm2 discord-interactions


(dont worry about any vulnerabilities that pop up, I swear it wont steal anything...)

5: paste this command into console as well:

npm list --depth=0

...and something similar to this should show:

drosstaa3@1.0.0 C:\Users\Name\Downloads\drosstaa3
├── discord.js@14.19.2
├── dotenv@16.5.0
├── fs@0.0.1-security
├── googleapis@148.0.0
├── js-base64@3.7.7
├── path@0.12.7
├── quoted-printable@1.0.1
├── readline@1.3.0
└── striptags@3.2.0

6: If nothing strange appears, run this command in console to start up bot:

node bot.js

and this log should show up in console:

bot.js: #######BOT ONLINE#######
bot.js: Bot is online as DStAA#6802

(if error shows, try redownloading installations with step 4, or check step 5 for any discreptancies).

NOTE: IF THE COMPUTER SHUTS DOWN OR NODE.JS CANT ACCESS THE INTERNET, RUN STEP 6 IN CONSOLE TO REBOOT



Q&A:

Koyeb cant run the code and/or is broken, what do I do?
    -Likely due to Google OAuth token/refresh token reloading, you need to reacquire it manually on VSCode/WebStorm
        -open the program in VSCode/WebStorm, and delete "token.json" (yes DELETE THE FILE, a new one will be generated)
        -run the code locally on a laptop, (where it says ##BOT ONLINE## in the console etc. etc.)
        -run /dsaa in the #codes discord channel
        -console in WebStorm/VSCode should show something similar to:

        gmail.js: 🔑 Open this URL to authenticate: [https:// random google link or something]
        gmail.js: 🔑 Enter the authorization code:

        -click the link given WHILE YOU ARE LOGGED IN as dronescapeclub@gmail.com
        -accept everything, don't question it. Will eventually transfer you to a seemingly broken page
        -copy everything after "code=" and before "&"
            Ex: http://localhost:3000/?code=4/0ASc3gC0ZUasy_2NzR71pco0qvcPkFLDDjb1BobBcS8k-uslErByBRczIqXqR1gX4wH-TvA&scope=https://www.googleapis.com/auth/gmail.readonly
                copy: 4/0ASc3gC0ZUasy_2NzR71pco0qvcPkFLDDjb1BobBcS8k-uslErByBRczIqXqR1gX4wH-TvA
        -paste code in WebStorm/VSCode
        -/dsaa should correctly output something on discord, console should mention "Token refreshed!"
        //GOOGLE'S AUTHORIZATION TOKEN SHOULD BE REFRESHED FROM NOW ON, FOLLOWING STEPS ARE INPUTTING CORRECT TOKENS INTO KOYEB
        -login to koyeb (instructions on how starting on line 16 of README.txt)
        -go to Services -> drosstaav3 -> Settings -> Environment variables and files (will go back to it later)
        -open "token.json" in the project directory
        -copy everything in the 2nd line after "access_token": that is in quotations
        -paste in Koyeb's Enviroment Variables in the "Value" column for "TOKEN_JSON"
        -copy everything in the 3nd line after "refresh_token":  that is in quotations
        -paste in Koyeb's Enviroment Variables in the "Value" column for "REFRESH_TOKEN"
        -save and deploy on Koyeb With Build
        -should run now yayyyy

The bot is destroying the world, how can i shut it off?
               -doing Ctrl + C in the console will stop the bot from running until you do step 6 again.

     What are the funny values in token.json/.env?
               -dont touch it, its going to break the bot.


     Did you use AI to write the code?
               -uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh


yeah thats all


Self note: Commit and Push on Webstorm to apply webstorm changes to github
removed:
npm uninstall googleapis
npm uninstall quoted-printable
npm uninstall striptags
npm uninstall js-base64
npm uninstall readline

generating GMAIL_PROXY_SECRET in terminal:
-node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
-paste Dv3[the generated hex value];
npm install node-fetch@2

.env
CLIENT_ID=349382700077-4s5rtu2quttmc3ggcabjtdcboli71mbi.apps.googleusercontent.com
CLIENT_SECRET=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
GMAIL_PROXY_SECRET=qqq