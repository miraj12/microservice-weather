const request = require('request');
var moment = require('moment');
const apiKey ='******************************'; // apiKey for worldweatheronline

function dayOfWeekAsString(dayIndex) {
    return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][dayIndex];
}

exports.weather = function weather (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(!req.body.city || !req.body.weekof) {
    res.send(JSON.stringify({'Error': 'Error, No Params'}));
  } else {
    let city = req.body.city;
    let dateFrom = req.body.weekof;
    let endOfWeek = moment(dateFrom,"YYYY-MM-DD").add(6 ,'days');
    let dateTo =  endOfWeek.format('YYYY') + '-' + endOfWeek.format('MM') + '-' + endOfWeek.format('DD');
    let url = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q='+city+'&date='+dateFrom+'&enddate='+dateTo+'&tp=24&key='+apiKey+'&format=json';
    request(url, function (err, response, body) {
      // if there is no error extract the needed results from the response and send it to client
      if (!err && response.statusCode == 200) {

          // parse the json result
          var result = JSON.parse(body);
          if(result.data.weather == undefined) {
            res.send(JSON.stringify({'Error': 'Error, please try again'}));
          } else {
              var arr = [];
              var loc = result.data.request[0].type + " : " + result.data.request[0].query;
              arr.push(loc);
              result.data.weather.forEach(function(weather) {
                var dat = weather.date;
                arr.push({date: dat, day: dayOfWeekAsString(new Date(dat).getDay()),desc: weather.hourly[0].weatherDesc[0].value,
                            img: weather.hourly[0].weatherIconUrl[0].value, maxtempF: weather.maxtempF, mintempF: weather.mintempF});
              });

              res.send(JSON.stringify(arr));
            }

      } else {
         console.log(err, response.statusCode, body);
          res.send(JSON.stringify({'Error': 'Error, please try again'}));
      }
    });
  }

};
