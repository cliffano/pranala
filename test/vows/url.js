var assert = require('assert');
var url = require('../../lib/pranala/url');
var vows = require('vows');

vows.describe('URL').addBatch({
    'URL': {
        'sanitise': {
            'keeps original URL': function() {
	            assert.equal(url.sanitise('http://prn.la'), 'http://prn.la');
	            assert.equal(url.sanitise('https://prn.la'), 'https://prn.la');
            },
			'adds protocol to URL': function() {
	            assert.equal(url.sanitise('prn.la'), 'http://prn.la');
            }
        },
		'validation': {
            'returns true for valid URLs': function() {
	            assert.isTrue(url.isValid('http://prn.la'));
	            assert.isTrue(url.isValid('https://prn.la'));
	            assert.isTrue(url.isValid('https://203.12.12.255'));
	            assert.isTrue(url.isValid('http://prn.la/a/b/c'));
		        assert.isTrue(url.isValid('http://prn.la/a?src=http%3A%2F%2Fb%2Fc'));
                assert.isTrue(url.isValid('http://prn.la:8080/index.php?p=1&q=2&r=3'));            
	            assert.isTrue(url.isValid('http://www.google.com.mx/imgres?imgurl=http://akmeniko.files.wordpress.com/2008/04/2262106790_4d2cf89108.jpg&imgrefurl=http://akmeniko.wordpress.com/2008/04/27/los-noventa-fondos-de-pantalla-mas-bonitos-del-mundo/&usg=__6VcAbXbAH32Guvc6umWxHB031D8=&h=262&w=420&sz=10&hl=es&start=0&zoom=1&tbnid=s4TUsR18LxVUXM:&tbnh=129&tbnw=196&prev=/images?q=los+fondos+de+pantalla+mas+bonitos&hl=es&biw=1280&bih=580&gbv=2&tbs=isch:1&itbs=1&iact=rc&dur=565&ei=wIGGTNvrGIy8sAO4-NW5Ag&oei=lIGGTKquC46isAPb9oH3Bw&esq=9&page=1&ndsp=18&ved=1t:429,r:2,s:0&tx=110&ty=66'));
	            assert.isTrue(url.isValid('http://www.youtube.com/watch?v=5YZ3hy1sQ_E&amp;feature=autofb'));
	            assert.isTrue(url.isValid('http://en.wikipedia.org/wiki/Burlesque_%28film%29'));
	            assert.isTrue(url.isValid('http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=Dresden,+Germany&sll=37.0625,-95.677068&sspn=29.992289,79.013672&ie=UTF8&split=0&ei=EjGLTJO5FYSGkAXIyMVx&hq=&hnear=Dresden,+Saxony,+Germany&ll=51.069458,13.884691&spn=0.001449,0.004823&t=h&z=18'));
	            assert.isTrue(url.isValid('http://www.temanmacet.com/2010/09/ep-56-sparxup/?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+TemanMacet+%28Teman+Macet%29&utm_content=Google+Reader'));
	            assert.isTrue(url.isValid('http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=ghibli+museum+japan&sll=35.245619,138.251953&sspn=41.344008,57.744141&g=japan&ie=UTF8&hq=%E4%B8%89%E9%B7%B9%E5%B8%82%E7%AB%8B%E3%82%A2%E3%83%8B%E3%83%A1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E7%BE%8E%E8%A1%93%E9%A4%A8&hnear=Ghibli+Museum&ll=35.695225,139.575205&spn=0.038896,0.056391&z=14&iwloc=A&layer=c&cbll=35.69631,139.569999&panoid=U40MBkDhRtpQ2jnl0o6eGQ&cbp=12,70.21,,0,6.12'));
	            assert.isTrue(url.isValid('http://www.google.com.au/url?sa=t&source=web&cd=12&ved=0CEQQFjAL&url=http%3A%2F%2Fwww.artgallery.nsw.gov.au%2Fcollection%2Fsearch%2F%3Fartist_id%3Dostade-after-adriaen-van%26filter_by%3Dorigin_id&rct=j&q=van%20ostade&ei=1-bETICrEJHevQP-kenVCA&usg=AFQjCNH4KZCUVBGey_27zG7kTRfGoJInCQ&sig2=IPrMY-AGc8ecstvVhfNGgQ&cad=rja'));
            },
			'return false for invalid URLs': function() {
	            assert.isFalse(url.isValid('()'));
	            assert.isFalse(url.isValid('dum dee dum dee dum'));
	            assert.isFalse(url.isValid('http://prn.la some path'));
	            assert.isFalse(url.isValid(null));
	            assert.isFalse(url.isValid(undefined));
	            assert.isFalse(url.isValid('ftp://prn.la'));
		        assert.isFalse(url.isValid('http://abcdef'));
	            assert.isFalse(url.isValid('httpx://prn.la'));
	            assert.isFalse(url.isValid('prn.la'));
	            assert.isFalse(url.isValid("http://about:blank"));
	            assert.isFalse(url.isValid("ini apaan ya"));
            }
        },
		'blacklist': {
            'returns true for URLs with blacklisted domain': function() {
	            assert.isTrue(url.isBlacklisted('http://prn.la'));
	            assert.isTrue(url.isBlacklisted('http://prn.la/11A9'));
	            assert.isTrue(url.isBlacklisted('http://ow.ly:8080/index.php'));
            },
			'return false for URLs with non-blacklisted domain': function() {
	            assert.isFalse(url.isBlacklisted('http://nba.com'));
	            assert.isFalse(url.isBlacklisted('http://nba.com/lakers/threepeat'));
            }
        },
		'validate': {
            'returns correct error codes': function() {
	            assert.isNull(url.validate('http://nba.coma'));
	            assert.equal(url.validate(null), 'TIDAK_ADA');
	            assert.equal(url.validate('       '), 'TIDAK_ADA');
	            assert.equal(url.validate('http://prn.la'), 'SUDAH_DIPENDEKKAN');
	            assert.equal(url.validate('http://()'), 'TIDAK_SAHIH');
            },
            'returns correct error codes for shortened URL': function() {
	            var appUrl = 'http://prwn.la:1';
	            assert.isNull(url.validateShort('http://prwn.la:1/09', appUrl));
	            assert.isNull(url.validateShort('http://prwn.la:1/az', appUrl));
	            assert.isNull(url.validateShort('http://prwn.la:1/AZ', appUrl));
	            assert.equal(url.validateShort('http://prwn.la:1', appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort('http://prwn.la:1/', appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort('http://prwn.la:1/-', appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort('prwn.la:1', appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort(null, appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort('', appUrl), 'TIDAK_DITEMUKAN');
	            assert.equal(url.validateShort('http://nba.com', appUrl), 'TIDAK_DITEMUKAN');
            }
        }
    }
}).run();