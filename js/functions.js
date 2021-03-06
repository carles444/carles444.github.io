
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
        document.getElementById('complete_rec').style.display = 'block'
        document.getElementById('would_like_rec').style.display = 'block'
        document.getElementById('personal_rec').style.display = 'block'


    } else{
        document.getElementById('auth_but').textContent = 'GET ACCESS'
        document.getElementById('basic_rec').style.display = 'none'
        document.getElementById('artists_rec').style.display = 'none'
        document.getElementById('complete_rec').style.display = 'none'
        document.getElementById('would_like_rec').style.display = 'none'
        document.getElementById('personal_rec').style.display = 'none'

    }
    if(document.getElementById('response').innerHTML != ''){
        document.getElementById('clear_button').style.display = 'none'
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

function authorization(){
    params = 'client_id='+clientID+'&response_type=token&redirect_uri='+webUrl;
    scopes = '&scope=playlist-modify-public user-top-read playlist-modify-private playlist-read-private user-follow-read user-top-read';
    window.location.href = 'https://accounts.spotify.com/authorize?'+params+scopes;
    console.log(params+scopes);

}

function request_option(option_name, input_data){
    params = '?token='+Token+'&option='+option_name;
    ajax_request_jquery('response', params, input_data);
    document.getElementById('clear_button').style.display = 'block';

}


function basic_recom(){
    artist_name = document.getElementById('artist_name').value;
    playlist_name = document.getElementById('playlist_name_basic').value;
    json_input = JSON.stringify({'Names': artist_name, 'playlist_name': playlist_name});
    request_option('basic', json_input);
    show_hide_form('basic_form');
}

function would_like(){
    track_name = document.getElementById('track_name_would').value;
    json_input = JSON.stringify({'track_name': track_name});
    request_option('would_like', json_input);
    show_hide_form('would_like_form');
}

function graphics_recom(){
    playlist_name = document.getElementById('playlist_name_graphics').value;
    json_input = JSON.stringify({'playlist_name': playlist_name});
    request_option('graphics', json_input);
    show_hide_form('graphics_form');
}

function personal_recom(){
    playlist_name = document.getElementById('playlist_name_personal').value;
    json_input = JSON.stringify({'playlist_name': playlist_name});
    request_option('personal', json_input);
    show_hide_form('personal_form');
}

function complete_recom(){
    data = document.getElementById('data_complete').value;
    playlist_name = document.getElementById('playlist_name_complete').value;
    data_type = document.getElementById('complete_select').value;
    json_input = JSON.stringify({'Data': data, 'playlist_name': playlist_name, 'data_type': data_type});
    request_option('complete', json_input);
    show_hide_form('complete_form');
}

function clear_response(){
    document.getElementById('response').innerHTML = '';
    document.getElementById('clear_button').style.display = 'none';
}

function show_hide_form(content_id){
    if(document.getElementById(content_id).style.display == 'block')
        document.getElementById(content_id).style.display = 'none';
    else
        document.getElementById(content_id).style.display = 'block';
}


