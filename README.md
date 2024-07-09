# Phonos
A node.js express voice recorder and listener app 

The entirety of the client's code was developed for the "Web Systems" subject in the third year of the "Computer Engineering" university degree. It contains some very good code, some mediocre code and bunch of horrible, spaguetti code. I'm publishing it here for the sake of posterity.

(All texts are in spanish, due to the language of the course)

## Description
This application provides some functionalities:
- Audio recording
- Audio playback with effects
- Audio saving and restoring via account (native, google or github)
- Public link audio sharing


And it's made using node.js with the express web framework and mongodb as database.

## Warning

This application does not come with ANY security guarantees of any kind. It is shown here as an academic concept. If you choose to self host this, it is heavily recomended to harden your express instance (the _app.js_ file). For more information, see [production express best practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## Screenshot
![image](https://github.com/nicoagr/Phonos/assets/61473739/169a0be4-91d7-4c5b-aaec-6f62d1df7e9f)
### Running
1. Clone the repository
2. Install node js and npm (if not already present)
3. cd into the project's directory and execute "npm install" in the command line
4. Execute "npm run bin/www" from cmd

### Legal
*This project does NOT have an open-source license. For more information about open source licenses, click [here](https://opensource.org/faq). If you want more information about what does mean to NOT have an open-source license, click [here](https://choosealicense.com/no-permission/)*
