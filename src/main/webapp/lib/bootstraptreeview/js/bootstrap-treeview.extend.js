;(function ($, window, document, undefined) {
 	
 	//获取子节点
 	$.Tree.prototype.getChildNodeIdArr = function(node) {
	    var ts = [];
	    if (node.nodes) {
	     for (x in node.nodes) {
	         ts.push(node.nodes[x]);
	         if (node.nodes[x].nodes) {
	             var getNodeDieDai = this.getChildNodeIdArr(node.nodes[x]);
	             for (j in getNodeDieDai) {
	                 ts.push(getNodeDieDai[j]);
	             }
	         }
	     }
	    } else {
	     ts.push(node);
	    }
	    return ts;
	};

	//设置父节点选中
    $.Tree.prototype.setParentNodeCheck = function(node) {
        var parentNode = this.getNode(node.parentId);
        if (parentNode != undefined) {
            var checkedCount = 0;
            for (x in parentNode.nodes) {
                if (parentNode.nodes[x].state.selected) {
                    checkedCount ++;
                } else {
                    break;
                }
            }
            if (checkedCount === parentNode.nodes.length) {
                this.selectNode(parentNode.nodeId);
                this.setParentNodeCheck(parentNode);
            }
        }
    };

    //设置父节点取消选中
    $.Tree.prototype.setParentNodeUnCheck = function(node) {
        var parentNode = this.getNode(node.parentId);
        if (parentNode != undefined) {
            var checkedCount = 0;
            for (x in parentNode.nodes) {
                if (parentNode.nodes[x].state.selected == false) {
                    checkedCount ++;
                } else {
                    break;
                }
            }
            if (checkedCount === parentNode.nodes.length) {
                this.unselectNode(parentNode.nodeId);
                this.setParentNodeCheck(parentNode);
            }
        }
    };
    $.Tree.prototype.selectFirstRecord = function() {
    	var enabledNodesArray = this.getEnabled();
    	for(x in enabledNodesArray) {
    		if(enabledNodesArray[x].nodes == undefined) {
    			this.selectNode(enabledNodesArray[x].nodeId);
    			break;
    		}
    	}
    };
    $.Tree.prototype.echo = function() {
        this.selectFirstRecord();
        var selectNodes = this.getSelected();
        selectNodes[0].state.selected = false;
    }


})(jQuery, window, document);