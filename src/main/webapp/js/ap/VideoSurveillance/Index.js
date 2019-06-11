mini.parse();

//点击左侧树形菜单,查询表格数据
mini.get("tree1").on("nodeclick", function (e) {
  //  DoStopPlay();
    var tree = mini.get("tree1");
    var data = tree.getSelectedNode();
    DoStartPlay(data.ResCode);
});

//工具函数---start
function CreateEmptyString(l) {
    var a = [];
    for (var i = 0; i < l; i++) {
        a[i] = '*';
    }
    return a.join('');
}


//向列表中添加表项
function AddList(sel, text, value){
    var option = document.createElement("option");
    option.appendChild(document.createTextNode(text));
    option.setAttribute("value",value); 
    sel.appendChild(option);
    return;
}


//去除时间格式内的HTTP关键字
function FormatTime(time){
    var tmp_string = time.split(' ');
    var tmp_string_cp = tmp_string[1].split(':');
    return tmp_string[0]+'%20'+tmp_string_cp[0]+'%3A'+tmp_string_cp[1]+'%3A'+ tmp_string_cp[2];
}



var IS_SHOW_DEBUG = 0;  //0-关闭, 1-开启
var gdownloadID = 1;   //下载编码
var gdownloadID2 = 1;

function DebugAlert(str){
    if(IS_SHOW_DEBUG == 1){
        alert(str);
    }
}

String.prototype.replaceAll = function(f, r) {
    var s = new String(this);
    while (s.indexOf(f) != -1) {
        s = s.replace(f, r);
    }
    return s.toString();
}

/**
 * 解析从控件返回的xml字符串
 */
function loadXML(xmlString){
     if(!g_xmlActive){
         return;
     }
     g_xmlActive.loadXML(xmlString);
     if(0 == g_xmlActive.parseError.errorCode){
         return g_xmlActive;
     }
     else{
         alert("xml解析错误:" + g_xmlActive.parseError.reason);
         return null;
     } 
} 

function getElementById(dom, tagName){
    for(var i = 0; i < dom.childNodes.length; i++){
        var node = dom.childNodes[i];
        if(node.baseName == tagName){
            return node.nodeTypedValue;
        }
        else{
            if(node.childNodes.length != 0){
                getElementById(dom.childNodes[i], tagName);
            }
        }
    }
}

//工具函数---end



//全局变量---start

var g_UserLoginId = '';
var g_imosActivePlayer = null;
var g_curFrameNum = '';
var g_xmlActive = null;
var g_isLogin = 1;



//全局变量---end
//================>功能函数---start
//检查控件
function InitPage(){
 
    g_imosActivePlayer = document.all.h3c_IMOS_ActiveX;
    g_PlayFrame = document.all.Play_Frame;
     if(!g_imosActivePlayer) {
         alert("未安装控件，请先安装后再使用本页面");
     }
     
     var xmldoc;
     try{
         xmldoc = new ActiveXObject("Microsoft.XMLDOM");
         if(!xmldoc){
            xmldoc = new ActiveXObject("MSXML2.DOMDocument.3.0");  
         }
     } 
     catch(e){        
     }
     g_xmlActive = xmldoc;
     if(!g_xmlActive){
         alert("xml解析器获取错误，将导致某些功能不可用");
     }
     else{
         g_xmlActive.async = "false";  
     }

       //定时执行，5秒后执行
       var t1=window.setTimeout(refreshCount, 1000 * 5);
       function refreshCount() {
    //
     DoLogin();
  
   
      //去掉定时器的方法  
 window.clearTimeout(t1);   
 }
 }
 
 //登录    
 function DoLogin(){
     if(!g_imosActivePlayer) {
         alert("未安装控件，请先安装后再使用本页面");
         return;
     }
     var serverIP = '10.102.204.103';
     var userName = 'duijieceshi.tjsh';
     var passWd = 'fdc4a7ab66d91ebf14c2fa9c436184ba';
     if(passWd == ""){
         passWd = "";
     } 
     g_isLogin = g_imosActivePlayer.IMOSAX_InitOCX(serverIP, "8800", userName, passWd, 1);
     if(0!=g_isLogin)
     {
         alert("IMOSAX_InitOCX Error:"+g_isLogin); 
         return;
     }
     
     //获取用户信息
     var retStr = g_imosActivePlayer.IMOSAX_GetUserLoginInfo();
     var userObj = loadXML(retStr);
     g_UserLoginId = userObj.documentElement.selectNodes("//LOGININFO/UserLoginIDInfo/UserLoginCode")[0].text;
     
     g_imosActivePlayer.IMOSAX_ChangeLayout(1);    //分屏
     g_imosActivePlayer.IMOSAX_ShowToolBar(1, 1);  //显示工具栏
     DoGetAllCamList();
 }
 
 
 //退出登录
 function DoLogout(){
     if(!g_imosActivePlayer){
       alert("未安装控件，请先安装后再使用本页面");
       return;
     }
     
     var flag = g_imosActivePlayer.IMOSAX_UnregOCX();
     if(0 != flag){
       alert("IMOSAX_UnregOCX Error:"+flag); 
       return;
     }	
     
     
 }

//启动实况
function DoStartPlay(cameraId){
    if(!g_imosActivePlayer) {
        alert("未安装控件，请先安装后再使用本页面");
        return;
    }
   // var cameraId ='12010409001310000012';
    // var frameNum = g_curFrameNum;
    // frameNum = parseInt(frameNum, 10);    
    // if(isNaN(frameNum) || frameNum < 1 || frameNum > 25){
    //     alert("请先选择一个窗格");
    //     return;
    // }


     var flag =   g_imosActivePlayer.IMOSAX_StartFrameLive (1, cameraId);
     var a  = flag;
    
    // g_imosActivePlayer.IMOSAX_StartFrameLive (1, '12010409001310000012');
    // g_imosActivePlayer.IMOSAX_StartFrameLive (2, '12010409001310000012');
    // g_imosActivePlayer.IMOSAX_StartFrameLive (3, '12010409001310000012');
    // g_imosActivePlayer.IMOSAX_StartFrameLive (4, '12010409001310000012');
   // var flag = g_imosActivePlayer.IMOSAX_StartFrameLive (1, cameraId);
    // if(0 == flag){
    //  //   alert("实况播放成功");
    // }
    // else{
    //     alert("播放实况失败，错误码：" + flag);
    // }
}
//释放实况
function DoStopPlay(){
    if(!g_imosActivePlayer) {
        alert("未安装控件，请先安装后再使用本页面");
        return;
    }
    // var frameNum = g_curFrameNum;
    // if(isNaN(frameNum) || frameNum < 1 || frameNum > 25){
    //     alert("请选择一个窗格");
    //     return;
    // }
    var flag = g_imosActivePlayer.IMOSAX_StopFramelive(1);
   
    if(0 == flag){
     //   alert("停止实况成功");
    }
    else{
        alert("停止实况失败，错误码：" + flag);
    }
}
 
function DoGetAllCamList() {
   
  
    var strXmlQueryCondition = "";
    strXmlQueryCondition = '<?xml version="1.0" ?>' +
        '<data>' +
        '<ItemNum>3</ItemNum>' + //总共有三个查询条件(不限制摄像头子类型即查询所有类型的摄像头包括固定摄像头等)
        '<QueryConditionList count="3">' + //这边的查询条件数量要和ItemNum一样
        '<item>' + // 查询子域
        '<QueryType>257</QueryType> ' +
        '<LogicFlag>0</LogicFlag> ' +
        '<QueryData>1</QueryData> ' +
        '</item>' +
        '<item>' + //查询的资源类型是摄像头
        '<QueryType>256</QueryType>' +
        '<LogicFlag>0</LogicFlag>' +
        '<QueryData>1001</QueryData>' +
        '</item>' +
        '<item>' + // 查询结果按照名称的升序排序
        '<QueryType>1</QueryType> ' +
        '<LogicFlag>6</LogicFlag>' +
        '<QueryData /> ' +
        '</item>' +
        '</QueryConditionList>' +
        '</data>';

    var strXmlQueryPageInfo = '<?xml version="1.0" ?> ' +
        '<data>' +
        '<PageRowNum>100</PageRowNum>' + //最多返回100个记录()
        '<PageFirstRowNumber>0</PageFirstRowNumber>' + //从第0个记录开始返回
        '<QueryCount>1</QueryCount>' + //还需要返回总记录数
        '</data>';
    
    var retStr = "";
    retStr = g_imosActivePlayer.IMOSAX_QueryOrgResListEx('iccsid', strXmlQueryCondition, strXmlQueryPageInfo);
    var xotree = new XML.ObjTree();
  
    var tree = xotree.parseXML(retStr);
    var list = tree.result.ResList.item;
    var newList =[];
    var types = JSLINQ(list).Distinct(function (s) {
            return s.OrgName;
        }).items;
   
    for (var index = 0; index < types.length; index++) {
      var element = types[index];
      var obj =new Object();
        obj.name = element;
            obj.id =element;
            obj.Pid = '';
            newList.push(obj);
        var childs =  JSLINQ(list).Where(function (s) {
          return s.OrgName == element;
        }).items;
     
        var obj2 = new Object();
        for (var item in childs) {
          if(typeof childs[item] !="function"){
                obj2 = childs[item].ResItemV1;
                obj2.name =obj2.ResName;
                obj2.id =element+Math.random();
                obj2.Pid =element;
                newList.push(obj2);
            }
         
          
          }
    }

console.log(JSON.stringify(newList));
        
     mini.get("tree1").loadList(newList);
}
function DoGetAlarmList(){
var strXmlQueryCondition = "";
 
var strXmlQueryPageInfo = '<?xml version="1.0" ?> '+
'<data>'+
  '<PageRowNum>10</PageRowNum>'+                     //最多返回100个记录
  '<PageFirstRowNumber>0</PageFirstRowNumber>'+       //从第0个记录开始返回
  '<QueryCount>1</QueryCount>'+                       //还需要返回总记录数
'</data>';

    var retStr = "";
    retStr = g_imosActivePlayer.IMOSAX_QueryAlarmList(strXmlQueryCondition, strXmlQueryPageInfo);
    alert(retStr);
}




//  ===============================================================
var formatXml = function (xml) {
		        var reg = /(>)(<)(\/*)/g;
		        var wsexp = / *(.*) +\n/g;
		        var contexp = /(<.+>)(.+\n)/g;
		        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
		        var pad = 0;
		        var formatted = '';
		        var lines = xml.split('\n');
		        var indent = 0;
		        var lastType = 'other';
		        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
		        var transitions = {
		            'single->single': 0,
		            'single->closing': -1,
		            'single->opening': 0,
		            'single->other': 0,
		            'closing->single': 0,
		            'closing->closing': -1,
		            'closing->opening': 0,
		            'closing->other': 0,
		            'opening->single': 1,
		            'opening->closing': 0,
		            'opening->opening': 1,
		            'opening->other': 1,
		            'other->single': 0,
		            'other->closing': -1,
		            'other->opening': 0,
		            'other->other': 0
		        };

		        for (var i = 0; i < lines.length; i++) {
		            var ln = lines[i];
		            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
		            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
		            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
		            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
		            var fromTo = lastType + '->' + type;
		            lastType = type;
		            var padding = '';

		            indent += transitions[fromTo];
		            for (var j = 0; j < indent; j++) {
		                padding += '\t';
		            }
		            if (fromTo == 'opening->closing')
		                formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
		            else
		                formatted += padding + ln + '\n';
		        }

		        return formatted;
		    };
            
            

            // ========================================================================
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
// ========================================================================

if ( typeof(XML) == 'undefined' ) XML = function() {};

//  constructor

XML.ObjTree = function () {
    return this;
};

//  class variables

XML.ObjTree.VERSION = "0.23";

//  object prototype

XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '-';

//  method: parseXML( xmlsource )

XML.ObjTree.prototype.parseXML = function ( xml ) {
    var root;
    if ( window.DOMParser ) {
        var xmldom = new DOMParser();
//      xmldom.async = false;           // DOMParser is always sync-mode
        var dom = xmldom.parseFromString( xml, "application/xml" );
        if ( ! dom ) return;
        root = dom.documentElement;
    } else if ( window.ActiveXObject ) {
        xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.async = false;
        xmldom.loadXML( xml );
        root = xmldom.documentElement;
    }
    if ( ! root ) return;
    return this.parseDOM( root );
};

//  method: parseHTTP( url, options, callback )

XML.ObjTree.prototype.parseHTTP = function ( url, options, callback ) {
    var myopt = {};
    for( var key in options ) {
        myopt[key] = options[key];                  // copy object
    }
    if ( ! myopt.method ) {
        if ( typeof(myopt.postBody) == "undefined" &&
             typeof(myopt.postbody) == "undefined" &&
             typeof(myopt.parameters) == "undefined" ) {
            myopt.method = "get";
        } else {
            myopt.method = "post";
        }
    }
    if ( callback ) {
        myopt.asynchronous = true;                  // async-mode
        var __this = this;
        var __func = callback;
        var __save = myopt.onComplete;
        myopt.onComplete = function ( trans ) {
            var tree;
            if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
                tree = __this.parseDOM( trans.responseXML.documentElement );
            }
            __func( tree, trans );
            if ( __save ) __save( trans );
        };
    } else {
        myopt.asynchronous = false;                 // sync-mode
    }
    var trans;
    if ( typeof(HTTP) != "undefined" && HTTP.Request ) {
        myopt.uri = url;
        var req = new HTTP.Request( myopt );        // JSAN
        if ( req ) trans = req.transport;
    } else if ( typeof(Ajax) != "undefined" && Ajax.Request ) {
        var req = new Ajax.Request( url, myopt );   // ptorotype.js
        if ( req ) trans = req.transport;
    }
    if ( callback ) return trans;
    if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
        return this.parseDOM( trans.responseXML.documentElement );
    }
}

//  method: parseDOM( documentroot )

XML.ObjTree.prototype.parseDOM = function ( root ) {
    if ( ! root ) return;

    this.__force_array = {};
    if ( this.force_array ) {
        for( var i=0; i<this.force_array.length; i++ ) {
            this.__force_array[this.force_array[i]] = 1;
        }
    }

    var json = this.parseElement( root );   // parse root node
    if ( this.__force_array[root.nodeName] ) {
        json = [ json ];
    }
    if ( root.nodeType != 11 ) {            // DOCUMENT_FRAGMENT_NODE
        var tmp = {};
        tmp[root.nodeName] = json;          // root nodeName
        json = tmp;
    }
    return json;
};

//  method: parseElement( element )

XML.ObjTree.prototype.parseElement = function ( elem ) {
    //  COMMENT_NODE
    if ( elem.nodeType == 7 ) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE
    if ( elem.nodeType == 3 || elem.nodeType == 4 ) {
        var bool = elem.nodeValue.match( /[^\x00-\x20]/ );
        if ( bool == null ) return;     // ignore white spaces
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes
    if ( elem.attributes && elem.attributes.length ) {
        retval = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var key = elem.attributes[i].nodeName;
            if ( typeof(key) != "string" ) continue;
            var val = elem.attributes[i].nodeValue;
            if ( ! val ) continue;
            key = this.attr_prefix + key;
            if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
            cnt[key] ++;
            this.addNode( retval, key, cnt[key], val );
        }
    }

    //  parse child nodes (recursive)
    if ( elem.childNodes && elem.childNodes.length ) {
        var textonly = true;
        if ( retval ) textonly = false;        // some attributes exists
        for ( var i=0; i<elem.childNodes.length && textonly; i++ ) {
            var ntype = elem.childNodes[i].nodeType;
            if ( ntype == 3 || ntype == 4 ) continue;
            textonly = false;
        }
        if ( textonly ) {
            if ( ! retval ) retval = "";
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if ( ! retval ) retval = {};
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                var key = elem.childNodes[i].nodeName;
                if ( typeof(key) != "string" ) continue;
                var val = this.parseElement( elem.childNodes[i] );
                if ( ! val ) continue;
                if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
                cnt[key] ++;
                this.addNode( retval, key, cnt[key], val );
            }
        }
    }
    return retval;
};

//  method: addNode( hash, key, count, value )

XML.ObjTree.prototype.addNode = function ( hash, key, cnts, val ) {
    if ( this.__force_array[key] ) {
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else if ( cnts == 1 ) {                   // 1st sibling
        hash[key] = val;
    } else if ( cnts == 2 ) {                   // 2nd sibling
        hash[key] = [ hash[key], val ];
    } else {                                    // 3rd sibling and more
        hash[key][hash[key].length] = val;
    }
};

//  method: writeXML( tree )

XML.ObjTree.prototype.writeXML = function ( tree ) {
    var xml = this.hash_to_xml( null, tree );
    return this.xmlDecl + xml;
};

//  method: hash_to_xml( tagName, tree )

XML.ObjTree.prototype.hash_to_xml = function ( name, tree ) {
    var elem = [];
    var attr = [];
    for( var key in tree ) {
        if ( ! tree.hasOwnProperty(key) ) continue;
        var val = tree[key];
        if ( key.charAt(0) != this.attr_prefix ) {
            if ( typeof(val) == "undefined" || val == null ) {
                elem[elem.length] = "<"+key+" />";
            } else if ( typeof(val) == "object" && val.constructor == Array ) {
                elem[elem.length] = this.array_to_xml( key, val );
            } else if ( typeof(val) == "object" ) {
                elem[elem.length] = this.hash_to_xml( key, val );
            } else {
                elem[elem.length] = this.scalar_to_xml( key, val );
            }
        } else {
            attr[attr.length] = " "+(key.substring(1))+'="'+(this.xml_escape( val ))+'"';
        }
    }
    var jattr = attr.join("");
    var jelem = elem.join("");
    if ( typeof(name) == "undefined" || name == null ) {
        // no tag
    } else if ( elem.length > 0 ) {
        if ( jelem.match( /\n/ )) {
            jelem = "<"+name+jattr+">\n"+jelem+"</"+name+">\n";
        } else {
            jelem = "<"+name+jattr+">"  +jelem+"</"+name+">\n";
        }
    } else {
        jelem = "<"+name+jattr+" />\n";
    }
    return jelem;
};

//  method: array_to_xml( tagName, array )

XML.ObjTree.prototype.array_to_xml = function ( name, array ) {
    var out = [];
    for( var i=0; i<array.length; i++ ) {
        var val = array[i];
        if ( typeof(val) == "undefined" || val == null ) {
            out[out.length] = "<"+name+" />";
        } else if ( typeof(val) == "object" && val.constructor == Array ) {
            out[out.length] = this.array_to_xml( name, val );
        } else if ( typeof(val) == "object" ) {
            out[out.length] = this.hash_to_xml( name, val );
        } else {
            out[out.length] = this.scalar_to_xml( name, val );
        }
    }
    return out.join("");
};

//  method: scalar_to_xml( tagName, text )

XML.ObjTree.prototype.scalar_to_xml = function ( name, text ) {
    if ( name == "#text" ) {
        return this.xml_escape(text);
    } else {
        return "<"+name+">"+this.xml_escape(text)+"</"+name+">\n";
    }
};

//  method: xml_escape( text )

XML.ObjTree.prototype.xml_escape = function ( text ) {
    return (text + '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

/*
// ========================================================================

=head1 NAME

XML.ObjTree -- XML source code from/to JavaScript object like E4X

=head1 SYNOPSIS

    var xotree = new XML.ObjTree();
    var tree1 = {
        root: {
            node: "Hello, World!"
        }
    };
    var xml1 = xotree.writeXML( tree1 );        // object tree to XML source
    alert( "xml1: "+xml1 );

    var xml2 = '<?xml version="1.0"?><response><error>0</error></response>';
    var tree2 = xotree.parseXML( xml2 );        // XML source to object tree
    alert( "error: "+tree2.response.error );

=head1 DESCRIPTION

XML.ObjTree class is a parser/generater between XML source code
and JavaScript object like E4X, ECMAScript for XML.
This is a JavaScript version of the XML::TreePP module for Perl.
This also works as a wrapper for XMLHTTPRequest and successor to JKL.ParseXML class
when this is used with prototype.js or JSAN's HTTP.Request class.

=head2 JavaScript object tree format

A sample XML source:

    <?xml version="1.0" encoding="UTF-8"?>
    <family name="Kawasaki">
        <father>Yasuhisa</father>
        <mother>Chizuko</mother>
        <children>
            <girl>Shiori</girl>
            <boy>Yusuke</boy>
            <boy>Kairi</boy>
        </children>
    </family>

Its JavaScript object tree like JSON/E4X:

    {
        'family': {
            '-name':    'Kawasaki',
            'father':   'Yasuhisa',
            'mother':   'Chizuko',
            'children': {
                'girl': 'Shiori'
                'boy': [
                    'Yusuke',
                    'Kairi'
                ]
            }
        }
    };

Each elements are parsed into objects:

    tree.family.father;             # the father's given name.

Prefix '-' is inserted before every attributes' name.

    tree.family["-name"];           # this family's family name

A array is used because this family has two boys.

    tree.family.children.boy[0];    # first boy's name
    tree.family.children.boy[1];    # second boy's name
    tree.family.children.girl;      # (girl has no other sisiters)

=head1 METHODS

=head2 xotree = new XML.ObjTree()

This constructor method returns a new XML.ObjTree object.

=head2 xotree.force_array = [ "rdf:li", "item", "-xmlns" ];

This property allows you to specify a list of element names
which should always be forced into an array representation.
The default value is null, it means that context of the elements
will determine to make array or to keep it scalar.

=head2 xotree.attr_prefix = '@';

This property allows you to specify a prefix character which is
inserted before each attribute names.
Instead of default prefix '-', E4X-style prefix '@' is also available.
The default character is '-'.
Or set '@' to access attribute values like E4X, ECMAScript for XML.
The length of attr_prefix must be just one character and not be empty.

=head2 tree = xotree.parseXML( xmlsrc );

This method loads an XML document using the supplied string
and returns its JavaScript object converted.

=head2 tree = xotree.parseDOM( domnode );

This method parses a DOM tree (ex. responseXML.documentElement)
and returns its JavaScript object converted.

=head2 tree = xotree.parseHTTP( url, options );

This method loads a XML file from remote web server
and returns its JavaScript object converted.
XMLHTTPRequest's synchronous mode is always used.
This mode blocks the process until the response is completed.

First argument is a XML file's URL
which must exist in the same domain as parent HTML file's.
Cross-domain loading is not available for security reasons.

Second argument is options' object which can contains some parameters:
method, postBody, parameters, onLoading, etc.

This method requires JSAN's L<HTTP.Request> class or prototype.js's Ajax.Request class.

=head2 xotree.parseHTTP( url, options, callback );

If a callback function is set as third argument,
XMLHTTPRequest's asynchronous mode is used.

This mode calls a callback function with XML file's JavaScript object converted
after the response is completed.

=head2 xmlsrc = xotree.writeXML( tree );

This method parses a JavaScript object tree
and returns its XML source generated.

=head1 EXAMPLES

=head2 Text node and attributes

If a element has both of a text node and attributes
or both of a text node and other child nodes,
text node's value is moved to a special node named "#text".

    var xotree = new XML.ObjTree();
    var xmlsrc = '<span class="author">Kawasaki Yusuke</span>';
    var tree = xotree.parseXML( xmlsrc );
    var class = tree.span["-class"];        # attribute
    var name  = tree.span["#text"];         # text node

=head2 parseHTTP() method with HTTP-GET and sync-mode

HTTP/Request.js or prototype.js must be loaded before calling this method.

    var xotree = new XML.ObjTree();
    var url = "http://example.com/index.html";
    var tree = xotree.parseHTTP( url );
    xotree.attr_prefix = '@';                   // E4X-style
    alert( tree.html["@lang"] );

This code shows C<lang=""> attribute from a X-HTML source code.

=head2 parseHTTP() method with HTTP-POST and async-mode

Third argument is a callback function which is called on onComplete.

    var xotree = new XML.ObjTree();
    var url = "http://example.com/mt-tb.cgi";
    var opts = {
        postBody:   "title=...&excerpt=...&url=...&blog_name=..."
    };
    var func = function ( tree ) {
        alert( tree.response.error );
    };
    xotree.parseHTTP( url, opts, func );

This code send a trackback ping and shows its response code.

=head2 Simple RSS reader

This is a RSS reader which loads RDF file and displays all items.

    var xotree = new XML.ObjTree();
    xotree.force_array = [ "rdf:li", "item" ];
    var url = "http://example.com/news-rdf.xml";
    var func = function( tree ) {
        var elem = document.getElementById("rss_here");
        for( var i=0; i<tree["rdf:RDF"].item.length; i++ ) {
            var divtag = document.createElement( "div" );
            var atag = document.createElement( "a" );
            atag.href = tree["rdf:RDF"].item[i].link;
            var title = tree["rdf:RDF"].item[i].title;
            var tnode = document.createTextNode( title );
            atag.appendChild( tnode );
            divtag.appendChild( atag );
            elem.appendChild( divtag );
        }
    };
    xotree.parseHTTP( url, {}, func );

=head2  XML-RPC using writeXML, prototype.js and parseDOM

If you wish to use prototype.js's Ajax.Request class by yourself:

    var xotree = new XML.ObjTree();
    var reqtree = {
        methodCall: {
            methodName: "weblogUpdates.ping",
            params: {
                param: [
                    { value: "Kawa.net xp top page" },  // 1st param
                    { value: "http://www.kawa.net/" }   // 2nd param
                ]
            }
        }
    };
    var reqxml = xotree.writeXML( reqtree );       // JS-Object to XML code
    var url = "http://example.com/xmlrpc";
    var func = function( req ) {
        var resdom = req.responseXML.documentElement;
        xotree.force_array = [ "member" ];
        var restree = xotree.parseDOM( resdom );   // XML-DOM to JS-Object
        alert( restree.methodResponse.params.param.value.struct.member[0].value.string );
    };
    var opt = {
        method:         "post",
        postBody:       reqxml,
        asynchronous:   true,
        onComplete:     func
    };
    new Ajax.Request( url, opt );

=head1 AUTHOR

Yusuke Kawasaki http://www.kawa.net/

=head1 COPYRIGHT AND LICENSE

Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the Artistic license. Or whatever license I choose,
which I will do instead of keeping this documentation like it is.

=cut
// ========================================================================
*/
