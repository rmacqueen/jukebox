jukebox
=======

A wireless, collaborative jukebox. Anyone can connect to the node
server, find a youtube video, and add it to a central youtube playlist

how-to:
-------
1. download this project, navigate to project dir, and run the app:

        node app.js
    
3. log into whatever youtube account you wish the app to access (via OAuth2)
4. go to `http://localhost:8888` in a browser on the computer which is running the app
5. select the youtube playlist you want the app to hijack
6. give everyone on your local network the address to your computer, plus `:8888` (e.g. `192.168.0.3:8888`)
7. search a video, click the winner, and you're cooking

todo:
-----
* make pages look nice
* restrict Rick Astley videos
