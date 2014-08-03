la_prn_pranafox.Pranala = name_edwards_dean_Base.extend({
    shorten: function (longUrl) {
        
        var ffPreferencesService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
        var url = ffPreferencesService.getCharPref('extensions.pranafox.url') + encodeURIComponent(longUrl);
        if (ffPreferencesService.getCharPref('extensions.pranafox.openpage') == 'newtab') {
            getBrowser().addTab(url);
        } else {
            getBrowser().loadURI(url);
        }
    },
    setMenuVisibility: function() {
        var contextMenu = document.getElementById('contentAreaContextMenu');
        if (contextMenu) {
            contextMenu.addEventListener('popupshowing', this._setMenuVisibility, false);
        }
    },
    _setMenuVisibility: function() {
        if (gContextMenu) {
            document.getElementById('pranafox-context-menu-addlink').hidden = !(gContextMenu.onLink && !gContextMenu.onMailtoLink);
        }
    }
});