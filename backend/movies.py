from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_READ_TOKEN = os.getenv('TMDB_READ_TOKEN')

def getRequestToken():
    response = requests.get(
        "https://api.themoviedb.org/3/authentication/token/new",
        params={'api_key': TMDB_API_KEY}
    )
    
    if response.status_code != 200:
        return None
    return response.json().get('request_token')

def createSession(request_token):
    response = requests.post(
        "https://api.themoviedb.org/3/authentication/session/new",
        params={'api_key': TMDB_API_KEY},
        json={"request_token": request_token}
    )
    
    if response.status_code != 200:
        return None
    return response.json().get('session_id')

def searchMovie(query):
    response = requests.get(
        "https://api.themoviedb.org/3/search/movie",
        params={
            'api_key': TMDB_API_KEY,
            'query': query
        }
    )
    
    if response.status_code != 200:
        return None
        
    results = response.json().get('results', [])
    if not results:
        return None
    return results[0].get('id')

def createList(name, session_id):
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": f"Bearer {TMDB_READ_TOKEN}"
    }
    
    response = requests.post(
        "https://api.themoviedb.org/3/list",
        headers=headers,
        json={
            "name": name,
            "description": "My Alafia",
            "language": "en"
        }
    )
    
    if response.status_code != 201:
        return None
    return response.json().get('list_id')

def addMovieToList(list_id, movie_id, session_id):
    response = requests.post(
        f"https://api.themoviedb.org/3/list/{list_id}/add_item",
        params={
            'api_key': TMDB_API_KEY,
            'session_id': session_id
        },
        json={"media_id": movie_id}
    )
    
    if response.status_code == 201:
        return True
    return False

@app.route('/auth', methods=['GET'])
def auth():
    token = getRequestToken()
    if not token:
        return 'Failed', 500
        
    return jsonify({
        'message': 'Approve',
        'auth_url': f"https://www.themoviedb.org/authenticate/{token}",
        'request_token': token
    })

@app.route('/create-session', methods=['POST'])
def createSessionRoute():
    token = request.json.get('request_token')
    if not token:
        return 'No token', 400
        
    session_id = createSession(token)
    if not session_id:
        return 'Failed', 500
        
    return jsonify({'session_id': session_id})

@app.route('/create-list', methods=['POST'])
def createMovieList():
    data = request.json
    session_id = data.get('session_id')
    if not session_id:
        return 'Need session id', 400
        
    list_id = createList(data['name'], session_id)
    if not list_id:
        return 'Failed', 500
        
    for movie in data['movies']:
        movie_id = searchMovie(movie)
        if movie_id:
            addMovieToList(list_id, movie_id, session_id)
            
    return jsonify({
        'list_url': f'https://www.themoviedb.org/list/{list_id}'
    })

if __name__ == '__main__':
    app.run(debug=True)