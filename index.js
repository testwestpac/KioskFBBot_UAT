'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var url = require('url');
//var formidable = require('formidable');

var isSupport = 0;
var tmpProfile = {};
const app = express();
var a = 1;
app.set('port', (process.env.PORT || 5000));

// Allows us to process the data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES

app.get('/', function (req, res) {
    res.send("Hi I am a chatbot");
});

//let token = "EAAEOEM6JZAMYBAAzZBaKSM8R7V0srV0AZC5NHlxZATn2junuWdUYyG6xXb0ZAZALrEtaoZCr33moJIkkN3tZCEz7qU0r4hasPP8wwb1elkHlEmZBfVZBARgymNlSX4WIEKqxluptY7ZCeXtk9zJEvOZANYZB90QJ88WXZCyPqyIitTDOncbgZDZD"
//let token = "EAAEOEM6JZAMYBAKF6Q3vlxtY3PNz7FjAI6lNAfOsNnf1eUwwSB5ldZC9CxAU62QGZAPZAzbsWn0uOyZBD8sJuPbDicapzaufH0rPcRdaeULp1LCfpVmuGtxYP6nUIApXaJzvQIWaMDX0NxVr6BEOPCZCd6ztaCwCFFACglVhW2wDSZBZAluapuZC6"
let token = "EAACOCGCcL5YBANPJAZBHKp1pXfPIS0TglvwRpm8hG2e9IZAeKTmqeGHccbJcLCYU9SYC8i4L7uxZCSp8DNnpD2fxAJ3crDjcHjYK5RShuGYm3yEagNp5wz1eMEeZAzqSswea9dDBxR0tIvxbCujoecIbMaBZBsQ8YOFG9Ww5gQbRr2qc7kyuM";
// Facebook 

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === "Password1") {
        res.send(req.query['hub.challenge']);
        console.log("");
    }
    res.send("Wrong token");
});


app.post('/webhook', function (req, res) {
    var data = req.body;
    var BreakException = {};
    // Make sure this is a page subscription
    if (data.object === 'page') {
        greetingText();
        //deleteMenu();
        // showButtons();
        getStarted();

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                try {
                    if (event.postback) {

                        receivedPostback(event);
                        throw BreakException;
                    } else {
                        let messageText = event.message.text;
                        let messageAttachments = event.message.attachments;
                        if (messageText) {
                            receivedMessage(event);
                        } else if (messageAttachments) {
                            //console.log(messageAttachments)
                            savePictureUrl(event);
                        }
                        else {
                            console.log("Webhook received unknown event: ", event);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        });
        // Assume all went well.

        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

function savePictureUrl(event) {
    var senderID = event.sender.id;
    var http = require('http');


    var i = 0;
    var messageAttachments = event.message.attachments[i];

    event.message.attachments.forEach(function (value) {
        if (value.type === "image") {
            var data = JSON.stringify({
                'authKey': "UbjsdJUa@#$&*sdbMSADKl349(*@#$!9034nZZ(asd9SDNu2349N(SDnkwersd9an",
                'fbID': senderID,
                'pictureURL': value.payload.url
            });
            var options = {
                host: '52.220.237.12',
                port: '80',
                path: '/FBKioskGenerator_UAT/FBKioskWebService.asmx/InsertFBTransactionDetail',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': data.length
                }
            };

            var req = http.request(options, function (res) {
                var object = {};
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    object = JSON.parse(chunk);
                });
                res.on('end', function () {
                    console.log(object);
                    if (object.d.Result !== "True")
                        sendTextMessage(senderID, "Error in Service: " + object.d.Message);
                });
            });

            req.write(data);
            req.end();
        }
    });

    promptMorePhotos(senderID);
}

function greetingText() {
    console.log("greet");
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: token },
        method: 'POST',
        json: {
            greeting: [
                {
                    locale: "default",
                    text: "Thank you for using the Phone2Prints Upload Assistant. We hope we can make it fun and convenient for you to turn your digital photos into prints you and your loved ones can enjoy!"
                }
            ]
        }
    });
}

function getStarted() {
    var messageData = {
        get_started: {
            payload: "GET_STARTED_PAYLOAD"
        }
    };
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: token },
        method: 'POST',
        json: {
            get_started: {
                payload: "start"
            }
        }
    });
}

function showButtons() {
    //    curl - X DELETE - H "Content-Type: application/json" - d '{ 
    //    "setting_type":"call_to_actions",
    //        "thread_state":"existing_thread"
    //} ' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=";
    console.log('TEST');
    request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: { access_token: token },
        method: 'POST',
        json: {
            setting_type: "call_to_actions",
            thread_state: "existing_thread",
            call_to_actions: []
        }
    }, function (error, response, body) {
        console.log(response);
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
    //request({
    //    uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
    //    qs: { access_token: token },
    //    method: 'POST',
    //    json: {
    //        "setting_type": "call_to_actions",
    //        "thread_state": "existing_thread"
    //    }
    //});
}


function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));
    var isBanned = "";
    var messageId = message.mid;
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var Filter = require('bad-words'),
        filter = new Filter();
    if (messageText) {
        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        console.log(messageText + " : " + isSupport);
        isBanned = filter.clean(messageText);
        if (isBanned.indexOf("*") >= 0 && isSupport === 0) {
            //curse word 
            sendTextMessage(senderID, "Sorry to see you're so upset. Our team is working on it");
            getOptions(senderID);
        }
        else if (messageText.toLowerCase() === 'hi!' || messageText.toLowerCase() === 'hello!' ||
            messageText.toLowerCase() === 'hi' || messageText.toLowerCase() === 'hello') {
            getOptions(senderID);
        }
    } //else if (messageAttachments) {
    //    sendTextMessage(senderID, "Message with attachment received");
    //}
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };
    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        async: false,
        json: messageData
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.log(response);
        }
    });
}

//Main Option
function getOptions(recipientId) {

    var userId = recipientId;
    var FBBotFramework = require('fb-bot-framework');
    // Initialize 
    var bot = new FBBotFramework({
        page_token: token,
        verify_token: "Password1"
    });
    // Setup Express middleware for /webhook 
    app.use('/webhook', bot.middleware());
    //get name of user
    bot.getUserProfile(userId, function (err, profile) {
        tmpProfile = profile;
        console.log(tmpProfile); // first name of user
        var title = "Hi, " + profile.first_name + "! What would you like to do today?";
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: title,
                            //subtitle: "",
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Upload and Print",
                                    payload: "UploadandPrint"
                                }, {
                                    type: "postback",
                                    title: "Book a Kiosk",
                                    payload: "BookaKiosk"
                                    //type: "web_url",
                                    //url: "http://www.phone2prints.com",
                                    //title: "Visit our Website"
                                }, {
                                    type: "web_url",
                                    url: "http://www.phone2prints.com",
                                    title: "View Available Promos"
                                }
                            ]
                        }]
                    }
                }
            }
        };
        callSendAPI(messageData);
    });
}

//Upload and Print Options
function UploadandPrint(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Where would you like to print your photos?",
                        buttons: [{
                            type: "postback",
                            title: "At the Kiosk",
                            payload: "AttheKiosk"
                        }, {
                            type: "postback",
                            title: "Print and Deliver",
                            payload: "PrintandDeliver"
                        }, {
                            type: "postback",
                            title: "Find a Kiosk near you",
                            payload: "FindKiosk"
                        }, {
                            type: "postback",
                            title: "Back",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//At the Kiosk Option
function AttheKiosk(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "How would you like to upload your photos?",
                        buttons: [{
                            type: "postback",
                            title: "Normal Quality",
                            payload: "NormalQuality"
                        }, {
                            type: "web_url",
                            url: "uploadprod.phone2prints.com?userid=" + recipientId + "&code=" + false,
                            title: "Higher Quality",
                            webview_height_ratio: "tall"
                        }, {
                            type: "postback",
                            title: "Cancel",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Print and Deliver Options
function PrintandDeliver(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "You can upload your photos and have them delivered to you in no time! Go to our website to start printing.",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.phone2prints.com/Phone2PrintsShop_Prod/login?userid=" + recipientId,
                            title: "Alright!",
                            webview_height_ratio: "tall"
                        }, {
                            type: "postback",
                            title: "No thanks.",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Find a Kiosk near you Option
function FindAKiosk(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "You can easily find us in these locations: " +
                            "METRO MANILA" +
                            "Alabang" +
                            "● Netopia - Metropolis Mall" +
                            "Las Piñas" +
                            "● CEU Las Piñas" +
                            "Makati" +
                            "● Century City Mall" +
                            "● CEU Gil Puyat" +
                            "● CEU Legazpi Village" +
                            "Mandaluyong" +
                            "● Caffera Photo + Café" +
                            "Manila" +
                            "● Netopia - Robinsons Manila" +
                            "● Museo Pambata" +
                            "● Bengal Brew Cafe" +
                            "● CEU Main" +
                            "● CEU School of Dentistry" +
                            "Pasig" +
                            "● Estancia Mall" +
                            "● Frankie’s - City Golf Plaza" +
                            "● Netopia - Robinsons Galleria" +
                            "Quezon City" +
                            "● Phone2Prints Showroom" +
                            "● ABS - CBN" +
                            "● Malingap Central Food Hall" +
                            "● Wagging Tails - Maginhawa" +
                            "● Snacks and Ladders - Maginhawa" +
                            "● Central Colleges of the Philippines" +
                            "● Netopia - Ali Mall" +
                            "San Juan" +
                            "● Greenhills Shopping Centre" +
                            "Taguig" +
                            "● Netopia - Market! Market!" +
                            "OUTSIDE METRO MANILA" +
                            "Malolos, Bulacan" +
                            "● CEU Malolos" +
                            "For more information, go to our kiosk locator: [Link of Kiosk Locator].See you soon!",
                        buttons: [{
                            type: "postback",
                            title: "Done",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Normal Quality Option
function NormalQualityOption(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Great! Send me your photos!",
                        buttons: [{
                            type: "postback",
                            title: "Cancel",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Upload More Option
function promptMorePhotos(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "These are nice photos! Would you like to upload more?",
                        //subtitle: "",
                        buttons: [{
                            type: "postback",
                            title: "Upload more photos!",
                            payload: "MoreUpload"
                        }, {
                            type: "postback",
                            title: "I'm done.",
                            payload: "DoneUpload"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Send more Photos Option
function sendMorePhotos(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Okay. Keep 'em coming! Send me more photos.",
                        buttons: [{
                            type: "postback",
                            title: "I'm Done!",
                            payload: "DoneUpload"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//BookAKiosk Option
function BookAKiosk(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "We’re glad you’re interested! No event is complete without taking pictures. But why stop there? Make your events more fun and memorable with Phone2Prints!",
                        buttons: [{
                            type: "postback",
                            title: "Book Now",
                            payload: "BookNow"
                        }, {
                            type: "postback",
                            title: "Rates",
                            payload: "Rates"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Book Now Option
function BookNow(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "We’d like to know more about your event! Please send us the following details in this format: Contact number - Date - Time - Location(ex. 09162223333 - 12/25/18 - 11:00AM to 3:00PM - Makati).",
                        buttons: [{
                            type: "postback",
                            title: "Cancel",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Book Now Info Option
function BookNowInfo(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Thank you! We’ll get back to you soon. Please expect a message or call from us within Mondays-Fridays at 9am-6pm.",
                        buttons: [{
                            type: "postback",
                            title: "Edit Information",
                            payload: "EditInfo"
                        }, {
                            type: "postback",
                            title: "Done",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Book Now Edit Info Option
function BookNowEditInfo(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Alright! Please send us the following details in this format: Contact number - Date - Time - Location(ex. 09162223333 - 12/25/18 - 11:00AM to 3:00PM - Makati).",
                        buttons: [{
                            type: "postback",
                            title: "Cancel",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Rates Option
function Rates(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Rent the kiosks for your events – perfect for weddings, birthdays, corporate, and all types of events!" +
                            "We offer our kiosks at these rates:" +
                            "3 hours - ₱ 6,500" +
                            "4 hours - ₱ 7,700" +
                            "5 hours - ₱ 8,900" +
                            "6 hours - ₱ 9,900" +
                            "7 hours - ₱ 10,900" +
                            "8 hours - ₱ 11,900" +
                            "9 hours - ₱ 12,900" +
                            "Exceeding 1 hour - ₱ 1,500" +
                            "* Package includes one custom frame design(portrait and landscape)" +
                            "** Additional transportation cost may apply for venues outside of Metro Manila",
                        buttons: [{
                            type: "postback",
                            title: "Book Now",
                            payload: "BookNow"
                        }, {
                            type: "postback",
                            title: "Talk to Us",
                            payload: "TalktoUs"
                        }, {
                            type: "postback",
                            title: "Thanks. I'm done!",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

//Talk to Us Option
function TalktoUs(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Our customer service representative will get back to you soon. Please expect a message or call from us within Mondays-Fridays at 9am-6pm. For more information, you may also visit our website: http://www.phone2prints.com",
                        buttons: [{
                            type: "postback",
                            title: "Done",
                            payload: "MainOption"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}


//Done Upload Option
function DoneUpload(event) {
    console.log(event);
    var senderID = event.sender.id;
    var http = require('http');
    var data = JSON.stringify({
        'authKey': "UbjsdJUa@#$&*sdbMSADKl349(*@#$!9034nZZ(asd9SDNu2349N(SDnkwersd9an",
        'fbID': senderID,
        'fbThreadID': senderID
    });

    var options = {
        host: '52.220.237.12',
        port: '80',
        path: '/FBKioskGenerator_UAT/FBKioskWebService.asmx/GetFBCode',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': data.length
        }
    };

    var req = http.request(options, function (res) {
        var fbCode = '';
        var fbUploadCount = '';
        var object = {};
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            object = JSON.parse(chunk);
            fbCode = object.d.FBCode;
            fbUploadCount = object.d.FBUploadCount;
        });
        res.on('end', function () {
            console.log(object);
            if (object.d.Result !== "True")
                sendTextMessage(senderID, "Error in Service: " + object.d.Message);
            else
                sendTextMessage(senderID, "You have uploaded " + fbUploadCount + " photo/s. Your FB Code is : " + fbCode + ". Here's a link to help you look for locations: www.phone2prints.com. You can use this code until " + object.d.FBExpiration);
            getOptions(senderID);
        });
    });

    req.write(data);
    req.end();
}

function unixTime(unixtime) {

    var u = new Date(unixtime);

    var todate = new Date(unixtime).getDate();
    var tomonth = new Date(unixtime).getMonth() + 1;
    var toyear = new Date(unixtime).getFullYear();
    var original_date = tomonth + '/' + todate + '/' + toyear;

    var hours = u.getHours() + 8;
    // Minutes part from the timestamp
    var minutes = "0" + u.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + u.getSeconds();

    return original_date + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}


function sendCSNotification(event) {
    var senderName = '';
    var FBBotFramework = require('fb-bot-framework');
    var bot = new FBBotFramework({
        page_token: token,
        verify_token: "Password1"
    });
    console.log(tmpProfile);
    // Setup Express middleware for /webhook 
    bot.getUserProfile(event.sender.id, function (err, profile) {
        senderName = profile.first_name + ' ' + profile.last_name;
        sendTextMessage(event.sender.id, "Hi " + profile.first_name + "! One of our representatives will get in touch with you shortly.");
        getOptions(event.sender.id);
    });
    var http = require('http');
    var data = JSON.stringify({
        'authKey': "UbjsdJUa@#$&*sdbMSADKl349(*@#$!9034nZZ(asd9SDNu2349N(SDnkwersd9an"
    });
    var options = {
        host: '52.220.237.12',
        port: '80',
        path: '/FBKioskGenerator_UAT/FBKioskWebService.asmx/SendCSNotification',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': data.length
        }
    };

    var req = http.request(options, function (res) {
        var object = {};
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            object = JSON.parse(chunk);
            for (var i = 0; object.d.length - 1 >= i; i++) {
                console.log(object.d[i]);
                sendTextMessage(object.d[i].FBID, "Hi " + object.d[i].Username + ". " + senderName + " wants to talk with you. Please open Kiosk page inbox. Message sent on " + unixTime(event.timestamp));
            }
        });
        res.on('end', function () {

        });
    });

    req.write(data);
    req.end();
}

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;
    // The 'payload' param is a developer-defined field which is set in a postback 
    // button for Structured Messages. 
    var payload = event.postback.payload;
    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);
    // When a postback is called, we'll send a message back to the sender to 
    // let them know it was successful

    //All payload:
    //MainOption
    //UploadandPrint
    //BookaKiosk
    //AttheKiosk
    //PrintandDeliver
    //FindKiosk
    //NormalQuality
    //MoreUpload
    //DoneUpload
    //BookNow
    //Rates
    //EditInfo
    //TalktoUs

    console.log("payload: " + payload);
    if (payload === "start") {
        getOptions(senderID);
    }
    //} else if (payload === "MainOption") {
    //    getOptions(senderID);
    //} else if (payload === "UploadandPrint") {
    //    UploadandPrint(senderID);
    //} else if (payload === "BookaKiosk") {
    //    BookAKiosk(senderID);
    //} else if (payload === "AttheKiosk") {
    //    AttheKiosk(senderID);
    //} else if (payload === "PrintandDeliver") {
    //    PrintandDeliver(senderID);
    //} else if (payload === "FindKiosk") {
    //    FindAKiosk(senderID);
    //} else if (payload === "NormalQuality") {
    //    NormalQualityOption(senderID);
    //} else if (payload === "MoreUpload") {
    //    promptMorePhotos(event);
    //} else if (payload === "DoneUpload") {
    //    DoneUpload(event);
    //} else if (payload === "BookNow") {
    //    BookNow(event);
    //} else if (payload === "Rates") {
    //    Rates(event);
    //} else if (payload === "EditInfo") {
    //    BookNowEditInfo(event);
    //} else if (payload === "TalktoUs") {
    //    TalktoUs(event);
    //    sendCSNotification(event);
    //} else {
    //    getOptions(senderID);
    //}
}

app.get('/sendCode', function (req, res) {
    sendTextMessage(req.query.id, "You have uploaded " + req.query.noOfUploaded + " photos. Your FB Code is : " + req.query.code + ". Here's a link to help you look for locations: www.phone2prints.com. You can use this code until " + req.query.dateExpiration);
    getOptions(req.query.id);
    res.send("Shazam!");
});

app.listen(app.get('port'), function () {
    console.log("running: port");
});
