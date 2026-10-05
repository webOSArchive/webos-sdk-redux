//...
//... Load the Foundations library and create
//... short-hand references to some of its components.
//...
var _ = IMPORTS.underscore._;
var Transport = IMPORTS["mojoservice.transport"];
var Sync = IMPORTS["mojoservice.transport.sync"];
var Foundations = IMPORTS.foundations;
var Json = IMPORTS["foundations.json"];
var XML = IMPORTS["foundations.xml"];
var Calendar = IMPORTS.calendar;
var IO = IMPORTS["calendar.io"];
var stringify = IO.stringify;
var Utils = IO.Utils;
IO = IO.IO;

var AjaxCall = Foundations.Comms.AjaxCall;
var Assert = Foundations.Assert;
var Class = Foundations.Class;
var DB = Foundations.Data.DB;
var Future = Foundations.Control.Future;
var mapReduce = Foundations.Control.mapReduce;
var ObjectUtils = Foundations.ObjectUtils;
var PalmCall = Foundations.Comms.PalmCall;
var StringUtils = Foundations.StringUtils;

//..
//.. Returns the current date/time in the format Plaxo expects. 
//...Used in syncing.
//..
function calcSyncDateTime()
{
    // Gets the current date/time and put it in the format Plaxo is expecting
    var d = new Date();
    var hour = d.getHours();
    var seconds = d.getSeconds();

    if (seconds < 10) seconds = "0"+seconds;
    if (hour < 10)  hour= "0"+hour;

    var syncDateTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() +"T"+hour+":"+d.getMinutes()+":"+seconds+"Z"; 
    return(syncDateTime);
}


//Simple base64 encoder/decoder using node buffers - used to encode password
var Base64 = {
   encode : function (utf8Data) {
      var localBase64 = new Buffer(utf8Data, 'utf8');
      return localBase64.toString('base64');
   },
 
   decode : function (base64Data) {
      var localUTF8 = new Buffer(base64Data, 'base64');
      return localUTF8.toString('utf8');
   }
};