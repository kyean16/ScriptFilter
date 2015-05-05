var EXPORTED_SYMBOLS = ['BlackList'];
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");

//Constructor
BlackList = function(aURL) {
  this._url = aURL;
  this._status = false;
  this.setStatus();
};

/**
 * User class methods.
 */
BlackList.prototype = {
  _url : null,
  _status: null,
  
  /**
   *Sets the Status of the url whether or not is blacklisted or not.
   */
  setStatus: function()
  {
    var file = FileUtils.getFile("UChrm", ["BlackList.csv"]); //Set path of file
    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
              createInstance(Components.interfaces.nsIFileInputStream);
    istream.init(file, 0x01, 0444, 0);
    istream.QueryInterface(Components.interfaces.nsILineInputStream);
    //Goes through the list of blacklisted websites and if it is it automatically redirects to an example webpage
    var line = {}, lines = [], hasmore;
    do {
      hasmore = istream.readLine(line);
      if (this._url == line.value)
      {
        this._status = true;
        break;
      }
    } while(hasmore);
     
    istream.close();
  },
  
  checkBlackList: function()
  {
  
  },
  
  /**
   * Gets the user URL.
   * @return the user URL.
   */
  get url() {
    return this._url;
  },
  
  /**
   * Gets the user status.
   * @return the user status.
   */
  get status(){
    return this._status;
  },
  
};