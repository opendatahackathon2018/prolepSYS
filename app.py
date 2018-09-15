from flask import Flask
from routes.EventRoute import EventView
from elasticsearch_dsl import connections
from routes.PoisRoute import PoisView
from flask_cors import CORS
connections.create_connection(hosts=['https://97c331355e274f7680ef0b2422ea7213.eu-west-1.aws.found.io:9243'], http_auth=('elastic', 'WzIXoY7DrVHnWZIvafYtRS1m'),  verify_certs=False)

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

@app.route('/')
def hello_world():
    return 'Hello World!'


eventView = EventView.as_view('event')
poisView = PoisView.as_view('view_pois')

app.add_url_rule('/events/<string:event_id>', view_func=eventView, methods=['GET', 'PUT', 'DELETE'])
app.add_url_rule('/events/', view_func=eventView, methods=['POST'])
app.add_url_rule('/events/', defaults={'event_id': None}, view_func=eventView
, methods = ['GET', ])
app.add_url_rule('/pois/', defaults={'pois_id': None}, view_func=poisView
, methods = ['GET', ])
app.add_url_rule('/pois/<string:pois_id>', defaults={'pois_id': None}, view_func=poisView
, methods = ['GET', ])
# app.add_url_rule('/image/<string:event_id>.jpeg', view_func=image)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
