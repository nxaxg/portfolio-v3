//////////////////////
////////////////////// Common Carousel
//////////////////////
(function(window, document, $){
	"use strict";

	// check for NinjaSlider dependency
	if( typeof NinjaSlider === 'undefined' ){
		console.log('Error: NinjaSlider is required');
		return;
	}

	var CommonCarousel = function( element ){
		this.container = element;
		this.$container = $(element);
		this.$slides = this.$container.find('[data-role="carousel-slide"]');
		this.$arrows = this.$container.find('[data-role="carousel-arrow"]');

		this.ninjaSlider = new NinjaSlider(this.container, {
			auto: false,
			effect : 'carousel',
			itemsConf : this.parseOptions()
		});

		this.$arrows.on('click.CommonCarousel', this.arrowCallback.bind(this));
	};
	CommonCarousel.prototype = {
		arrowCallback : function( event ){
			event.preventDefault();
			var $btn = $(event.currentTarget),
				direction = $btn.data('direction');
			this.ninjaSlider[ direction ]();
		},

		parseOptions : function(){
			var itemsConf = {},
				mqitems = [];

			itemsConf.base = this.$container.data('maxitems') && parseFloat(this.$container.data('maxitems')) || 5;

			if( this.$container.data('mqitems') ){
				this.$container.data('mqitems').split('|').forEach(function( textInfo ){
					var data = textInfo.split(',');
					mqitems.push([ data[0], parseFloat(data[1]) ]);
				});

				itemsConf.medias = mqitems;
			}

			return itemsConf;
		}
	};

	$.fn.commonCarousel = function(){
		if( this.data('commonCarousel') ){ return this.data('commonCarousel'); }
		return this.each(function(i, el){
			$(el).data('commonCarousel', (new CommonCarousel(el)));
		});
	};

	// self initialization
	$(document).ready(function(){
		$('[data-module="carousel"]').commonCarousel();
	});

}(window, document, jQuery));