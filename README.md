GETPKK
======

Demonstration for [rosreestr2pkk](https://github.com/rendrom/rosreestr2coord) script

# Development

## Server side

    virtualenv ./.env
    
    . ./.env/bin/activate
    
    pip install -r requirements.txt
    
    cp ./prj/local_settings.template ./prj/local_settings.py
    
    vim ./prj/local_settings.py # insert you settings

    ./manage.py migrate
    
    ./manage.py collectstatic --noinput # for prod
    
    ./manage.py runserver # run dev server on localhost:8000
    
## Client side

    cd ./pkk/client

    npm install
    
    npm install -g webpack
     
build
    
    npm run build
    
dev
    
    webpack
    
and watch

    webpack -w