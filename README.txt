/* Cordova and NodeJs*/
1. Ensure that Nodejs is installed:
https://nodejs.org/en/download/

2. Use npm to install Cordova:
npm install -g cordova

3. Add the required cordova platforms to run the app:
cordova platform add android browser

/* MobileUI */
4. Please install MobileUI components:
mobileui install header button input list cover menu grid page alert toast jquery pulltorefresh

5. Install MobileUI fonts (optional):
mobileui install font "Montserrat" 

/* Plugins */
6. Please install the following cordova plugins (required):
6.1. SQLite Storage - database to store data
cordova plugin add cordova-sqlite-storage

6.2 Camera - to take picture of expiry item
cordova plugin add cordova-plugin-camera

6.3 Dialog - to beep on positive button, display alerts and confirmation dialog
cordova plugin add cordova-plugin-dialogs

6.4 Vibration - to vibrate on negative button 
cordova plugin add cordova-plugin-vibration

6.5 File - to store expiry item photos
cordova plugin add cordova-plugin-file

6.6 Social Sharing - to share expiry item details through email
cordova plugin add cordova-plugin-x-socialsharing

6.7 AndroidX Adapter - ensure AndroidX Adapter is installed to use social sharing function
cordova plugin add cordova-plugin-androidx-adapter