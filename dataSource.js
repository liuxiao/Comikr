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