$(document).ready(function () {
    init();
});

var init = function() {
	if ($('#shorten')) {
	    var value = $('#url').val();
	    if (value && value !== 'http://') {
		    $('#shorten').click();
	    }
	}
};

var encode = function(url, lang) {
    var texts = {
        'en': {
            "label": "Short link",
            "action": {
                "visit": "Visit",
                "tweet": "Tweet",
                "qr": "QR Code"  
            },
            "error": {
                "ALREADY_SHORTENED": "The link is already shortened",
                "BLACKLISTED": "This link is blacklisted due to spamming activities.",
                "EMPTY": "Please provide the link to be shortened",
                "INVALID": "Invalid link",
                "NOT_FOUND": "The provided short link does not exist in our system",
                "UNEXPECTED": "Unexpected error occured while trying to shorten the link."
            }
        },
        'id': {
            "label": "Pranala pendeknya",
            "action": {
                "visit": "Kunjungi",
                "tweet": "Twit",
                "qr": "Kode QR"
            },
            "error": {
                "ALREADY_SHORTENED": "Lho gan, sepertinya pranalanya sudah dipendekkan ya?",
                "BLACKLISTED": "Pranala ini sudah didaftarhitamkan karena aktifitas spamming.",
                "EMPTY": "Maaf gan, tolong sediakan pranalanya dahulu",
                "INVALID": "Maaf gan, pranalanya tidak valid",
                "NOT_FOUND": "Pranala pendek yang anda sediakan tidak dapat ditemukan di sistem kami",
                "UNEXPECTED": "Maaf gan, bautnya ada yang lepas."
            }
        }
    };
    texts = texts[lang];
    var targetUrl = '/x?long=' + encodeURIComponent(url) + '&format=json';
    $('#indicator').show();
    $.ajax({
        type: 'GET',
        url: targetUrl,
        async: false,
        success: function(data, status, request) {
            var result = JSON.parse(data);
            $('#indicator').hide();
            var text;
            if (result.status === 'success') {
                text = texts.label + ' &raquo;'
                    + '<input id="answer" class="success" onclick="this.select(); copy(this);" type="text" readonly="true" value="' + result.short + '"/>'
                    + '<ul id="result_action">'
                    + '<li><a href="' + result.short + '">' + texts.action.visit + '</a></li>'
                    + '<li><a href="http://twitter.com/home?status=' + result.short + '">' + texts.action.tweet + '</a></li>'
                    + '<li><a href="' + result.short + '/qr">' + texts.action.qr + '</a></li>'
                    + '</ul>';
            } else {
                text = '<div class="signal error">!</div> ' + texts.error[result.message];
            }
            $('#result').html(text);
        },
        error: function(request, status, message) {
            $('#result').append('<div class="signal error">!</div> ' + texts.error['UNEXPECTED'] + ' ' + status + ': ' + message);
        }
    });
}

var openExternal = function(url) {
    window.open(url);
    return false;
};