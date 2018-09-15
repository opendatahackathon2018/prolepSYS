import pyproj

from elasticsearch_dsl import *

# The following requires pyproj to be installed.
# Also add this line anywhere to venv/lib/python3.5/site-packages/pyproj/data/espg
# < 6312 > +proj = tmerc + lat_0 = 0 + lon_0 = 33 + k = 0.99995 + x_0 = 200000 + y_0 = -3500000 + ellps = WGS84 + towgs84 = 8.846, -4.394, -1.122, -0.00237, -0.146528, 0.130428, 0.783926 + units = m + no_defs <>
toLatLong = pyproj.Proj(init='epsg:6312')


class ProlepsysPOI(Document):
    typos = Text()
    description = Text()
    score = Float()
    location = GeoPoint()
    shape = GeoShape()

    class Index:
        name = 'prolepsyspoi'
        doc_type = "_doc"

    class Meta:
        doc_type = "_doc"

    def convertTMPointToLatLong(self, x, y):
        long, lat = toLatLong(x, y, inverse=True)
        return lat, long








# DEBUGGING

poi = ProlepsysPOI()
lat, long = poi.convertTMPointToLatLong(x=268235.58836415585, y=372473.47347240709)

print(str(lat)+", "+str(long))

