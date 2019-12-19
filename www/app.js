const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    $('.hours-mins').text(h + ":" + m);
    $('.seconds').text(s);
    var t = setTimeout(startTime, 500);
}

function startWeather() {
    $.get('http://api.openweathermap.org/data/2.5/weather?q=Brindisi,it&APPID=6e9a7d3a8d9e481bbdd14b1df103142c').done(function (data) {
        var temp = Math.floor(data.main.temp - 273.15),
            temp_min = Math.floor(data.main.temp_min - 273.15),
            temp_max = Math.ceil(data.main.temp_max - 273.15),
            humidity = data.main.humidity,
            city = data.name,
            weatherIcon = data.weather[0].icon;

        $('.weather-img').attr('src', 'http://openweathermap.org/img/wn/' + weatherIcon + '@2x.png');
        $('.weather-info').html("Temp: " + temp + "°C (" + temp_min + "°C - " + temp_max + "°C)<br>Umidità: " + humidity + "% - " + city);
    }).fail(function () {
        console.log("Failed to retrieve weather data from OpenWeatherMap");
    });

    var t = setTimeout(startWeather, 1200000);
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
        minutes = _date.getMinutes();

    return hours + ":" + minutes;
}

function startDate() {
    var currentDate = new Date(),
        day = currentDate.getDate(),
        dayName = getDayName(currentDate.getDay()),
        month = currentDate.getMonth() + 1,
        year = currentDate.getFullYear();

    $('.calendar-date').text(dayName + " " + day + "/" + month + "/" + year);
}

function startNews() {
    let parser = new RSSParser();

    parser.parseURL(CORS_PROXY + 'http://xml2.corriereobjects.it/rss/homepage.xml', function (err, feed) {
        if (err) throw err;
        $('.news').html('');
        $('.news').append('<p class="text-italic text-center">' + feed.title + '</p>');
        for(var i = 0; i < 7; i++) {
            $('.news').append('<hr class="m10">');
            $('.news').append('<p class="m0 pdx10">' + feed.items[i].title + '</p><p class="m0 mt5 pdx10 font13 text-color-darkgray text-right">' + getTimeFromDate(feed.items[i].pubDate) + '</p>');
        }
    });

    var t = setTimeout(startNews, 3600000);
}

$(function () {
    startTime();
    startWeather();
    startDate();
    startNews();
});