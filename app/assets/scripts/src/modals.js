(function(window, document, $){
	"use strict";

	var Modal = function( element ){
		this.$element = $(element);
		this.target = this.$element.data('target');
		this.method = this.$element.data('method') || 'GET';
		this.query = this.$element.data('query') || {};

		this.$element.on('click.modal', this.open.bind(this));
		return this;
	};
	Modal.prototype = {
		close: function(){
			var $modal = $(event.currentTarget).parents('.modal');
			$modal.fadeIn({
				duration: 200, //chng
				complete: function(){ $modal.remove(); }
			});
		},
		open: function( event ){
			event.preventDefault();

			var $element = this.$element;

			$element.trigger('modal.preopen', [ this ]);

			var lb_promise = this.showLightbox(),
				ajax_promise = $.ajax({
					url: this.target,
					method: this.method,
					data: this.query
				});

			$.when(lb_promise, ajax_promise).then(function( lb, ajax_res ){
				var $modal = lb,
					response = ajax_res[0];

				$modal.html( response );
				$modal.addClass('loaded');
				$element.trigger('modal.complete', [ $modal, response ]);
			});
		},

		showLightbox: function(){
			var promise = new $.Deferred(),
				$modal = $('<div class="modal"><div class="modal__body" data-role="modal-body"><button data-role="modal-btn" class="modal__button"></button><div data-role="modal-content" class="modal__content"></div></div></div>');
				
			$('[data-role="modal-btn"]').unbind("click");
			$('[data-role="modal-btn"]').unbind("click.modal");
			$modal.find('[data-role="modal-btn"]').unbind("click");
			$modal.find('[data-role="modal-btn"]').unbind("click.modal");
			$modal.find('[data-role="modal-btn"]').on('click.modal', this.close.bind(this));
			$('body').append($modal);

			$modal.addClass('modal--loaded');

			// RESOLVE SEGUN DISPONIBILIDAD
			var ended = false;
			$modal.on('transitionend', function(){
				ended = true;
				promise.resolve( $modal.find('[data-role="modal-content"]') );
			});

			setTimeout(function(){
				if( !ended ){
					ended = true;
					promise.resolve( $modal.find('[data-role="modal-content"]') );
				}
			}, 200);


			return promise;
		}
	};


	$.fn.modal = function(){
		if( this.data('modal') ){ return this.data('modal'); }
		return this.each(function(i, el){
			$(el).data('modal', (new Modal(el)));
		});
	};

	// self initialization
	$(document).ready(function(){
		$('[data-module="modal"]').modal();
	});
}(window, document, jQuery));