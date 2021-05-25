
var webUrl = 'https://carles444.github.io/';
var clientID = 'f3864cc367934305aac6f0bbf785b377';
var clietnSecret = 'ddbba0b3368f47ae8197e13e26c556b9';
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


function ajax_request_jquery(element, params, input_data) {
    $.ajax({type: "POST", 
            url: server_url + params,
            contentType: "application/json", 
            data: input_data,
            success: function (result) { $('#'+element).html(result);}
    });
}

function request_hello_world() {
    $.ajax({
        type: 'POST',
        contentType: "application/json", 
        url: server_url + '?token=' + Token, 
        data: JSON.stringify({Names: 'Bad Bunny'}),
        success: function(data) { alert(data); }
    });
}

function authorization(){
    params = 'client_id='+clientID+'&response_type=token&redirect_uri='+webUrl;
    scopes = '&scope=playlist-modify-public user-top-read playlist-modify-private playlist-read-private';
    window.location.href = 'https://accounts.spotify.com/authorize?'+params+scopes;
    console.log(params+scopes);

}

function request_option(option_name, input_data){
    params = '?token='+Token+'&option='+option_name;
    ajax_request_jquery('response', params, input_data);
}


function basic_recom(){
    artist_name = document.getElementById('artist_name').value;
    playlist_name = document.getElementById('playlist_name').value;
    json_input = JSON.stringify({'Names': artist_name, 'playlist_name': playlist_name});
    request_option('basic', json_input);
    show_hide_form('basic_form');
}

function graphics_recom(){
    request_option('graphics', null);
    show_hide_form('graphics_form');
}

function show_hide_form(content_id){
    if(document.getElementById(content_id).style.display == 'block')
        document.getElementById(content_id).style.display = 'none';
    else
        document.getElementById(content_id).style.display = 'block';
}


