
from elasticsearch_dsl import *
from elasticsearch_dsl import connections


class Poi(Document):
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

class EventModel(Document):
    created_at = Date()
    updated_at = Date()
    location = GeoPoint()
    status = Text()
    image = Text()
    input_type = Text()
    score = Float()

    class Index:
        name = 'events'
        doc_type = "_doc"

    class Meta:
        doc_type = "_doc"

    def get_score_for_ifra(self):
        from app import connections
        es = connections.get_connection()
        latlon = str(self.location).split(",")
        query = {
            "query": {
                "bool": {
                    "must": {
                        "match_all": {}
                    },
                    "filter": {
                        "geo_distance": {
                            "distance": "10km",
                            "location": {
                                "lat": latlon[0],
                                "lon": latlon[1]
                            }
                        }
                    }
                }
            }
        }
        res = es.search(index='prolepsyspoi', body=query)
        new_score = 0.0
        if 'hits' in res and 'hits' in res['hits'] and len(res['hits']['hits']) > 0:
            for i in res['hits']['hits']:
                new_score += float(i['_source']['score'] if 'score' in i['_source'] else 0)
            new_score = new_score / len(res['hits']['hits'])
        return new_score
