(function ($) {

	"use strict";

	var wrapper_class_suffix = "_wrapper",	
		select_button_class = "drop_btn",
		options = {
			throw_error_if_no_matching_label:false,
			drop_btn: false,
			drop_btn_char: ''
		};

	var methods  =  {

		fancy_factory: function(settings){
			if(this.tagName === 'INPUT' && this.type !== 'radio' && this.type !== 'checkbox'){
				return this;
			}

			if(!!settings){
				for (var prop in settings){
					if(options.hasOwnProperty(prop)){options[prop] = settings[prop]}
				}
			}

			var tagname = this.tagName.toLowerCase(),
				$el = $(this),
				$wrapper=null,
				wrap_class = tagname !== 'input' ? tagname + wrapper_class_suffix : this.type + wrapper_class_suffix;
			
			$el.wrap('<div class="'+wrap_class+' fancy_form"/>');
			$wrapper = $($el.parent()); 

			switch(tagname){ 
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
				drop_btn = (function(){ 
					var d;
					if(!!options.drop_btn){					
						d =  '<div class="' + select_button_class + '">';
						if(!!options.drop_btn_char ){
							d += ('<span>' + options.drop_btn_char + '</span>'); 
						}
						d += '</div>';
					}
					return d;
				}());
				

			$wrapper
				.prepend(visible_markup) 
				.append(drop_btn) 
				.change(function(e){$(' > span', $wrapper).text($('option:selected', $el).text());}); 
			$el
				.focusin(function(){$wrapper.toggleClass('dropdown_input_selected');}) 
				.focusout(function(){$wrapper.toggleClass('dropdown_input_selected');}) 
				.keyup(function(e){$('> span', $wrapper).text($('option:selected', $el).text());}); 
		},
		_handle_checks_and_radios: function($el, $wrapper){
			var matching_label = $(' + label[for=' + $el.attr('id')+']', $wrapper); 
	
			if(matching_label.length === 0 || !matching_label){
				matching_label = $( 'label[for=' + $el.attr('id') + ']' ); 
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
		_check_for_selector: function (selector){ 
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
				if($el.attr('type') === 'checkbox'){ 
					if($el.prop('checked')){
						$el.addClass('checked');
					}else{
						$el.removeClass('checked');
					}
				}else if($el.attr('type') === 'radio'){ 
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

	
	$.fn.fancify_inputs  =  function (settings) {
		if (typeof settings === 'object' || !settings) {
			var args = arguments;
			return $(this).map(function(i, val) { return methods.fancy_factory.apply(this, args); });
		}
	}

}(jQuery));