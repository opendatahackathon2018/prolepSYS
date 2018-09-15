import csv
import utm
from elasticsearch_dsl import *
from elasticsearch_dsl import connections

connections.create_connection(hosts=['https://97c331355e274f7680ef0b2422ea7213.eu-west-1.aws.found.io:9243'], http_auth=('elastic', 'WzIXoY7DrVHnWZIvafYtRS1m'),  verify_certs=False)

class ForestFire(Document):
    start_date = Date()
    location = GeoPoint()
    burned_area = Double()
    cause = Text()

    class Index:
        name = 'forestfires'
        doc_type = "_doc"

    class Meta:
        doc_type = "_doc"




with open("static/data/forest_fires16.csv", mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        latlong = utm.to_latlon(int(row['Latitude']), int(row['Longitude']), 36, 'N')

        entry = ForestFire(
            start_date = datetime.strptime(row['Fire Starting Date'], '%d/%m/%Y').strftime('%Y-%m-%d'),
            # start_date=date(row['Fire Starting Date']),
            # location=utm.to_latlon(int(row['Latitude']), int(row['Longitude']), 36, 'N'),
            location= str(latlong[0])+", "+str(latlong[1]),
            burned_area = float(row['Burned Area (ha)']),
            cause = row['Possible Fire Cause']
        )
        entry.save()
        # print(row['Latitude'] + ", " + row['Longitude'] +" --> "+ str(utm.to_latlon(int(row['Latitude']), int(row['Longitude']), 36, 'N')))
        # print(str(latlong[0])+", "+str(latlong[1]))