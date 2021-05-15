
var webUrl = 'https://carles444.github.io/'
var clientID = 'f3864cc367934305aac6f0bbf785b377';
var clietnSecrt = 'ddbba0b3368f47ae8197e13e26c556b9';

function authorization(){
    params = 'client_id='+clientID+'&response_type=token&redirect_uri='+webUrl;
    window.location.href = 'https://accounts.spotify.com/authorize?'+params;

}