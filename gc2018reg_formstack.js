'use strict';
/* global console */
/* global $ */
/* global EvaluatePaymentAmount */

function  FF_OnAfterRender(){
	console.log('FF_OnAfterRender');
	// populate GC attendance status field
	var gcAttendanceStatus = $("select[name='X2018_General_Council__c.I_will_attend_General_Council_as_a__c'] option:selected").val();
	$("#gcAttendanceStatus").text(gcAttendanceStatus);

	$(".hasDatepicker").each(function(){
		$(this).datepicker("destroy");
		$(this).datepicker({
			dateFormat: "mm/dd/yy",
			format: "mm/dd/yy",
	    useCurrent: false,
	    showClose: true,
	    minDate: new Date('08/06/2018'),
	    maxDate: new Date('08/12/2018'),
			});
	});
return true;
}

function changeLabels() {
	// better labeling for CVV and expiration date fields
	$("#lblFFSubTotalAmount205").text('Total');
	$("#lblFFCVV205").html('CVV &#40;3-digit number on back of card&#41;');
	$("#lblFFExpiry205").text('Expiration Date');
}

function setTransactionDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();

	if (dd < 10) {
	  dd = '0' + dd
	}

	if (mm < 10) {
    mm = '0' + mm
	}

	today = mm + '/' + dd + '/' + yyyy;
  return today;
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

$('#X2018_General_Council__c.Lodging_Check_in_Date__c').focus(function() {
	$.datepicker({
    format: 'YYYY-MM-DD',
    useCurrent: false,
    showClose: true,
    minDate: '2018-08-06',
    maxDate: '2018-08-12',
})
})

function itemize(lodgedays, adultMeals, childMeals) {
	$('#genlodgingdays').text(lodgedays);
	$('#genadultmeals').text(adultMeals);
	$('#genchildmeals').text(childMeals);
}

function calculateLodgingSubTotal(lodgingDays){
	var lodgingSub=0;
	var roomType=$("select[name='X2018_General_Council__c.Are_you_willing_to_share_a_room__c'] option:selected").val();
	var lodgingEx=$('#X2018_General_Council__c\\.Lodging_exception__c').is(':checked');
	var pet=$('#X2018_General_Council__c\\.Pet_friendly_room__c').is(':checked');
	var serviceAnimal=$('#X2018_General_Council__c\\.Registered_service_animal__c').is(':checked');

	console.log('Lodging days: ' + lodgingDays);
	console.log('lodgingEx: ' + lodgingEx);
	console.log('roomType: ' + roomType);
	if (roomType === "No" && !lodgingEx) {
			lodgingSub = (lodgingDays * 64);
			console.log('Charged for room: ' + lodgingSub);
		}
	if (pet && !serviceAnimal) {
		lodgingSub = ((lodgingDays * 64) + 50);
		console.log('Single room plus pet fee:  ' + lodgingSub);
	}

	return lodgingSub;
}

function reCalculateLodgingSubtotal(lodgeDays) {
	var lodgingSub=0;
	var lodgingDays=0;
	lodgingDays=getNumericVal(lodgeDays,0);
	lodgingSub=calculateLodgingSubTotal(lodgingDays);
	 $('#X2018_General_Council__c\\.Lodging_subtotal__c').val(lodgingSub);
	var adultMeals=getNumericVal($('#X2018_General_Council__c\\.Adult_guest_meals__c').val(),0);
	var childMeals=getNumericVal($('#X2018_General_Council__c\\.Child_guest_meals__c').val(),0);
	itemize(lodgingDays,adultMeals,childMeals);
}

function executeEvaluatePaymentAmount(noOfDays){
	if (noOfDays !== '') {
	var numberOfDays = 0;
		try {
			numberOfDays = parseInt(noOfDays);
		}
		 catch(err) {
		 	console.log(err);
		}

	new EvaluatePaymentAmount('SUBTOTAL',
		'205',
		'["X2018_General_Council__c\\\\.Adult_guest_meals__c"].val * 20 + ["X2018_General_Council__c\\\\.Child_guest_meals__c"].val * 10 + IF(["X2018_General_Council__c\\\\.Are_you_willing_to_share_a_room__c"].amount = 3 & ["X2018_General_Council__c\\\\.Lodging_exception__c"].amount = 0,' +numberOfDays + ' * 64 ,0) +IF(["X2018_General_Council__c\\\\.Pet_friendly_room__c"].amount = 1 & ["X2018_General_Council__c\\\\.Registered_service_animal__c"].amount = 0,50, 0)');
	}
	changeLabels();
}

function daysDiffLodgingCheckInOut() {
	// calculate total number of days of lodging requested
	var returnVal=0;
	var checkInVal=$('#X2018_General_Council__c\\.Lodging_Check_in_Date__c').val();
	console.log(`checkInVal: ${checkInVal}`);
	var checkOutVal=$('#X2018_General_Council__c\\.Lodging_Check_out_Date__c').val();
	// console.log(`checkOutVal: ${checkOutVal}`);
	if (checkInVal !== 'undefined' && checkInVal !== '' && checkOutVal !== 'undefined' && checkOutVal !== '') {
			var checkinDate = new Date(checkInVal);
			var checkoutDate = new Date(checkOutVal);
			// console.log(`checkinDate: ${checkinDate}, checkoutDate: ${checkoutDate}`);
			var ms = Math.abs(checkoutDate - checkinDate);
			// console.log(`ms: ${ms}`);
			returnVal = Math.floor(ms/1000/60/60/24);
			// console.log(`returnVal: ${returnVal}`);
		} else {
			returnVal = 0;
		}

	reCalculateLodgingSubtotal(returnVal);
	executeEvaluatePaymentAmount(returnVal);

	return returnVal;
}

function lodgingSubtotal() {
	var lodgingSub = 0;
	var lodgingDays = getNumericVal($('#X2018_General_Council__c\\.Lodging_number_of_days__c').val(),0);
	lodgingSub = calculateLodgingSubTotal(lodgingDays);

	var adultMeals = getNumericVal($('#X2018_General_Council__c\\.Adult_guest_meals__c').val(),0);
	var childMeals = getNumericVal($('#X2018_General_Council__c\\.Child_guest_meals__c').val(),0);
	itemize(lodgingDays,adultMeals,childMeals);
	return lodgingSub;
}

function mealsSubtotal() {
	var lodgingDays = getNumericVal($('#X2018_General_Council__c\\.Lodging_number_of_days__c').val(),0);
	var adultMeals = getNumericVal($('#X2018_General_Council__c\\.Adult_guest_meals__c').val(),0);
	var childMeals = getNumericVal($('#X2018_General_Council__c\\.Child_guest_meals__c').val(),0);
	var mealsSub = 0;
	if (adultMeals !==0 || childMeals !==0) {
	 mealsSub = (adultMeals * 20) + (childMeals * 10);
	} else  {
		mealsSub = 0;
	}

	itemize(lodgingDays,adultMeals,childMeals);
	return mealsSub;
}


//////
const stripePaymentFormula =
["X2018_General_Council__c.Adult_guest_meals__c"].val*20+["X2018_General_Council__c.Child_guest_meals__c"].val*10+IF(((["X2018_General_Council__c.Are_you_willing_to_share_a_room__c"].amount=3) &amp;&amp; ["X2018_General_Council__c.Lodging_exception__c"].amount=0) || (["X2018_General_Council__c.Pet_friendly_room__c"].amount=1 &amp;&amp; ["X2018_General_Council__c.Registered_service_animal__c"].amount=0),(64*["X2018_General_Council__c.Lodging_number_of_days__c"].val),0)+IF(["X2018_General_Council__c.Pet_friendly_room__c"].amount=1 &amp;&amp; ["X2018_General_Council__c.Registered_service_animal__c"].amount=0, 50,0)