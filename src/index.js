var Alexa = require('alexa-sdk');
var Speech = require('ssml-builder');
var tinyreq = require('tinyreq');
var cheerio = require('cheerio');

var goodbyeMessage = "OK, check for more offers soon.";

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  'GetOffersIntent': function() {
    var self = this;
    getOffers(function(err, offers) {
      var speech = new Speech();
      speech.say('There are ' + offers.length + ' current offers');
      speech.pause('1s');
      for (var i=0; i < offers.length; i++) {
        if (i) speech.pause('500ms');
        speech.say(offers[i]);
      }
      var speechOutput = speech.ssml(true);
      self.emit(':tell', speechOutput);
    });
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', goodbyeMessage);
  },
}

getOffers = function(cb) {
  tinyreq('http://www.disneyholidays.co.uk/walt-disney-world/deals/', function (err, body) {
    var $ = cheerio.load(body);
    var offersHTML = $('.offer').children('hgroup').children('a').children('span').children('h2');
    var offers = [];
    offersHTML.each(function(i, o) {
      offers.push($(o).text());
    });
    cb(null, offers);
  });
}