import requests
import xmltodict
import json

URL = "http://weather.cyi.ac.cy/data/met/CyDoM.xml"


class Weather:

    def __init__(self):
        self.stations = {}

    def retrieve_stations(self):
        response = requests.get(URL)
        res = response.text
        result = xmltodict.parse(res)
        stations = result['meteorology']['stations']['station']
        for station in stations:
            station_code = station['station_code']
            lat = station['station_latitude']
            lon = station['station_longitude']
            self.stations[station_code] = {'lat': lat, 'lon': lon}
        return self.stations

    def retrieve_all(self):
        response = requests.get(URL)
        res = response.text
        r = xmltodict.parse(res)
        stations = r['meteorology']['stations']['station']

        result = {}

        for station in stations:
            station_code = station['station_code']
            lat = station['station_latitude']
            lon = station['station_longitude']
            result[station_code] = {'lat': lat, 'lon': lon, 'metrics': []}

        observations = r['meteorology']['observations']

        for observation in observations:
            station_code = observation['station_code']
            date_time = observation['date_time']
            obs = observation['observation']
            for o in obs:
                metric_name = o['observation_name']
                metric_value = o['observation_value']
                metric_units = o['observation_unit']
                record = {'data_time': date_time,
                          'metric_name': metric_name,
                          'metric_value': metric_value,
                          'metric_units': metric_units
                          }
                result[station_code]['metrics'].append(record)
        ans = []

        for k in result:
            v = result[k]
            ans.append({'name': k, 'lat': v['lat'], 'lon': v['lon'], 'description': v['metrics']})

        return ans

    def retrieve_all_raw(self):
        response = requests.get(URL)
        res = response.text
        result = xmltodict.parse(res)
        stations = result['meteorology']['stations']['station']
        stationsLocation = {}
        for station in stations:
            station_code = station['station_code']
            lat = station['station_latitude']
            lon = station['station_longitude']
            stationsLocation[station_code] = {'lat': lat, 'lon': lon}

        observations = result['meteorology']['observations']

        records = []
        for observation in observations:
            station_code = observation['station_code']
            date_time = observation['date_time']
            obs = observation['observation']
            for o in obs:
                metric_name = o['observation_name']
                metric_value = o['observation_value']
                metric_units = o['observation_unit']
                records.append({
                    'station_code': station_code,
                    'station_lat': stationsLocation[station_code]['lat'],
                    'station_lon': stationsLocation[station_code]['lon'],
                    'data_time': date_time,
                    'metric_name': metric_name,
                    'metric_value': metric_value,
                    'metric_units': metric_units
                })
        return records
