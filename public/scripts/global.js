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
                "tweet": "Tweet"  
            },
            "error": {
                "SUDAH_DIPENDEKKAN": "The link is already shortened.",
                "TIDAK_ADA": "Please provide the link to shorten.",
                "TIDAK_SAHIH": "Invalid link.",
                "TIDAK_DITEMUKAN": "The provided short link does not exist in our system."
            }
        },
        'id': {
            "label": "Pranala pendeknya",
            "action": {
                "visit": "Kunjungi",
                "tweet": "Twit"  
            },
            "error": {
                "SUDAH_DIPENDEKKAN": "Lho gan, sepertinya pranalanya sudah dipendekkan ya?",
                "TIDAK_ADA": "Maaf gan, tolong sediakan pranalanya dahulu.",
                "TIDAK_SAHIH": "Maaf gan, pranalanya tidak valid.",
                "TIDAK_DITEMUKAN": "Pranala pendek yang anda sediakan tidak dapat ditemukan di sistem kami."
            }
        }
    };
    texts = texts[lang];
    var targetUrl = '/x?panjang=' + encodeURIComponent(url) + '&format=json';
    $('#indicator').show();
    $.ajax({
        type: 'GET',
        url: targetUrl,
        async: false,
        success: function(data, status, request) {
            var result = JSON.parse(data);
            $('#indicator').hide();
            var text;
            if (result.status === 'sukses') {
                text = texts.label + ' &raquo;'
                    + '<input id="answer" class="success" onclick="this.select(); copy(this);" type="text" readonly="true" value="' + result.pendek + '"/>'
                    + '<ul id="result_action">'
                    + '<li><a href="' + result.pendek + '">' + texts.action.visit + '</a></li>'
                    + '<li><a href="http://twitter.com/home?status=' + result.pendek + '">' + texts.action.tweet + '</a></li>'
                    + '</ul>';
            } else {
                text = '<div class="signal error">!</div> ' + texts.error[result.pesan];
            }
            $('#result').html(text);
        },
        error: function(request, status, message) {
            $('#result').append('<div class="signal error">!</div> Maaf gan, bautnya ada yang lepas. ' + status + ': ' + message);
        }
    });
}

var openExternal = function(url) {
    window.open(url);
    return false;
};