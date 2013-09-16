(function ($) {
	var wrapper_class_suffix = "_wrapper",	
		select_button_class = "drop_btn",
		options = {
			throw_error_if_no_matching_label:false,
			drop_btn: false, // if you set this to true, you'll get a nice div. 
			drop_btn_char: '' // if you specify a char here, the div mentioned above willget a span with the supplied char inside. the only reason this gets specified here and not in the css is because it's not using the pseudo-element/content:''; combo
		};

	var methods  =  {

		fancy_factory: function(settings){
			if(this.tagName === 'INPUT' && this.type !== 'radio' && this.type !== 'checkbox'){
				return this; //if the current tag is an input of type != check||radio, just fail here silently and pass the element along for further jquery function chaining
			}

			if(!!settings){
				for (var prop in settings){
					if(options.hasOwnProperty(prop)){options[prop] = settings[prop]} //if the user has specified settings, override the private options object
				}
			}

			var tagname = this.tagName.toLowerCase(), //current tag type name
				$el = $(this), //jquery wrapped current el
				$wrapper=null, //jquery wrapper visible wrapper div-to-be
				wrap_class = tagname !== 'input' ? tagname + wrapper_class_suffix : this.type + wrapper_class_suffix; //build class name to include "select" or either the input elem's type
			
			$el.wrap('<div class="'+wrap_class+' fancy_form"/>'); //wrap the input/select in a fancy wrapper
			$wrapper = $($el.parent()); //set the wrapper ref

			switch(tagname){ //call correct handler
			case 'select':
				methods._handle_selects($el, $wrapper);
				break;
			case 'input':
				methods._handle_checks_and_radios($el, $wrapper);
				break;
			}
		},
		_handle_selects: function($el, $wrapper){
			var visible_markup = '<span>' + $('option:selected', $el).text() + '</span>',
				drop_btn = (function(){ // build the dropdown button markup string with this anonymous, immediate function 
					var d;
					if(!!options.drop_btn){					
						d =  '<div class="' + select_button_class + '">';//if a drop button is desired, use a jQuery selector relative to the element in question to find the selected option
						if(!!options.drop_btn_char ){
							d += ('<span>' + options.drop_btn_char + '</span>'); //build markup for drop down button
						}
						d += '</div>';
					}
					return d;
				}());
				

			$wrapper
				.prepend(visible_markup) //prepend visible, stylable div tag to beginning of wrapper's insides
				.append(drop_btn) //append the dropbutton to the end of wrapper's insides (if it doesn't exist after computations above, this will fail silently)
				.change(function(e){$(' > span', $wrapper).text($('option:selected', $el).text());}); // when the select changes, this event bubbles up to the wrapper and sets its text to the selected option
			$el
				.focusin(function(){$wrapper.toggleClass('dropdown_input_selected');}) //when in focus, add fuax focus class to wrapper
				.focusout(function(){$wrapper.toggleClass('dropdown_input_selected');}) //remove
				.keyup(function(e){$('> span', $wrapper).text($('option:selected', $el).text());}); //firefox doesn't fire the change event on selects until they blur
		},
		_handle_checks_and_radios: function($el, $wrapper){
			var matching_label = $(' + label[for=' + $el.attr('id')+']', $wrapper); //first check for label directly proceeding wrapper (where it should be after the input was wrapped) with matching 'for' attribute
	
			if(matching_label.length === 0 || !matching_label){
				matching_label = $( 'label[for=' + $el.attr('id') + ']' ); //if above doesn't work, search the dom for it.
			}
			if(matching_label.length === 1){
				$wrapper.append(matching_label);
			}else if(options.throw_error_if_no_matching_label){
				throw new Error("could not find matching <label> for: input[type=" + el.attr('type') +']#' + el.attr('id') );
			}
			if(!methods._check_for_selector(':checked')){
				methods._checked_selector_not_supported($el);
			}
		
		},
		_check_for_selector: function (selector){ //this function will run a test to see if the browser's css capabilities include the given selector (only purpose here is to test :checked)
			$('body').append("<input id='selector_support_test' style='position:absolute;left:100%;top:-100%;visibility:hidden;' type='checkbox' checked />");
			var c = $('#selector_support_test'),
				before = c.css('width'), 
				after = 0;
			$('body').append("<style id='selector_style_test'>#selector_support_test"+ selector +"{width:17px}</style>");
			after = c.css('width');
			c.remove(); 
			$('#selector_style_test').remove();
			return before !== after;
		},
		_checked_selector_not_supported: function ($el){
			$el.change(function(e){
				if($el.attr('type') === 'checkbox'){ //toggle the checked class if it's a checkbox
					if($el.prop('checked')){
						$el.addClass('checked');
					}else{
						$el.removeClass('checked');
					}
				}else if($el.attr('type') === 'radio'){ //if it's a radio, remove the class from all radios in the radio group, then add it to the target radio
					var local_group = $('input[type=radio][name='+ $el.attr('name')+']');
					$(local_group).each(function(i, local_input){
						$(local_input).removeClass('checked');
					});
					$el.addClass('checked');
				}
				$('body').addClass('force_redraw').removeClass('force_redraw');
			});
		}
	};

	//I've altered the default cw pattern here slightly to restrict access to one method and accept only a settings object as an argument
	$.fn.fancify_inputs  =  function (settings) {
		if (typeof settings === 'object' || !settings) {
			var args = arguments;
			return $(this).map(function(i, val) { return methods.fancy_factory.apply(this, args); });
		}
	}

}(jQuery));