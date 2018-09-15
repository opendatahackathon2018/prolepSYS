import json

import pyproj
from elasticsearch_dsl import connections, GeoShape

from classes.ProlepsysPOI import ProlepsysPOI

toLatLong = pyproj.Proj(init='epsg:6312')
connections.create_connection(hosts=['https://97c331355e274f7680ef0b2422ea7213.eu-west-1.aws.found.io:9243'], http_auth=('elastic', 'WzIXoY7DrVHnWZIvafYtRS1m'),  verify_certs=False)

class Area(object):
    type = "multipoint"
    coordinates = []

    def __init__(self, type, coordinates):
        self.type = type
        self.coordinates = coordinates






with open("../static/data/fuelStorage.json") as dt:
    data = json.load(dt)

    # print(len(data['features'][1]['geometry']['rings'][0]))
    for item in data['features']:
        large = []
        for coords in item['geometry']['rings'][0]:
            small = []
            long, lat = toLatLong(coords[0], coords[1], inverse= True)
            # small.append(str(lat)+", "+str(long))
            small.append(lat)
            small.append(long)

            # print(str(lat) +", "+str(long))
        # print (item['geometry']['rings'])
            large.append(small)
        print("====================")
        print(large)

        type = "Fuel Strage"
        if item['attributes']['NAME'] is None:
            description = type
        else:
            description = item['attributes']['NAME']
        score = 0.72

        v = {"type": "multipoint", "coordinates": large}
        gs = GeoShape(type="multipoint", coordinates=large)
        shpe = Area("multipoint", large)
        # long, lat = toLatLong(pylonas['geometry']['x'], pylonas['geometry']['y'], inverse=True)
        #
        poi = ProlepsysPOI(
            typos=type,
            description=description,
            score=score,
            # location=str(lat) + ", " + str(long),
            shape=v
            # shape = '{ "type": "multipoint", "coordinates": ' + shape + '}'

        )
        poi.save()