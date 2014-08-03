function shorten(info, tab) {
    var prnla = 'http://prn.la/?pranala=' + encodeURIComponent(info.linkUrl);
    chrome.tabs.create({url: prnla});
}
chrome.contextMenus.create({"title": chrome.i18n.getMessage("label"), "contexts": ["link"], "onclick": shorten});