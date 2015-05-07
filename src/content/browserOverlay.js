Components.utils.import("chrome://filterScript/content/blackList.js");
Components.utils.import("chrome://filterScript/content/parserUrl.js")
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");
var Ci = Components.interfaces;

//Variable that listens for http requests coming from the client
var httpRequestObserver =
{
  oldLocation : null,
  count : 1,
  observe : function(aSubject, aTopic, aData)
  {
    
    
    if ("http-on-modify-request" == aTopic)
    { //If the http requested is different
      //window.alert("here");
      var httpChannel = aSubject.QueryInterface(Ci.nsIHttpChannel);
      var uri = httpChannel.URI.spec; //uri == to the URI address
      var l = new ParserUrl(uri); //set l to the parsed version of the uri
      let user = new BlackList(l.hostname); //Create a user object that checks whether or nor no l.hostname is blacklisted or not.
      this.loggingASubject(uri); //Logs the http request, be careful takes a quite a lot of space overtime
      if (user.status == true) //If blacklisted
      {
        gBrowser.docShell.allowJavascript = false; //Turn off javascript
        //httpChannel.cancel(Cr.NS_BINDING_ABORTED);
        httpChannel.redirectTo(Services.io.newURI("http://example.org/", null, null)); //Redirects, Blocks
        //window.alert(user.lines);
      }
      //To Modify So it is always false if it still on the same webpage.
      else
      {
        gBrowser.docShell.allowJavascript = true; //Turn on javascript
      }
    }
    else if ("http-on-examine-response" == aTopic) //This event is fired whenever a response is received from the server, but before any data are available.
    {
      var newListener = new TracingListener();
      aSubject.QueryInterface(Ci.nsITraceableChannel);
      newListener.originalListener = aSubject.setNewListener(newListener);
    }
  },
  
  shouldLoad : function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
  let result = Components.interfaces.nsIContentPolicy.ACCEPT;

  // we should check for TYPE_SUBDOCUMENT as well if we want frames.
  if ((Components.interfaces.nsIContentPolicy.TYPE_DOCUMENT == aContentType) &&
      SOME_REGULAR_EXPRESSION.test(aContentLocation.spec)) {
    // do stuff here, possibly changing result.
  }

    alert(result);
  },
  
  QueryInterface: function(aIID)
  {
    if (aIID.equals(Ci.nsIObsever) || aIID.equals(Ci.nesISupports))
    {
      return this;
    }
    throw Components.results.NS_NOINTERFACE;
  },
  
  //http://www.softwareishard.com/blog/firebug/nsitraceablechannel-intercept-http-traffic/
  
  loggingASubject: function(uri) //Logs the username
  {
    var file = FileUtils.getFile("UChrm", ["Testing.csv"]); //Set path of file
    if (!file.exists())
    {
      file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
      //window.alert(file.path); //Prints path of the file
    }
    //https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O
      var ostream = Cc["@mozilla.org/network/file-output-stream;1"].
      createInstance(Ci.nsIFileOutputStream);
      ostream.init(file, 18, 0x200, false); //Allows Append.
      const TEST_DATA = "\n" + uri;
      let istream = Cc["@mozilla.org/io/string-input-stream;1"].
      createInstance(Ci.nsIStringInputStream);
      istream.setData(TEST_DATA, TEST_DATA.length);
      NetUtil.asyncCopy(istream, ostream, function(aResult)
      {
        if (!Components.isSuccessCode(aResult)) //In case of erros
        {
        }
      })
  },
  
  register: function() //Add observer
  {
    observerService.addObserver(this, "http-on-modify-request", false);
    observerService.addObserver(this, "http-on-examine-response", false);
  },

  unregister: function() //Remove observer
  {
    observerService.removeObserver(this, "http-on-modify-request");
    observerService.removeObserver(this, "http-on-examine-response");
  }
};


/**
 * var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
           getService(Components.interfaces.nsIWindowMediator);
  var recentWindow = wm.getMostRecentWindow("navigator:browser");
  window.alert(recentWindow ? recentWindow.content.document.location : null);
  Get the current url
*/

//


  // Helper function for XPCOM instanciation (from Firebug)
function CCIN(cName, ifaceName) {
    return Cc[cName].createInstance(Ci[ifaceName]);
}

// Copy response listener implementation.
function TracingListener() {
    this.originalListener = null;
    this.receivedData = [];   // array for incoming data.
}

TracingListener.prototype =
{
    
    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
                "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
                "nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);
        this.receivedData.push(data)
        var d = data.match(/function/g);///window.alert(data.toSource());
        binaryOutputStream.writeBytes(data, count);
        //this.notificationBox(data);
        if (d == null) {
          window.alert(data);
        }
        //window.alert(data);

        this.originalListener.onDataAvailable(request, context,
            storageStream.newInputStream(0), offset, count);
    },
    
  notificationBox: function(message) //Notification Alert 
  {
    let alertsService =
    Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
    let title = ("ScriptFilter");
    alertsService.showAlertNotification(
    "chrome://scriptFilter/skin/grey.png",
    title, message, true, "", this, "Message");
  },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
        // Get entire response
        var responseSource = this.receivedData.join();
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
    
}


//

//Button Clicked ToolBar
BrowserOverlay = {
  
  toolbarClick : function(aEvent)
  {
    var barImageElement = document.getElementById("filterScript-button"); //Sets barImageElement to ID
    if ( "on" == barImageElement.getAttribute("status")) //If status is on
    {
      barImageElement.setAttribute("status", "off");
      httpRequestObserver.unregister(); //Removes Listener
      gBrowser.docShell.allowJavascript = true;
      //this.notificationBox("Add-On Disabled")
    }
    else //Add Listener
    {
      barImageElement.setAttribute("status", "on");
      httpRequestObserver.register();
      //this.notificationBox("Add-On Enabled");
    }
  },
  
  notificationBox: function(message) //Notification Alert 
  {
    let alertsService =
    Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
    let title = ("ScriptFilter");
    alertsService.showAlertNotification(
    "chrome://scriptFilter/skin/grey.png",
    title, message, true, "", this, "Message");
  }
}

let observerService = Components.classes["@mozilla.org/observer-service;1"].
getService(Components.interfaces.nsIObserverService);

httpRequestObserver.register(); //Adds Observer by default
