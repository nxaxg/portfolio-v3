(function(window, document, $){
	"use strict";

	var Message = function( element ){
		this.$element = $(element);
		this.$element.find('[data-role="close"]').on('click', this.close.bind(this));

		return this;
	};
	Message.prototype = {
		close: function( event ){
			event.preventDefault();
			this.$element.slideUp({
				duration: 250,
				progress: function( promise, progress, remainingTime ){
					var percent = 1 - progress;
					$(this).css('opacity', percent);
				},
				complete: function(){
					$(this).remove();
				}
			});
		}
	};


	$.fn.message = function(){
		if( this.data('message') ){ return this.data('message'); }
		return this.each(function(i, el){
			$(el).data('message', (new Message(el)));
		});
	};

	// self initialization
	$(document).ready(function(){
		$('[data-module="message"]').message();
	});
}(window, document, jQuery));