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
}

var encode = function(url) {
	var texts = {
	  "error_SUDAH_DIPENDEKKAN": "Lho gan, sepertinya pranalanya sudah dipendekkan ya?",
	  "error_TIDAK_ADA": "Maaf gan, tolong sediakan pranalanya dahulu.",
	  "error_TIDAK_SAHIH": "Maaf gan, pranalanya tidak valid.",
	  "error_TIDAK_DITEMUKAN": "Pranala pendek yang anda sediakan tidak dapat ditemukan di sistem kami."
  }
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
        text = 'Pranala pendeknya &raquo; <input id="answer" class="success" onclick="this.select(); copy(this);" type="text" readonly="true" value="' + result.pendek + '"/> <a href="' + result.pendek + '">Kunjungi</a>';
      } else {
        text = '<div class="signal error">!</div> ' + texts['error_' + result.pesan];
      }
      $('#result').html(text);
    },
    error: function(request, status, message) {
      $('#result').append('<div class="signal error">!</div> Maaf gan, bautnya ada yang lepas. ' + status + ': ' + message);
    }
  });
}