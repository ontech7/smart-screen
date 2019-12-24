const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

var icons = {
    'whatsapp': './images/notification-icons/whatsapp.svg',
    'telegram': './images/notification-icons/telegram.svg',
    'instagram': './images/notification-icons/instagram.svg',
    'facebook': './images/notification-icons/facebook.svg',
    'mms': './images/notification-icons/mms.png',
    'telecom': './images/notification-icons/telecom.png'
};

var weatherTimeout,
    newsTimeout,
    timeTimeout;

function scrollToBottom (selector) {
    var div = document.querySelector(selector);
    div.scrollTop = div.scrollHeight - div.clientHeight;
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

function getDayName(day) {
    var weekdays = new Array(7);

    weekdays[0] = "Dom";
    weekdays[1] = "Lun";
    weekdays[2] = "Mar";
    weekdays[3] = "Mer";
    weekdays[4] = "Gio";
    weekdays[5] = "Ven";
    weekdays[6] = "Sab";

    return weekdays[day];
}

function getTimeFromDate(date) {
    var _date = new Date(date),
        hours = _date.getHours(),
        minutes = checkTime(_date.getMinutes());

    return hours + ":" + minutes;
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    if(h == 0 && m == 0 && (s == 0 || s == 1)) {
        startDate();
    }

    m = checkTime(m);
    s = checkTime(s);
    $('.hours-mins').text(h + ":" + m);
    $('.seconds').text(s);

    timeTimeout = setTimeout(startTime, 500);
}

function startDate() {
    var currentDate = new Date(),
        day = currentDate.getDate(),
        dayName = getDayName(currentDate.getDay()),
        month = currentDate.getMonth() + 1,
        year = currentDate.getFullYear();

    $('.calendar-date').text(dayName + " " + day + "/" + month + "/" + year);
}

function startServiceInfo() {
    socketManager.retrieveLocalIP();
}

function startWeather(city, appID) {
    if(city != null) {

        $.get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=' + appID).done(function (data) {
            var temp = Math.floor(data.main.temp - 273.15),
                temp_min = Math.floor(data.main.temp_min - 273.15),
                temp_max = Math.ceil(data.main.temp_max - 273.15),
                humidity = data.main.humidity,
                city = data.name,
                weatherIcon = data.weather[0].icon;

            $('.weather-img').attr('src', './images/weather-icons/' + weatherIcon + '.png');
            $('.weather-info').html("Temp: " + temp + "°C (" + temp_min + "°C - " + temp_max + "°C)<br>Umidità: " + humidity + "% - " + city);

            localStorage.setItem("weather_service", city);
        }).fail(function () {
            console.log("Failed to retrieve weather data from OpenWeatherMap");
        });

        weatherTimeout = setTimeout(function(){
            startWeather(city, appID);
        }, 1200000);
    }
}

function startNews(url) {
    if(url != null) {

        let parser = new RSSParser();

        parser.parseURL(CORS_PROXY + url, function (err, feed) {
            if (err) throw err;
            $('.news-title').text(feed.title);
            $('.news-zone').html('');
            for(var i = 0; i < 10; i++) {
                $('.news-zone').append('<hr class="m10 border-midnight-blue">');
                $('.news-zone').append('<p class="m0 pdx10">' + feed.items[i].title + '</p><p class="m0 my5 pdx10 font13 text-color-darkgray text-right">' + getTimeFromDate(feed.items[i].pubDate) + '</p>');
            }

            localStorage.setItem("news_service", url);
        });

        newsTimeout = setTimeout(function() {
            startNews(url);
        }, 3600000);
    }
}

$(function () {
    var newsFeedUrl = null,
        weatherCity = null;

    if(localStorage.getItem("news_service") !== undefined) {
        newsFeedUrl = localStorage.getItem("news_service");
    }

    if(localStorage.getItem("weather_service") !== undefined) {
        weatherCity = localStorage.getItem("weather_service");
    }

    startServiceInfo();
    startTime();
    startDate();
    startNews(newsFeedUrl);
    startWeather(weatherCity, '6e9a7d3a8d9e481bbdd14b1df103142c');
});