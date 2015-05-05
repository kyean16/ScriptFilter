var EXPORTED_SYMBOLS = ['ParserUrl'];

//Constructor
ParserUrl = function(aURL) {
this._original = aURL;
  this.setLocation(aURL);
};

ParserUrl.prototype = {
    _url : null,
    _original : null,
    
    /**
     *Sets match according to the different part of a uri.
     */
    setLocation : function(href)
    {
      //http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
      var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
       newMatch = match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
      }
      this._url = newMatch;
    },
   /**
   * Gets the user URL.
   * @return the user URL.
   */
  get url() {
    return this._url;
  },
  /**
   *@return the hostname URI
   */
  get hostname(){
    return this._url.hostname;
  },
  /**
   *@return the original name of the URI
   */
  get fullLink(){
    return this._original;
  }
}