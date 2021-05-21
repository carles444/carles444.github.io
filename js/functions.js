
var webUrl = 'https://carles444.github.io/';
var clientID = 'f3864cc367934305aac6f0bbf785b377';
var clietnSecrt = 'ddbba0b3368f47ae8197e13e26c556b9';
var Token = null;
var server_url = 'https://europe-west1-graphite-hook-310809.cloudfunctions.net/RecoMusic';

currentUrl = window.location.href;

function init(){
    if(currentUrl.includes('access_token')){
        pos = currentUrl.indexOf('=')
        Token = currentUrl.slice(pos+1, currentUrl.length)
        document.getElementById('auth_but').textContent = 'REFRESH SESSION'
        document.getElementById('basic_rec').style.display = 'block'
        document.getElementById('artists_rec').style.display = 'block'

    } else{
        document.getElementById('auth_but').textContent = 'GET ACCESS'
        document.getElementById('basic_rec').style.display = 'none'
        document.getElementById('artists_rec').style.display = 'none'
    }
}

function ajax_request_jquery(element, params) {
    $.ajax({type: "GET", url: server_url + params, success:
            function (result) { $('#'+element).html(result);}
    });
}

function authorization(){
    params = 'client_id='+clientID+'&response_type=token&redirect_uri='+webUrl;
    scopes = '&scope=playlist-modify-public user-top-read';
    window.location.href = 'https://accounts.spotify.com/authorize?'+params+scopes;
    console.log(params+scopes);

}

function request_option(option_name){
    params = '?token='+Token+'&option='+option_name;
    ajax_request_jquery('response', params);
}