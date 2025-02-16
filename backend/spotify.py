import requests
import os
from dotenv import load_dotenv

load_dotenv()

def create_playlist(name, description, public=True):
    access_token = os.getenv('ACCESS_TOKEN')
    user_id = os.getenv('USER_ID')

    print(access_token)
    print(user_id)

    url = f"https://api.spotify.com/v1/users/{user_id}/playlists"

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    data = {
        "name": name,
        "description": description,
        "public": public  
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def search_song(name, artist):
    access_token = os.getenv('ACCESS_TOKEN')

    query = f"{name} artist:{artist}"
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    params = {
        "q": query,
        "type": "track",
        "limit": 1
    }

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data['tracks']['items']:
            track = data['tracks']['items'][0]
            return track['uri']
        else:
            print(f"No results found for: {name} - {artist}")
            return None
    else:
        print(f"Search failed for {name}. Error:", response.text)
        return None
    
def add_to_playlist(playlist_id, tracks):
    access_token = os.getenv('ACCESS_TOKEN')

    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "uris": tracks,
        "position": 0
    }

    response = requests.post(url, headers=headers, json=data)
        
    if response.status_code == 201:
        print(f"Added batch of {len(tracks)} tracks to playlist successfully!")
    else:
        print(f"Failed to add batch to playlist. Error:", response.text)


# print(create_playlist("testing", "testing"))
# uris = []
# for name, artist in test_songs:
#     track_uri = search_song(name, artist)
#     if track_uri:
#         uris.append(track_uri)

# playlist = create_playlist("random", "rando")
# add_to_playlist(playlist['id'], uris)
# print(playlist['external_urls']['spotify'])

    

    
