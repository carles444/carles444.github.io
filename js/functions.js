
var webUrl = 'https://carles444.github.io/'
var clientID = 'f3864cc367934305aac6f0bbf785b377';
var clietnSecrt = 'ddbba0b3368f47ae8197e13e26c556b9';
var Token = null;

currentUrl = window.location.href;
if(currentUrl.includes('access_token')){
    pos = currentUrl.indexOf('=')
    Token = currentUrl.slice(pos+1, currentUrl.length)
}

alert(Token);


function authorization(){
    params = 'client_id='+clientID+'&response_type=token&redirect_uri='+webUrl;
    scopes = '&scope=playlist-modify-public user-top-read';
    window.location.href = 'https://accounts.spotify.com/authorize?'+params+scopes;
    console.log(params+scopes);

}