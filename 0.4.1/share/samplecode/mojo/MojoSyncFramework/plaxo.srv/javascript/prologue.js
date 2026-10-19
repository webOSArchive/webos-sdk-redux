var Transport = IMPORTS["mojoservice.transport"];
var Sync = IMPORTS["mojoservice.transport.sync"];
var Foundations = IMPORTS.foundations;
var Json = IMPORTS["foundations.json"];
var Contacts = IMPORTS.contacts;
var Globalization = IMPORTS.globalization.Globalization; 


var Address = Contacts.Address;
var EmailAddress = Contacts.EmailAddress;
var IMAddress = Contacts.IMAddress;
var Organization = Contacts.Organization;
var PhoneNumber = Contacts.PhoneNumber;
var Relation = Contacts.Relation;
var Url = Contacts.Url;

var Assert = Foundations.Assert;
var AjaxCall = Foundations.Comms.AjaxCall;
var Class = Foundations.Class;
var DB = Foundations.Data.DB;
var Future = Foundations.Control.Future;
var ObjectUtils = Foundations.ObjectUtils;
var PalmCall = Foundations.Comms.PalmCall;

//load node modules
if (typeof require === "undefined") {
   require = IMPORTS.require;
}
var sys = require('sys');
var querystring = require('querystring');

//use SSL when doing basic authentication over HTTP!
var pingUrl = "https://www.plaxo.com/pdata/contacts/@me/@self"; //used with auth
var feedURL = "https://www.plaxo.com/pdata/contacts"; //used to get contacts - adjust if getting large result count

var plaxo = {} ;

//KeyStore: Used to persist key data.  Pulled from account service - can act as an abstraction layer for future upgraded account access
var globTempKey = "plaxotempkey";
var globUserAuth = {"user":"","password":""};
var globAuthCode = {};
var credData = {};
var globAccountId = "";

