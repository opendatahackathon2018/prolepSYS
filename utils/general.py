import base64
import io

import requests
from flask import jsonify


def json_decorator(f):
    """Checks whether user is logged in or raises error 401."""
    def decorator(*args, **kwargs):
        return jsonify(f(*args, **kwargs))
    return decorator

def save_image(image_content):
    #TODO
    pass

def get_image_score(image_content):
    google_api_key = "AIzaSyD0E5-bCIGHq55dmFsYlh0Do8T25zi0JAg"
    con = str(image_content).replace(" data:image/png;base64,","").replace("data:image/jpeg;base64,","")
    data = {
        "requests": [
        {
          "image": {
            "content": con
          },
          "features": [
            {
              "type": "LABEL_DETECTION"
            }
          ]
        }
      ]
    }
    print(data)
    res = requests.post("https://vision.googleapis.com/v1/images:annotate?key="+google_api_key, json=data)
    score = 0.0
    keywords = ['wildfire']
    result = res.json()
    print(result)
    for tempRes in result['responses'][0]['labelAnnotations']:
        if tempRes['description'] in keywords:

            score+=float(tempRes['score'])
    return score
