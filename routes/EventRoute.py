import io
from datetime import datetime

import boto3
from flask.views import MethodView
from flask import request, make_response, send_file, Response
from utils.general import json_decorator, get_image_score, send_sms
from elasticsearch_dsl import *
from models import EventModel, Poi, UserModel

fire_man_phone = '+35799937195' #zaharias
#mayor = ''
authorities_telephones = [fire_man_phone]

victim = '+35799908367'# thanashs

class EventView(MethodView):

    decorators = [json_decorator]

    def get(self, event_id):
        if event_id is None:
            s = EventModel.search()
            s.exclude('terms', status="deleted")
            res = s.execute()
            return [i for i in res.hits.hits if 'status' not in i['_source'] or i['_source']['status'] !="deleted"]
        else:
            event = EventModel.get(event_id)
            return event.to_dict()


    def post(self):
        data = request.get_json()
        if data == None:
            return {"success":"false"}
        for i in ['lat', 'lon','input_type']:
            if i not in data:
                return {'success': False}
        if 'image' in data:
            context = data['image']
            score = get_image_score(context)
        if data['input_type'] == 'panic':
            score = 2
        s = Poi.search()

        res = {"success":False}
        if score>0.0:
            new_data = {
                'location': str(data['lat']) + ',' + str(data['lon']),
                'input_type': data['input_type']
            }
            if 'image' in data:
                new_data['image'] = data['image']

            event = EventModel(
                **new_data,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                status="active")
            new_score = event.get_score_for_ifra()
            score = (score + new_score) / 2
            event.score = score
            event.save()
            res = event.to_dict()
            res = {'id': event.meta.id}
        print(res)
        return res

    def put(self, event_id):
        data = request.get_json()
        if data == None:
            return {"sucess":"false"}
        event = EventModel.get(event_id)
        new_data = {}
        if 'status' in data:
            new_data['status'] = data['status']

        event.update(**new_data,updated_at=datetime.now())
        res = event.to_dict()
        if event.status == 'real_fire':
            loc = event.location.split(",")
            for i in UserModel.telephones(loc[0], loc[1]):
                print(i)
                send_sms(i, 'Warning Fire near location. Caution is advised.')
            for i in authorities_telephones:
                send_sms(i, 'Warning wildfire detected. Emergency response is advised.')
        if event.status == 'panic_accept':
            send_sms(fire_man_phone, 'Emergency Assistance needed at '+
                     'https://www.google.com/maps/@'+event.location+',15z'
                     )
            send_sms(victim, 'Assistance is on your way!!')
        res['id'] = event.meta.id



        return res

    def delete(self, event_id):
        event = EventModel.get(event_id)
        event.update(status="deleted")
        event.save()
        return {"success": True}
