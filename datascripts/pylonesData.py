import json
import pyproj

from elasticsearch_dsl import connections

from classes.ProlepsysPOI import ProlepsysPOI

toLatLong = pyproj.Proj(init='epsg:6312')
connections.create_connection(hosts=['https://97c331355e274f7680ef0b2422ea7213.eu-west-1.aws.found.io:9243'], http_auth=('elastic', 'WzIXoY7DrVHnWZIvafYtRS1m'),  verify_certs=False)

with open("../static/data/electricPylones.json") as ep:
    data = json.load(ep)

    for pylonas in data['features']:
        type = "Electricity Pylon"
        description = pylonas['attributes']['LINE_NAME']
        score = 0.6
        long, lat = toLatLong(pylonas['geometry']['x'], pylonas['geometry']['y'], inverse = True )

        poi = ProlepsysPOI(
            typos = type,
            description = description,
            score = score,
            location = str(lat) + ", " + str(long),
        )
        poi.save()

