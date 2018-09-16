import io
from datetime import datetime

import boto3
from flask.views import MethodView
from flask import request, make_response, send_file, Response
from utils.general import json_decorator, get_image_score
from elasticsearch_dsl import *
from models import EventModel, Poi, UserModel


class UserView(MethodView):

    decorators = [json_decorator]

    def get(self, user_id):
        if user_id is None:
            s = UserModel.search()
            s.exclude('terms', status='deleted')
            res = s.execute()
            return res.hits.hits
        else:
            event = UserModel.get(user_id)
            return event.to_dict()


    def post(self):
        data = request.get_json()
        if data == None or 'mobile_id' not in data:
            return {"success":"false"}
        if 'lat' in data and 'lon' in data:
            data['location'] = str(data['lat'])+','+str(data['lon'])
            del data['lat']
            del data['lon']


        user = UserModel(meta={'id': data['mobile_id']}, **data, created_at=datetime.now(),updated_at=datetime.now(), status="active")
        user.save()
        res = {'id': user.meta.id}
        return res

    def put(self, user_id):
        data = request.get_json()
        if data == None:
            return {"sucess":"false"}
        if 'lat' in data and 'lon' in data:
            data['location'] = data['lat']+','+data['lon']
            del data['lat']
            del data['lon']

        user = UserModel.get(user_id)

        user.update(**data,updated_at=datetime.now())
        res = user.to_dict()
        res['id'] = user.meta.id
        return res

    def delete(self, user_id):
        event = UserModel.get(user_id)
        event.update(status="deleted")
        event.save()
        return {"success": True}

# @json_decorator
# def image(event_id):
#     event = EventModel.get(event_id)
#
#
#     pic = ''
#     if 'image' in event.to_dict():
#         pic = event.to_dict()['image']
#     image_data = base64.decodebytes(pic.encode())
#     return Response(image_data, mimetype='image/jpeg')


