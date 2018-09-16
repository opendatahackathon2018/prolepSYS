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
                size = int(request.args.get('size'))
            except Exception:
                size =10000
            try:
                begin = int(request.args.get('begin'))
            except Exception:
                begin =0
            res = s[begin:size].execute()
            typos = request.args.get('type')
            print(typos)
            if (typos != None):
                return [i for i in res.hits.hits if 'typos' in i['_source'] and i['_source']['typos'] == typos]
            return res.hits.hits
        else:
            pois = Poi.get(pois_id)
            return pois.to_dict()
