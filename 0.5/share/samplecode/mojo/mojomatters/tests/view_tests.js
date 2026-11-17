function ViewTests() {
}

ViewTests.prototype.testWrapMultipleNodes = function testWrapMultipleNodes () {
	var singleDivContent = "<div id='single'>Now is the time.</div>"
	var nodeList = Mojo.View.convertToNodeList(singleDivContent, document);
	var wrapped = Mojo.View.wrapMultipleNodes(nodeList, document);
	Mojo.requireEqual('single', wrapped.id, "wrapped node has wrong ID.")

	var multiDivContent = "<p id='single-p'></p><div id='single'>Now is the time.</div>"
	nodeList = Mojo.View.convertToNodeList(multiDivContent, document);
	wrapped = Mojo.View.wrapMultipleNodes(nodeList, document);
	Mojo.require('single' !== wrapped.id, "wrapped node id should not be single.")
	Mojo.require('single-p' !== wrapped.id, "wrapped node id should not be single-p.")

	var textPrefixContent = "asdadasdads<div id='single'>Now is the time.</div>"
	nodeList = Mojo.View.convertToNodeList(textPrefixContent, document);
	wrapped = Mojo.View.wrapMultipleNodes(nodeList, document);
	Mojo.require('single' !== wrapped.id, "wrapped node id should not be single.")
	return Mojo.Test.passed;
}

