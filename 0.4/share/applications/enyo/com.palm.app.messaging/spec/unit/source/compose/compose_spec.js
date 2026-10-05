describe('Messaging Compose Unit Test', function() {
	
	var imTransportList = new ImTransportList();

	it('ImTransportList.getNumberString() Test', function() {
		expect(imTransportList);	
			
		expect(imTransportList.getNumberString("ABCabc")).toEqual("222222");
		expect(imTransportList.getNumberString("DEFdef")).toEqual("333333");
		expect(imTransportList.getNumberString("GHIghi")).toEqual("444444");
		expect(imTransportList.getNumberString("JKLjkl")).toEqual("555555");
		expect(imTransportList.getNumberString("MNOmno")).toEqual("666666");
		expect(imTransportList.getNumberString("PQRSpqrs")).toEqual("77777777");
		expect(imTransportList.getNumberString("TUVtuv")  ).toEqual("888888");
		expect(imTransportList.getNumberString("WXYZwxyz")).toEqual("99999999");
		expect(imTransportList.getNumberString("AD@")).toBeNull();
	});	

	
	it('ImTransportList.translateToPhonepadDigit() Test', function() {
		expect(imTransportList);	
		
		expect(imTransportList.translateToPhonepadDigit("A")).toEqual(2);
		expect(imTransportList.translateToPhonepadDigit("B")).toEqual(2);
		expect(imTransportList.translateToPhonepadDigit("C")).toEqual(2);
		expect(imTransportList.translateToPhonepadDigit("a")).toEqual(2);
		expect(imTransportList.translateToPhonepadDigit("b")).toEqual(2);
		expect(imTransportList.translateToPhonepadDigit("c")).toEqual(2);
		
		expect(imTransportList.translateToPhonepadDigit("D")).toEqual(3);
		expect(imTransportList.translateToPhonepadDigit("E")).toEqual(3);
		expect(imTransportList.translateToPhonepadDigit("F")).toEqual(3);
		expect(imTransportList.translateToPhonepadDigit("d")).toEqual(3);
		expect(imTransportList.translateToPhonepadDigit("e")).toEqual(3);
		expect(imTransportList.translateToPhonepadDigit("f")).toEqual(3);
		
		expect(imTransportList.translateToPhonepadDigit("G")).toEqual(4);
		expect(imTransportList.translateToPhonepadDigit("H")).toEqual(4);
		expect(imTransportList.translateToPhonepadDigit("I")).toEqual(4);
		expect(imTransportList.translateToPhonepadDigit("g")).toEqual(4);
		expect(imTransportList.translateToPhonepadDigit("h")).toEqual(4);
		expect(imTransportList.translateToPhonepadDigit("i")).toEqual(4);
		
		expect(imTransportList.translateToPhonepadDigit("J")).toEqual(5);
		expect(imTransportList.translateToPhonepadDigit("K")).toEqual(5);
		expect(imTransportList.translateToPhonepadDigit("L")).toEqual(5);
		expect(imTransportList.translateToPhonepadDigit("j")).toEqual(5);
		expect(imTransportList.translateToPhonepadDigit("k")).toEqual(5);
		expect(imTransportList.translateToPhonepadDigit("l")).toEqual(5);
	
		expect(imTransportList.translateToPhonepadDigit("M")).toEqual(6);
		expect(imTransportList.translateToPhonepadDigit("N")).toEqual(6);
		expect(imTransportList.translateToPhonepadDigit("O")).toEqual(6);
		expect(imTransportList.translateToPhonepadDigit("m")).toEqual(6);
		expect(imTransportList.translateToPhonepadDigit("n")).toEqual(6);
		expect(imTransportList.translateToPhonepadDigit("o")).toEqual(6);

		expect(imTransportList.translateToPhonepadDigit("P")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("Q")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("R")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("S")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("p")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("q")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("r")).toEqual(7);
		expect(imTransportList.translateToPhonepadDigit("s")).toEqual(7);

		expect(imTransportList.translateToPhonepadDigit("T")).toEqual(8);
		expect(imTransportList.translateToPhonepadDigit("U")).toEqual(8);
		expect(imTransportList.translateToPhonepadDigit("V")).toEqual(8);
		expect(imTransportList.translateToPhonepadDigit("t")).toEqual(8);
		expect(imTransportList.translateToPhonepadDigit("u")).toEqual(8);
		expect(imTransportList.translateToPhonepadDigit("v")).toEqual(8);

		expect(imTransportList.translateToPhonepadDigit("W")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("X")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("Y")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("Z")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("w")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("x")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("y")).toEqual(9);
		expect(imTransportList.translateToPhonepadDigit("z")).toEqual(9);
		
		expect(imTransportList.translateToPhonepadDigit("@")).toEqual(-1);
	});		

})