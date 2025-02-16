# from google import genai

# client = genai.Client(api_key="AIzaSyD6LRy27aJwlixei-YgFi0Z2XkTV0Jav2g")
# response = client.models.generate_content(
#     model="gemini-2.0-flash", contents="Explain how AI works"
# )
# print(response.text)

from google import genai
import os
from PIL import Image

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
    
    return images

def call_gemini():
    images = load_images_from_directory("./images")

    client = genai.Client(api_key="AIzaSyD6LRy27aJwlixei-YgFi0Z2XkTV0Jav2g")
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["What is common between these images, give me the response in a haiku.",
              images])

    print(response.text)

call_gemini()

# image_path_1 = r"C:\Users\build\Desktop\nsbe\alafia\backend\images\image1.jpg"  # Replace with the actual path to your first image
# image_path_2 = r"C:\Users\build\Desktop\nsbe\alafia\backend\images\image2.jpeg"# Replace with the actual path to your second image

# pil_image = PIL.Image.open(image_path_1)
# pil_image2 = PIL.Image.open(image_path_2)

# b64_image = types.Part.from_bytes(
#     pathlib.Path(image_path_2).read_bytes(), "image/jpeg")

# downloaded_image = requests.get(image_url_1)

