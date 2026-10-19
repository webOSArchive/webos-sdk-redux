function EncryptDecryptTest() {
	this.window = window;
}

EncryptDecryptTest.prototype.testBasic = function(recordResults) {
	var key = 'abcdefgh';
	var data = 'The quick red fox jumped over the lazy brown dog.';
	
	var encrypted = Mojo.Model.encrypt(key, data);
	Mojo.require(encrypted !== data, "Encryption failed.");

	var decrypted = Mojo.Model.decrypt(key, encrypted);
	Mojo.require(decrypted === data, "Decryption failed: '" + decrypted + "'");

	return Mojo.Test.passed;
};
