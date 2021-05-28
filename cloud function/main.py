import os
import spotipy
import pandas as pd
import random
import sklearn
import numpy as np
from sklearn.ensemble import IsolationForest

def getIdFromArtist(artist_name, sp):
    response = sp.search(q=artist_name,type='artist',limit=1)
    return response['artists']['items'][0]['id']

def getIdFromTrack(track_name, sp):
    response = sp.search(q=track_name,type='track',limit=1)
    return response['tracks']['items'][0]['id']

def getPlaylistId(playlist_name, sp):
    playlists = sp.current_user_playlists()
    for playlist in playlists['items']:
        if playlist['name'] == playlist_name:
            return playlist['id']
    return None 
 
def playlist_from_artists(artists_names, playlist_name, user_id, sp):
    songs = []
    for name in artists_names:
        name_id = getIdFromArtist(name,sp)
        response = sp.artist_top_tracks(name_id)
        songs += [track['id'] for track in response['tracks']]
    
    random.shuffle(songs)

    response = sp.user_playlist_create(user_id,playlist_name, public = True, description="RecomMusic")
    playlist_id = getPlaylistId(playlist_name,sp)
    response = sp.playlist_add_items(playlist_id,songs)

def complete_recommender(option, data, playlist_name, sp):
    if option == 'artists':
        artists = data.split(',')
        artists_id = [getIdFromArtist(artist, sp) for artist in artists]
        response = sp.recommendations(seed_artists=artists_id)

    elif option == 'tracks':
        tracks = data.split(',')
        tracks_id = [getIdFromTrack(track, sp) for track in tracks]
        response = sp.recommendations(seed_tracks=tracks_id)
    
    elif option == 'genre':
        genres = data.split(',')
        response = sp.recommendations(seed_genres=genres)

    songs = [track['id'] for track in response['tracks']]
    playlist = sp.user_playlist_create(sp.current_user()['id'], playlist_name, public = True, description="RecomMusic")
    response = sp.playlist_add_items(playlist['id'],songs)

def get_playlist_audio_features(username, playlist_id, sp):
    offset = 0
    songs = []
    ids = []
    while True:
        content = sp.user_playlist_tracks(username, playlist_id, fields=None, limit=100, offset=offset, market=None)
        songs += content['items']
        if content['next'] is not None:
            offset += 100
        else:
            break

    for i in songs:
        ids.append(i['track']['id'])

    index = 0
    audio_features = []
    while index < len(ids):
        audio_features += sp.audio_features(ids[index:index + 50])
        index += 50

    features_list = []
    for features in audio_features:
        features_list.append([features['energy'], features['liveness'], features['speechiness'], features['acousticness'], features['danceability']])
    df = pd.DataFrame(features_list, columns=['energy', 'liveness', 'speechiness', 'acousticness', 'danceability'])
    df = pd.DataFrame([df.mean()])
    return """<canvas id='myChart' width='200' height='200'></canvas>
    <script>
    var ctx = document.getElementById('myChart');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Energy', 'Liveness', 'Speechiness', 'Acousticness', 'Danceability'],
            datasets: [{
                label: '# of Votes',
                data: """ + str([df['energy'][0] , df['liveness'][0], df['speechiness'][0], df['acousticness'][0], df['danceability'][0]]) + """,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    </script>"""

def create_features_dataset(track_ids, sp):
    #a partir d'unt conjunt d'ids de cançons es crea un dataset amb les característiques músicals
    features = []
    del_ind = [11,12,13,14,15]
    audio_an = sp.audio_features(track_ids)
    for song_ft in audio_an:
        features.append(list(song_ft.values()))

    features = np.array(features)
    features = np.delete(features, del_ind, axis=1)

    return features

def would_user_like_track(sp, track_name):
    del_ind = [11,12,13,14,15]

    tracks = sp.current_user_top_tracks(limit=25, time_range='short_term')
    track_ids = [tracks['items'][i]['id'] for i in range(len(tracks['items']))]

    tracks = sp.current_user_top_tracks(limit=25, time_range='medium_term')
    track_ids += [tracks['items'][i]['id'] for i in range(len(tracks['items']))]

    tracks = sp.current_user_top_tracks(limit=25, time_range='long_term')
    track_ids += [tracks['items'][i]['id'] for i in range(len(tracks['items']))]


    features = create_features_dataset(track_ids , sp)
    
    pred_track_id = sp.search(q=track_name, type='track')['tracks']['items'][0]['id']
    audio_an_pred = np.array(list(sp.audio_features(pred_track_id)[0].values()))

    audio_an_pred = np.delete(audio_an_pred, del_ind, axis=0)
    audio_an_pred = audio_an_pred.reshape((1, audio_an_pred.shape[0]))

    features = features.astype(float)
    audio_an_pred = audio_an_pred.astype(float)

    model = IsolationForest().fit(features)
    

    pred = model.predict(audio_an_pred)

    if pred[0] == 1:
        return 'You will like this song :)'
    if pred[0] == -1:
        return "You won't like this song :("

def related_following_artists(artists_names, playlist_name, user_id, sp):
    songs = []
    for artist in artists_names["artists"]["items"]:
        name_id = getIdFromArtist(artist["name"],sp)
        response = sp.artist_related_artists(name_id)
        for artist in response["artists"]:
            top_songs = sp.artist_top_tracks(artist['id'])
            if len(songs) <= 90:
                songs += [track['id'] for track in top_songs['tracks']]
                random.shuffle(songs)

    response = sp.user_playlist_create(user_id,playlist_name, public = True, description="RecomMusic")
    playlist_id = getPlaylistId(playlist_name,sp)
    response = sp.playlist_add_items(playlist_id,songs)

def start_point(request):
    
    os.environ['SPOTIPY_CLIENT_ID'] = 'f3864cc367934305aac6f0bbf785b377'
    os.environ['SPOTIPY_CLIENT_SECRET'] = 'ddbba0b3368f47ae8197e13e26c556b9'

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    try:
        token = request.args.get("token")
        option = request.args.get("option")

        sp = spotipy.Spotify(auth=token)
        user = sp.current_user()
        data = request.get_json()

        if option == 'basic':
            artists_names = data['Names'].split(',')
            playlist_name = data['playlist_name']
            playlist_from_artists(artists_names, playlist_name, user['id'], sp)            
            return ('Done! Check your Spotify :)', 200, headers)

        elif option == 'graphics':
            playlist_name = data['playlist_name']
            chart = get_playlist_audio_features(user['id'], getPlaylistId(playlist_name, sp), sp)
            return (chart, 200, headers)

        elif option == 'complete':
            data_type = data['data_type']
            input_data = data['Data']
            playlist_name = data['playlist_name']
            complete_recommender(data_type, input_data, playlist_name, sp)
            return ('Done! Check your Spotify :)', 200, headers)
        
        elif option == 'would_like':
            track_name = data['track_name']
            return (would_user_like_track(sp, track_name), 200, headers)
        
        elif option == 'personal':
            playlist_name = data['playlist_name']
            followed = sp.current_user_followed_artists(10)
            related_following_artists(followed, playlist_name, user['id'], sp)
            return ('Done! Check your Spotify :)', 200, headers)
            
    except:
        return ('Error', 200, headers)


    
