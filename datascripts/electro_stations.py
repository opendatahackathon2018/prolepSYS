import pyproj
import json

from elasticsearch_dsl import *
from elasticsearch_dsl import connections

from classes.ProlepsysPOI import ProlepsysPOI

connections.create_connection(hosts=['https://97c331355e274f7680ef0b2422ea7213.eu-west-1.aws.found.io:9243'], http_auth=('elastic', 'WzIXoY7DrVHnWZIvafYtRS1m'),  verify_certs=False)

ppinit = pyproj.Proj(init='epsg:6312')
#
# class ElectroStations(Document):
#     location = GeoPoint()
#     name = Text()
#
#     class Index:
#         name = 'electrostations'
#         doc_type = "_doc"
#
#     class Meta:
#         doc_type = "_doc"


# long, lat = ppinit(268235.58836415585, 372473.47347240709, inverse=True)

with open("../static/data/electro_station.json") as elst:
    data = json.load(elst)

    for station in data['features']:

        # name = station['attributes']['NAME']
        long, lat = ppinit(station['geometry']['x'], station['geometry']['y'], inverse=True)

        type = "Power Plant"
        description = station['attributes']['NAME']
        score = 0.85
        # long, lat = toLatLong(pylonas['geometry']['x'], pylonas['geometry']['y'], inverse=True)

        poi = ProlepsysPOI(
            typos=type,
            description=description,
            score=score,
            location=str(lat) + ", " + str(long),
        )
        poi.save()

        # entry = ElectroStations(
        #     location=str(lat) + ", " + str(long),
        #     name=name
        # )
        # entry.save()
        # print(station['attributes']['NAME'] + ": "+ str(lat)+", "+str(long))

