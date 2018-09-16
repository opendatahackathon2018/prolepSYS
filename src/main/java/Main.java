
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import twitter4j.*;
import twitter4j.conf.ConfigurationBuilder;

import javax.activation.MimetypesFileTypeMap;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.*;

public class Main {

    public static class ProlepSYSTask implements Runnable{
        private String url;
        private double latitude;
        private double longitude;

        public ProlepSYSTask(String url, double latitude, double longitude) {
            this.url = url;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        @Override
        public void run() {
            try {
            final String POST_PARAMS = "{" +
                "\"lat\": " + this.latitude + "," +
                "\"lon\": " + this.longitude + "," +
                "\"image\": \"" + getBase64EncodedImage(this.url) + "\"," +
                "\"input_type\": " + "\"mobile\"" + "" +
                "}";

            System.out.println(POST_PARAMS);

            URL obj = new URL("http://206.189.1.214:5000/events/");

            HttpURLConnection postConnection = (HttpURLConnection) obj.openConnection();
            postConnection.setRequestMethod("POST");
            postConnection.setRequestProperty("Content-Type", "application/json");
            postConnection.setDoOutput(true);

            OutputStream os = postConnection.getOutputStream();
            os.write(POST_PARAMS.getBytes());
            os.flush();
            os.close();

            int responseCode = postConnection.getResponseCode();
            System.out.println("POST Response Code :  " + responseCode);
            System.out.println("POST Response Message : " + postConnection.getResponseMessage());

            if (responseCode == HttpURLConnection.HTTP_CREATED) {
                BufferedReader in = new BufferedReader(new InputStreamReader(postConnection.getInputStream()));

                String inputLine;
                StringBuffer response = new StringBuffer();
                while ((inputLine = in .readLine()) != null) {
                    response.append(inputLine);
                } in .close();

                System.out.println(response.toString());
            } else {

                System.out.println("Something went wrong.");

            }} catch (IOException e) {
                e.printStackTrace();
            }


        }
    }

    private static String getBase64EncodedImage(String imageURL) throws IOException {
        URL url = new URL(imageURL);
        InputStream is = url.openStream();
        byte[] bytes = org.apache.commons.io.IOUtils.toByteArray(is);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private static Logger LOGGER = LoggerFactory.getLogger(Main.class);

    private static ExecutorService PROLEPSYS_SERVICE = Executors.newFixedThreadPool(10);

    private static Properties PROPERTIES = new Properties();

    static {
        try {
            PROPERTIES.load(new FileInputStream(new File(".properties")));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String args[]) throws IOException, TwitterException {

        LOGGER.info("Initiazing listener: " + PROPERTIES.getProperty("listener.id") + "");

        ConfigurationBuilder configurationBuilder = new ConfigurationBuilder();
        configurationBuilder
                .setJSONStoreEnabled(true)
                .setOAuthConsumerKey(PROPERTIES.getProperty("twitter.consumer.key"))
                .setOAuthConsumerSecret(PROPERTIES.getProperty("twitter.consumer.secret"))
                .setOAuthAccessToken(PROPERTIES.getProperty("twitter.accesstoken"))
                .setOAuthAccessTokenSecret(PROPERTIES.getProperty("twitter.accesstoken.secret"));

        if (Boolean.parseBoolean(PROPERTIES.getProperty("proxy.flag")) && !PROPERTIES.getProperty("proxy.host").isEmpty() && !PROPERTIES.getProperty("proxy.port").isEmpty()) {
            LOGGER.info("Setting proxy host as: " + PROPERTIES.getProperty("proxy.host"));
            configurationBuilder.setHttpProxyHost(PROPERTIES.getProperty("proxy.host"));
            LOGGER.info("Setting proxy port as: " + PROPERTIES.getProperty("proxy.port"));
            configurationBuilder.setHttpProxyPort(Integer.parseInt(PROPERTIES.getProperty("proxy.port")));
        }

        TwitterStream twitterStream = new TwitterStreamFactory(configurationBuilder.build()).getInstance();

        twitterStream.addListener(new StatusListener() {

            @Override
            public void onStatus(Status status) {

                System.out.println(status);

                Double latitude;
                Double longitude;

                if (status.getGeoLocation() != null) {
                    latitude = status.getGeoLocation().getLatitude();
                    longitude = status.getGeoLocation().getLongitude();
                } else {
                    GeoLocation[] bbcoords = status.getPlace().getBoundingBoxCoordinates()[0];
                    latitude = (bbcoords[0].getLatitude() + bbcoords[1].getLatitude() + bbcoords[2].getLatitude() + bbcoords[3].getLatitude()) / bbcoords.length;
                    longitude = (bbcoords[0].getLongitude() + bbcoords[1].getLongitude() + bbcoords[2].getLongitude() + bbcoords[3].getLongitude()) / bbcoords.length;
                }

                System.out.println("Latitude: " + latitude);
                System.out.println("Longitude: " + longitude);

                if(latitude == null || longitude == null){
                    latitude = 34.6807039;
                    longitude = 33.0430062;
                }

                MediaEntity[] media = status.getMediaEntities();
                for(MediaEntity m : media){
                    String mediaURL = m.getMediaURL();
                    String mimetype= new MimetypesFileTypeMap().getContentType(mediaURL);
                    String type = mimetype.split("/")[0];

                    if(type.equals("image")) {
                        PROLEPSYS_SERVICE.submit(new ProlepSYSTask(mediaURL, latitude, longitude));
                    }

                }
            }

            @Override
            public void onDeletionNotice(StatusDeletionNotice statusDeletionNotice) {
                LOGGER.error("Deletion notice for status " + statusDeletionNotice.getStatusId());
            }

            @Override
            public void onTrackLimitationNotice(int i) {
                LOGGER.error("Track limitation notice on " + i);
            }

            @Override
            public void onScrubGeo(long l, long l1) {

            }

            @Override
            public void onStallWarning(StallWarning stallWarning) {
                LOGGER.error("Stall warning " + stallWarning.getMessage());
            }

            @Override
            public void onException(Exception e) {
                LOGGER.error(e.getMessage());
            }

        });

        FilterQuery query = new FilterQuery();

        if (PROPERTIES.containsKey("users.list")) {
            LOGGER.info("Loading user list.");
            try {
                File userlist = new File(PROPERTIES.getProperty("users.list"));
                List<Long> uids = new ArrayList<>();
                for (String uid : FileUtils.readLines(userlist)) {
                    uids.add(Long.parseLong(uid));
                }

                query.follow(Arrays.stream(uids.toArray(new Long[uids.size()])).filter(Objects::nonNull).mapToLong(Long::longValue).toArray());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        if (PROPERTIES.containsKey("hashtags.list")) {
            LOGGER.info("Loading hashtag list.");
            try {
                File hashtaglist = new File(PROPERTIES.getProperty("hashtags.list"));
                List<String> hashtags = new ArrayList<>();
                for (String hashtag : FileUtils.readLines(hashtaglist)) {
                    hashtags.add(hashtag);
                }

                query.track(hashtags.toArray(new String[hashtags.size()]));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        if (
                PROPERTIES.containsKey("bottomleft.longitude") &&
                        PROPERTIES.containsKey("bottomleft.latitude") &&
                        PROPERTIES.containsKey("upperright.longitude") &&
                        PROPERTIES.containsKey("upperright.latitude")
                ) {
            query.locations(new double[][]{{
                    Double.parseDouble(PROPERTIES.getProperty("bottomleft.longitude")),
                    Double.parseDouble(PROPERTIES.getProperty("bottomleft.latitude"))}, {
                    Double.parseDouble(PROPERTIES.getProperty("upperright.longitude")),
                    Double.parseDouble(PROPERTIES.getProperty("upperright.latitude"))}}
            );
        }

        twitterStream.filter(query);

    }

}
