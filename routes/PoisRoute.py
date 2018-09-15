from datetime import datetime

from flask import request
from flask.views import MethodView
from utils.general import json_decorator
from models import Poi

class PoisView(MethodView):

    decorators = [json_decorator]

    def get(self, pois_id):
        if pois_id is None:
            data = request.get_json()
            Poi.search()
            s = Poi.search()
            try:
                size = int(data['size'])
            except Exception:
                size =1000
            try:
                begin = int(data['size'])
            except Exception:
                begin =0
            res = s[begin:size].execute()
            return res.hits.hits
        else:
            pois = Poi.get(pois_id)
            return pois.to_dict()
