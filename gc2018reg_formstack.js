function  FF_OnAfterRender(){
	console.log('FF_OnAfterRender');
	// populate address fields in text block programmatically
	// from mailing address data
	var val0 = $('#Contact\\.MailingStreet').val() || $('#Contact\\.MailingStreet').val();
	console.log(val0);
	$('#genstreet').text(val0);
	var val1 = $('#Contact\\.MailingCity').val();
	$('#gencity').text(val1);
	var val2 = $('#Contact\\.MailingPostalCode').val();
	$('#genzip').text(val2);
	var val3 = $('#Contact\\.MobilePhone').val();
	$('#genmobile').text(val3);
	var val4 = $('#Contact\\.HomePhone').val();
	$('#genphone').text(val4);
	// ?? is this going anywhere? looks like an unused variable
	var val5 = $('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_number_of_days__c').val();
}

function changeLabels() {
	// better labeling for CVV and expiration date fields
	$("#lblFFSubTotalAmount61").text('Total');
	$("#lblFFCVV61").html('CVV &#40;3-digit number on back of card&#41;');
	$("#lblFFExpiry61").text('Expiration Date');
}

function daysDiffLodgingChekInOut() {
	// calculate total number of days of lodging requested
	var returnVal=0;
	var checkInVal=$('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_Check_in_Date__c').val();
	var checkOutVal=$('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_Check_out_Date__c').val();
	if (checkInVal!=='undefined' && checkInVal!=='' && checkOutVal!=='undefined' && checkOutVal!=='') {
			var checkinDate=new Date(checkInVal);
			var checkoutDate=new Date(checkOutVal);
			var ms = Math.abs(checkoutDate-checkinDate);
			returnVal= Math.floor(ms/1000/60/60/24);
		} else {
			returnVal=0;
		}

	reCalculateLodgingSubtotal(returnVal);
	executeEvaluatePaymentAmount(returnVal);
	return returnVal;
}

function executeEvaluatePaymentAmount(noOfDays){
	if (noOfDays !== '') {
	var numberOfDays=0;
		try {
			numberOfDays = parseInt(noOfDays);
		}
		 catch(err) {
		 	console.log(err);
		}

	EvaluatePaymentAmount('SUBTOTAL','61','["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Friday_celebration_adult_guest_meals__c"].val*24.5+["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Friday_celebration_child_guest_meals__c"].val*12.5+IF(["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Room_type__c"].amount=1 & ["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Lodging_exception__c"].amount=0,'+numberOfDays+'*58,0)+IF(["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Room_type__c"].amount=2 & ["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.Lodging_exception__c"].amount=0 & ["Contact\\\\.soslula__Event_Attendee__c\\\\.A\\\\.My_roommate_is__c"].amount=2,'+numberOfDays+'*58,0)');
	}
}

function reCalculateLodgingSubtotal(lodgeDays) {
	var lodgingSub=0;
	var lodgingDays=0;
	lodgingDays=getNumericVal(lodgeDays,0);
	lodgingSub=calculateLodgingSubTotal(lodgingDays);
	 $('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_subtotal__c').val(lodgingSub);
	var adultMeals=getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_adult_guest_meals__c').val(),0);
	var childMeals=getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_child_guest_meals__c').val(),0);
	itemize(lodgingDays,adultMeals,childMeals);
}

function calculateLodgingSubTotal(lodgingDays){
	var lodgingSub=0;
	var roomType=$('#Contact\\.soslula__Event_Attendee__c\\.A\\.Room_type__c').val();
	var lodgingEx=$('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_exception__c').is(':checked');
	var roommate=$('#Contact\\.soslula__Event_Attendee__c\\.A\\.My_roommate_is__c').val();

	console.log('Lodging days: ' + lodgingDays);
	console.log('lodgingEx: ' + lodgingEx);
	if (roomType === "Single Room (1 person - 1 Bed)" && (!lodgingEx)) {
		lodgingSub = (lodgingDays * 58);
		console.log('Single room: ' + lodgingSub);
	} else if (roomType === "Double Room (2 People - 1 Bed)" && roommate === "Not an SEIU 503 member" && (!lodgingEx)) {
		lodgingSub = (lodgingDays * 58);
		console.log('Double room 1: ' + lodgingSub);
	} else if (roomType === "Double Room (2 People - 2 Beds)" && roommate === "Not an SEIU 503 member" && (!lodgingEx)) {
		lodgingSub = (lodgingDays * 58);
		console.log('Double room 2: ' + lodgingSub);
	}
	return lodgingSub;
}

function lodgingSubtotal() {
	var lodgingSub = 0;
	var lodgingDays = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_number_of_days__c').val(),0);
	lodgingSub = calculateLodgingSubTotal(lodgingDays);

	var adultMeals = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_adult_guest_meals__c').val(),0);
	var childMeals = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_child_guest_meals__c').val(),0);
	itemize(lodgingDays,adultMeals,childMeals);
	return lodgingSub;
}

function mealsSubtotal() {
	var lodgingDays = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Lodging_number_of_days__c').val(),0);
	var adultMeals = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_adult_guest_meals__c').val(),0);
	var childMeals = getNumericVal($('#Contact\\.soslula__Event_Attendee__c\\.A\\.Friday_celebration_child_guest_meals__c').val(),0);
	var mealsSub = 0;
	if (adultMeals !==0 || childMeals !==0) {
	 mealsSub = (adultMeals * 24.5) + (childMeals * 12.5);
	} else  {
		mealsSub = 0;
	}

	itemize(lodgingDays,adultMeals,childMeals);
	return mealsSub;
}

function getNumericVal(actualValue, defaultValue) {
	var returnValue=0;
	try {
		returnValue=parseInt(actualValue);
		if (Number.isNaN(Number(returnValue))) {
			returnValue=defaultValue;
		}
	}
	catch(err) {
		returnValue = defaultValue;
	}
	return returnValue;
}

function itemize(lodgedays, adultMeals, childMeals) {
	$('#genlodgingdays').text(lodgedays);
	$('#genadultmeals').text(adultMeals);
	$('#genchildmeals').text(childMeals);
}