(function($){

	// construct the real file path
	function constructFilePath (filePattern, element, elementIndex) {
	
		// start with empty string
		var filePath = "";
		
		var remaining = filePattern;
		while (remaining != "") {
			// find index of first % character
			var index = remaining.indexOf('%');
			
			// if not found
			if (index == -1) {
				filePath += remaining; // copy all of remaining into filePath
				remaining = "";
			}
			// if we find a % character
			else {
				// copy the characters proceding the % character to filePath
				filePath += remaining.substring(0, index);
				
				// find the next % character
				index2 = index + 1 + remaining.substring(index+1).indexOf('%');
				
				// if a second % isnt found, use the rest of the string
				if (index2 == -1)
					index2 = remaining.length;
					
				// construct the attribute name to look for on the element
				var attrName = remaining.substring(index+1, index2);
				
				// look for the attribute and insert in filePath if found
				var attrValue = element.attr(attrName);
				if (!(typeof attrValue === "undefined")) 
					filePath += attrValue;
				
				remaining = remaining.substring(index2+1);
			}
		}
		
		// find the index at which to insert the (element) index
		var indexIndex = filePath.indexOf('#');
		if (indexIndex != -1)
			filePath = filePath.substring(0, indexIndex) + elementIndex + filePath.substring(indexIndex+1);
			
		return filePath;
	}		


	var methods = {
		bind : function(eventType, filePattern, target, bindTo) {
			
			if (!(target instanceof jQuery) && !(typeof target === "function")) {
				$.error ("jQuery.patternLoad('bind', ... ) target argument must be a jQuery object or a function");
				return;
			}
			
			if (typeof bindTo === 'undefined')
				bindTo = this;
			else
				if (!(bindTo instanceof jQuery && bindTo.length == this.length))
				{
					$.error('jQuery.patternLoad bindTo argument must be a jQuery object with the same length as the jQuery object that patternLoad was called on');
					return;
				}

			this.each (function(elementIndex) {
				
				var thisLoadTrigger = $(this);
				
				$(bindTo[elementIndex]).bind(eventType, function () {

					var filePath = constructFilePath (filePattern, thisLoadTrigger, elementIndex);

					$.get(filePath, function(data) {
						if (typeof target === "function") {
							target(data, thisLoadTrigger);
						} else if (target instanceof jQuery) {
							// TODO: parse out title and such and just insert body html
							target.html(data, thisLoadTrigger);

							// trigger an event on load. pass in the object that triggered the load
							target.trigger('load.patternLoad', thisLoadTrigger);
						}
					});

				});
				
			});
			
			return this;
		},
		load : function( filePattern, target ) { 
		
			if (typeof target === 'undefined')
				target = this;
			else
				if (!(target instanceof jQuery && target.length == this.length) && !(typeof target === "function")) {
					$.error("jQuery.patternLoad('load', ... ) target argument must be a jQuery object with the same length as the jQuery object that patternLoad was called on");
					return;
				}
		
			return this.each(function(elementIndex) {

				var thisLoadTrigger = $(this);
			
				var filePath = constructFilePath (filePattern, thisLoadTrigger, elementIndex);

				$.get(filePath, function(data) {
					if (typeof target === "function") {
						target(data, thisLoadTrigger);
					} else {
						// TODO: parse out title and such and just insert body html
						$(target[elementIndex]).html(data);

						// trigger an event on load. pass in the object that triggered the load
						$(target[elementIndex]).trigger('load.patternLoad', thisLoadTrigger);
					}
				});
					
			});
		}
	};
	
	$.fn.patternLoad = function( method ) {  
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.patternLoad' );
		}  
	}
	
})(jQuery);