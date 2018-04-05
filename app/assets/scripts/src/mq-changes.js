(function(window, document, $){
	"use strict";

	var Breakpoints = {
		extra_small : '20em',
		small : '40em',
		medium : '50em',
		large : '64em',
		extra_large : '80em',
		huge : '90em'
	};

	var unique = function( arr ) {
        var unique = [], i;

        for (i = 0; i < arr.length; i++) {
            var current = arr[i];
            if (unique.indexOf(current) < 0) { unique.push(current); }
        }
        return unique;
    };


	var MQChange = function(){
		if( typeof window.matchMedia === 'undefined' ){
			console.log('Error: Window.matchMedia or polyfill is required');
			return;
		}

		this.setMedias();
	};

	MQChange.prototype = {
		registerMedia : function( query, actions ){
			var registered_mq = window.matchMedia(query);
			var mq_actions = function( mql ){
					// react to media query match
					if( mql.matches && typeof(actions.match) === 'function' ){
						actions.match();
					}

					// react to media query unmatch
					else if( !mql.matches && typeof(actions.unmatch) === 'function' ){
						actions.unmatch();
					}
				};

			if( typeof actions === 'object' ){
				registered_mq.addListener( mq_actions );
				mq_actions( registered_mq );
			}
		},

		setMedias : function(){
			var app = this;
			var $changeables = $('[data-mq-change]');

			for( var mqName in Breakpoints ) {
				// closure para manejar la variable
				(function( mq_slug ){
					app.registerMedia('screen and (max-width: '+ Breakpoints[mq_slug] +')', {
						match: function(){
							app.moveElements( $changeables.filter('[data-mq-change="'+ mq_slug +'"]'), 'match' );
						},
						unmatch: function(){
							app.moveElements( $changeables.filter('[data-mq-change="'+ mq_slug +'"]'), 'unmatch' );
						}
					});
				}( mqName ));
			}
		},

		moveElements : function( $set, type ){
            var areaType = 'data-' + type +'-area',
                groups = $set.groupByAtt( areaType );

            groups.forEach(function( $group ){
                var $target = $('[data-area-name="'+ $group.first().attr( areaType ) +'"]');

                $group.sort(function(a, b){
                    return $(a).data('order') - $(b).data('order');
                });

                $group.appendTo( $target );
            });
        }
	};


	$.fn.groupByAtt = function( attname ){
        var $set = this,
            groups = [],
            posibles = [];

        // se guardan todos los posibles valores
        $set.each(function(i,el){
            posibles.push( el.getAttribute(attname) );
        });

        // se quitan los elementos duplicados dejando solo los unicos
        posibles = unique( posibles );

        // se itera sobre las posibilidades y se agrupan los elementos
        posibles.forEach(function( value ){
            groups.push($set.filter('['+ attname +'="'+ value +'"]'));
        });

        return groups;
    };

	// self initialization
	$(document).ready(function(){
		var changeable = new MQChange();
	});

}(window, document, jQuery));