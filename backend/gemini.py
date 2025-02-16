# from google import genai

# client = genai.Client(api_key="AIzaSyD6LRy27aJwlixei-YgFi0Z2XkTV0Jav2g")
# response = client.models.generate_content(
#     model="gemini-2.0-flash", contents="Explain how AI works"
# )
# print(response.text)

from google import genai
import os
from PIL import Image
from dotenv import load_dotenv
import json
from pydantic import BaseModel, TypeAdapter
from typing import List
# from spotify import search_song, create_playlist, add_to_playlist

load_dotenv()

def load_images_from_directory(relative_directory_path):
    images = []
    # Iterate through all files in the directory
    directory_path = os.path.join(os.getcwd(), relative_directory_path)

    for filename in os.listdir(directory_path):
        filepath = os.path.join(directory_path, filename)
        
        # Check if the file is an image (based on file extension)
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff')):
            try:
                img = Image.open(filepath)  # Open the image file
                images.append(img)  # Append image to the list
            except Exception as e:
                print(f"Error loading image {filename}: {e}")
    
    return 


class Movie(BaseModel):
    title: str

class Music(BaseModel):
    title: str
    artist: str

class Recommendations(BaseModel):
    movies: List[Movie]
    music: List[Music]

class GeminiResponse(BaseModel):
    recommendations: Recommendations

def call_gemini(prompt):
    api_key = os.getenv("GEMINI_KEY")
    images = load_images_from_directory("./images")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    config={
        'response_mime_type': 'application/json',
        'response_schema': GeminiResponse,
    },
    contents=[prompt,
              # {images...}
              ])

    # print(response.text)
    data = json.loads(response.text)

    if 'movies' in data.get('recommendations', {}) and data['recommendations']['movies']:
        movies = [x["title"] for x in data["recommendations"]["movies"]]

    if 'music' in data.get('recommendations', {}) and data['recommendations']['music']:
        music = [(x["title"], x["artist"]) for x in data["recommendations"]["music"]]
    
    # print(movies)
    # print(music)

    return movies, music

    # make spotify playlist
    # uris = []
    # for name, artist in music:
    #     track_uri = search_song(name, artist)
    #     if track_uri:
    #         uris.append(track_uri)
    # playlist = create_playlist("Alafia - Personalized Playlist", "A special playlist for a special person")
    # add_to_playlist(playlist['id'], uris)
    # print(playlist['external_urls']['spotify'])

# call_gemini()

# image_path_1 = r"C:\Users\build\Desktop\nsbe\alafia\backend\images\image1.jpg"  # Replace with the actual path to your first image
# image_path_2 = r"C:\Users\build\Desktop\nsbe\alafia\backend\images\image2.jpeg"# Replace with the actual path to your second image

# pil_image = PIL.Image.open(image_path_1)
# pil_image2 = PIL.Image.open(image_path_2)

# b64_image = types.Part.from_bytes(
#     pathlib.Path(image_path_2).read_bytes(), "image/jpeg")

# downloaded_image = requests.get(image_url_1)

