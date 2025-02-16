from flask import Flask, request, jsonify
from dotenv import load_dotenv
from PIL import Image
from pathlib import Path
import requests
import os
import io
import tempfile
import math
import shutil
import base64
from spotify import search_song, create_playlist, add_to_playlist
from gemini import call_gemini

prompt = f'''
I am building a personalized media recommendation system focused on inspiring underrepresented youth. I will provide you with user information below and their responses to conversational questions. Your task is to analyze this data and generate tailored media recommendations that could serve as sources of inspiration, motivation, and personal growth.

Input Data:

User Responses - You will receive responses the following 5 questions:


Who are you inspired by?
{{ans1}}

What are your interests?
{{ans2}}

What music do you like?
{{ans3}}

How are you feeling today?
{{ans4}}

What do you want to work on
{{ans5}}

Guidelines for Recommendations:

Cultural Relevance

Include content creators/artists from similar cultural backgrounds when appropriate
Consider regional/cultural context in recommendations

Age Appropriateness

All content should be age-appropriate
Consider maturity level in themes and content
Include both contemporary and classic recommendations

Each recommendation should include

Clear explanation of why it's recommended based on user responses
Relevant themes and messages
Connection to user's interests or goals
Potential impact or takeaway for the user

The recommendations should aim to

Inspire and motivate
Provide positive role models
Encourage personal growth
Foster cultural connection and pride
Support educational and professional development
Promote emotional well-being
Encourage creativity and self-expression

Expected Output:
Please provide recommendations in a structured JSON format that includes:
{{
    "recommendations": {{
        "movies": [],  # length 5
        "music": [
            {{
                "title": "string", # the name of the song
                "artist": "string" # just primary, not ft.
            }}
        ] # length 5
    }}
}}
Please ensure all recommendations are factual and actually exist. The response should be well-structured, properly formatted JSON that can be parsed by standard JSON parsers.
'''

load_dotenv()
app = Flask(__name__)
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_READ_TOKEN = os.getenv('TMDB_READ_TOKEN')

# list create
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

    return {
        'id': results[0].get('id'),
        'poster_url': f"https://image.tmdb.org/t/p/original{results[0].get('poster_path')}"
    }


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

# image download
def downloadPosters(posters_data):
    temp_dir = tempfile.mkdtemp()
    poster_paths = []
    
    for poster in posters_data:
        response = requests.get(poster['poster_url'])
        if response.status_code == 200:
            safe_title = "".join(x for x in poster['title'] if x.isalnum())
            file_path = os.path.join(temp_dir, f"{safe_title}.jpg")
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            poster_paths.append(file_path)
    
    return temp_dir, poster_paths

def createCollage(poster_paths, output_path):
    if not poster_paths:
        return None
        
    images = [Image.open(path) for path in poster_paths]
    
    n = len(images)
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)
    
    thumb_width = 300
    thumb_height = 450
    
    collage = Image.new('RGB', 
                       (thumb_width * cols, thumb_height * rows), 
                       (255, 255, 255))
    
    for idx, img in enumerate(images):
        img.thumbnail((thumb_width, thumb_height))
        
        x = (idx % cols) * thumb_width
        y = (idx // cols) * thumb_height
        
        x_offset = (thumb_width - img.width) // 2
        y_offset = (thumb_height - img.height) // 2
        
        collage.paste(img, (x + x_offset, y + y_offset))
    
    collage.save(output_path, 'JPEG', quality=85)
    return output_path

def processPosters(posters_data):
    temp_dir, poster_paths = downloadPosters(posters_data)
    
    collage_path = os.path.join(temp_dir, 'collage.jpg')
    createCollage(poster_paths, collage_path)
    
    return {
        'temp_dir': temp_dir,
        'poster_paths': poster_paths,
        'collage_path': collage_path
    }

# routes
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
    
    movie_posters = []    
    for movie in data['movies']:
        movie_data = searchMovie(movie)
        if movie_data:
            addMovieToList(list_id, movie_data['id'], session_id)
            movie_posters.append({
                'title': movie,
                'poster_url': movie_data['poster_url']
            })
    
    try:
        result = processPosters(movie_posters)
        with open(result['collage_path'], 'rb') as f:
            collage_bytes = f.read()
            
        shutil.rmtree(result['temp_dir'])
        
        return jsonify({
            'list_url': f'https://www.themoviedb.org/list/{list_id}',
            'collage': f"data:image/jpeg;base64,{base64.b64encode(collage_bytes).decode()}"
        })
        
    except Exception as e:
        return f'Error processing posters and creating list: {str(e)}', 500
    
def createMovieListLocal(name, movies, session_id):
    # data = request.json
    # session_id = data.get('session_id')
    if not session_id:
        return 'Need session id', 400
        
    list_id = createList(name, session_id)
    if not list_id:
        return 'Failed', 500
    
    movie_posters = []    
    for movie in movies:
        movie_data = searchMovie(movie)
        if movie_data:
            addMovieToList(list_id, movie_data['id'], session_id)
            movie_posters.append({
                'title': movie,
                'poster_url': movie_data['poster_url']
            })
    
    try:
        result = processPosters(movie_posters)
        with open(result['collage_path'], 'rb') as f:
            collage_bytes = f.read()
            
        shutil.rmtree(result['temp_dir'])
        
        # return jsonify({
        #     'list_url': f'https://www.themoviedb.org/list/{list_id}',
        #     'collage': f"data:image/jpeg;base64,{base64.b64encode(collage_bytes).decode()}"
        # })
        return f'https://www.themoviedb.org/list/{list_id}', f"data:image/jpeg;base64,{base64.b64encode(collage_bytes).decode()}"
        
        
    except Exception as e:
        return f'Error processing posters and creating list: {str(e)}', 500

@app.route('/process-posters', methods=['POST'])
def processPostersRoute():
    data = request.json
    if not data or 'posters' not in data:
        return 'No poster data provided', 400
        
    try:
        result = processPosters(data['posters'])
        with open(result['collage_path'], 'rb') as f:
            collage_bytes = f.read()
            
        shutil.rmtree(result['temp_dir'])
        
        return jsonify({
            'message': 'Posters processed successfully',
            'collage': f"data:image/jpeg;base64,{base64.b64encode(collage_bytes).decode()}"
        })
        
    except Exception as e:
        return f'Error processing posters: {str(e)}', 500
    
@app.route('/generate-content', methods=['POST'])
def generate_content():
    data = request.json.get('answers')

    if not data or not isinstance(data, list):
        return jsonify({'error': 'Invalid input data. Please provide a list of strings.'}), 400
    
    parsed_data = []
    c = 1
    final_prompt = prompt
    for answer in data:
        temp = answer.split(':')
        if len(temp) == 2:
            parsed_data.append(temp[1].strip())
            final_prompt = final_prompt.replace(f"{{ans{c}}}", temp[1].strip())
        c += 1
    
    # get gemini analysis

    movies, music = call_gemini(final_prompt)
    print(movies, music)
    
    # get spotify playlist
    uris = []
    for name, artist in music:
        track_uri = search_song(name, artist)
        if track_uri:
            uris.append(track_uri)
    playlist = create_playlist("Alafia - Personalized Playlist", "A special playlist for a special person")
    add_to_playlist(playlist['id'], uris)
    play_list_id = playlist['external_urls']['spotify']
    print(playlist['external_urls']['spotify'])

    # get image and link
    session_id = os.getenv('TMDB_SESSION_ID')
    image, movie_list = createMovieListLocal("Alafia - Personalized Movie List", movies, session_id)
    
    res = {
        "image": image,
        "movie_list": movie_list,
        "playlist_id": play_list_id
    }

    return jsonify(res)

if __name__ == '__main__':
    app.run(debug=True)