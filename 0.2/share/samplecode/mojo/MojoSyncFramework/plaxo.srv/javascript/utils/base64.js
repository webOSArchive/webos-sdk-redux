//Simple base64 encoder/decoder using node buffers
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