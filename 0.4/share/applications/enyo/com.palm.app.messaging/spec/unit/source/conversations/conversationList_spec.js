describe('Messaging ConversationList Unit Test', function() {
	
//	var conversationList = new ConversationList();
	var conversationList = new ConversationList();

	it('conversationList.isDifferent() Test', function() {
		expect(conversationList);	
			
		expect(conversationList.isDifferent(undefined, undefined)).toBeFalsy();
		expect(conversationList.isDifferent(["a"], undefined)).toBeTruthy();
		expect(conversationList.isDifferent(undefined, ["a"])).toBeTruthy();
		expect(conversationList.isDifferent(["a"], ["a"])).toBeFalsy();
		expect(conversationList.isDifferent(["a", "b"], ["b","a"])).toBeFalsy();
		expect(conversationList.isDifferent(["a", "b"], ["a","b"])).toBeFalsy();
		expect(conversationList.isDifferent(["a"], ["b","a"])).toBeTruthy();
		expect(conversationList.isDifferent(["b"], ["b","a"])).toBeTruthy();
		expect(conversationList.isDifferent(["c"], ["b","a"])).toBeTruthy();
		expect(conversationList.isDifferent(["a"], ["b"])).toBeTruthy();
		expect(conversationList.isDifferent(["b","a"], ["a"])).toBeTruthy();
		expect(conversationList.isDifferent(["b","a"], ["b"])).toBeTruthy();
		expect(conversationList.isDifferent(["b","a"], ["c"])).toBeTruthy();
		expect(conversationList.isDifferent([], ["b"])).toBeTruthy();
	});	
})