YUI().use("overlay", function(Y) {

    /* Create Overlay from script, this time. No footer */
    var overlay = new Y.Overlay({
        srcNode: "#overlay",
        width:"10em",
        height:"10em",
        bodyContent: "Click the 'Align Next' button to try a new alignment",
        align: {
            node: "#Text1", 
            points: ["tl", "bl"]
        },
        //visible:false,
        zIndex:3
    });

    /* Render it to #overlay-align element */
    //overlay.render("#overlay-align");
 });
function getXML(xmlDirectory)
{
 if (window.XMLHttpRequest)
        {
    xhttp=new XMLHttpRequest();
        }
 else // for older IE 5/6
        {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
    
    
 xhttp.open("GET",xmlDirectory,false)
 xhttp.send("");
 txtDoc=xhttp.responseText;
 
 
 
 if (window.DOMParser)
   {
    parser=new DOMParser();
    xmlDoc=parser.parseFromString(txtDoc,"text/xml");
   }
 else // Internet Explorer
   {
    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async="false";
    xmlDoc.loadXML(txtDoc); 
   }
   return xmlDoc;
}
var getPicturePath = function(keyword, count)
{

    var urlAddress;
    if (document.getElementById('picker').value=="flickr")
   		urlAddress ="http://query.yahooapis.com/v1/public/yql?q=select%20%20source%20from%20flickr.photos.sizes%20where%20label%3D%22Small%22%20and%20photo_id%20in%20(select%20id%20from%20flickr.photos.search%20where%20tags%3D%22Cat%22)%20limit%2010&diagnostics=true";
    
    else
		urlAddress="http://query.yahooapis.com/v1/public/yql?q=select%20url%20from%20search.images%20where%20query%3D%22Cat%22%20and%20dimensions%3D%22medium%22&diagnostics=true";
    
    
    urlAddress = urlAddress.replace("Cat",keyword);
    var xmlDoc=getXML(urlAddress);
    
    var aUrl;
    if (document.getElementById('picker').value=="flickr")
   		aUrl=xmlDoc.getElementsByTagName("size")[count].getAttribute("source");
    
    else
		aUrl=xmlDoc.getElementsByTagName("result")[count].getElementsByTagName("url")[0].childNodes[0].textContent;
    return(aUrl);
}
var imgCounter = new Array(0,0,0,0,0,0);
function show(number)
{
        var keywords;
        if(document.getElementById("cell-"+number).title=="")
        {
            keywords = document.getElementById("Text"+number).value
            document.getElementById("cell-"+number).title = keywords;
            
            document.getElementById("cell-"+number).innerHTML = "<img id=\"img"+number+"\" border=\"5\" onClick=\"javascript:show("+number+")\" class=\"pictures\" src=\""+getPicturePath(keywords,imgCounter[number]++)+"\">";
        }
        else
        {
            keywords = document.getElementById("cell-"+number).title;
            document.getElementById("cell-"+number).innerHTML = "<img id=\"img"+number+"\" onClick=\"javascript:show("+number+")\" class=\"pictures\" src=\""+getPicturePath(keywords,imgCounter[number]++)+"\">";
        }
    
}