(function(window, document, $){
	"use strict";
	var DEBUG = true;
	var $window = $(window),
	$document = $(document),
	$body = $('body'),
	$mainNav, $mainHeader;

	var TABLETS_DOWN = 'screen and (max-width: 1024px)',
        VERTICAL_TABLETS_DOWN = 'screen and (max-width: 850px)',
        VERTICAL_TABLETS_UP = 'screen and (min-width: 850px)',
        SMALLTABLET_DOWN = 'screen and (max-width: 768px)',
        PHABLET_DOWN = 'screen and (max-width: 640px)',
        PHONE_DOWN = 'screen and (max-width: 480px)';

    var throttle = function( fn ){
        return setTimeout(fn, 1);
    };

    var mqMap = function( mq ){
        var MQ = '';

        switch( mq ){
            case 'tablet-down' :
                MQ = TABLETS_DOWN;
                break;
            case 'vertical-tablet-down' :
                MQ = VERTICAL_TABLETS_DOWN;
                break;
            case 'smalltablet-down' :
                MQ = SMALLTABLET_DOWN;
                break;
            case 'phablet-down' :
                MQ = PHABLET_DOWN;
                break;
             case 'phone-down' :
                MQ = PHONE_DOWN;
                break;
        }

        return MQ;
    };

	var normalize = (function() {
		var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
		to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
		mapping = {};

		for(var i = 0, j = from.length; i < j; i++ )
		mapping[ from.charAt( i ) ] = to.charAt( i );

		return function( str ) {
			var ret = [];
			for( var i = 0, j = str.length; i < j; i++ ) {
				var c = str.charAt( i );
				if( mapping.hasOwnProperty( str.charAt( i ) ) )
				ret.push( mapping[ c ] );
				else
				ret.push( c );
			}
			return ret.join( '' );
		};
	})();

	//TODO: watch
	// String.prototype.capitalize = function() {
	// 	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
	// }

	//APP	
	var App = function(){
		this.path = $('body').attr("data-path");
        this.ajaxURL = '/wp-admin/admin-ajax.php';
        this.loadLegacyAssets();

        var app = this;
	};

	App.prototype = {
		//TODO:
		//Starting settings
		onReady : function(){
			this.setGlobals();
            this.autoHandleEvents( $('[data-func]') );
            this.handleMobileTables();
            this.initTextCounter();
            this.initAreaResizer();
            this.conditionalInits();
            this.stickyParent();
			
			this.initCleanSpace();
			this.initValidFile();
		},
		onLoad : function(){
            var app = this;

            $('[data-equalize="children"][data-mq="tablet-down"]').equalizeChildrenHeights(true, TABLETS_DOWN);
            $('[data-equalize="children"][data-mq="vertical-tablet-down"]').equalizeChildrenHeights(true, VERTICAL_TABLETS_DOWN);
            $('[data-equalize="target"][data-mq="vertical-tablet-down"]').equalizeTarget(true, VERTICAL_TABLETS_DOWN);
            $('[data-equalize="target"][data-mq="vertical-tablet-up"]').equalizeTarget(true, VERTICAL_TABLETS_UP);
            $('[data-equalize="target"][data-mq="smalltablet-down"]').equalizeTarget(true, SMALLTABLET_DOWN);
            $('[data-equalize="target"][data-mq="phablet-down"]').equalizeTarget(true, PHABLET_DOWN);
            $('[data-equalize="target"][data-mq="phone-down"]').equalizeTarget(true, PHONE_DOWN);
            
            if( $('[data-role="scroll-navigation"]').length ){
                this.scrollNavigation( $('[data-role="scroll-navigation"]') );
            }
			
            $window.trigger('resize');
        },
		loadLegacyAssets : function(){
            // voy a asumir que cualquier browser que no soporte <canvas> es un oldIE (IE8-)
            if( Modernizr.canvas ){ return false; }
            Modernizr.load({
                load : this.path + 'scripts/support/selectivizr.min.js'
            });
        },
		autoHandleEvents : function( $elements ){
			if( !$elements || !$elements.length ){ return false; }
			var self = this;
			$elements.each(function(i,el){
				var func = el.getAttribute('data-func') || false,
				evts = el.getAttribute('data-events') || 'click.customStuff';
				if( func && typeof( self[func] ) === 'function' ){
					$(el)
					.off(evts)
					.on(evts, $.proxy(self[func], self));
				}
			});
		},
		setEnquire : function(){
            var app = this,
                $mutable = $('[data-mutable]');

            enquire.register( TABLETS_DOWN, [{
                match: function(){
                    app.moveElements($mutable.filter('[data-mutable="tablet-down"]'), 'mobile');
                },
                unmatch: function(){
                    app.moveElements($mutable.filter('[data-mutable="tablet-down"]'), 'desktop');
                }
            }]);

            enquire.register( SMALLTABLET_DOWN, [{
                match: function(){
                    app.moveElements($mutable.filter('[data-mutable="smalltablet-down"]'), 'mobile');
                },
                unmatch: function(){
                    app.moveElements($mutable.filter('[data-mutable="smalltablet-down"]'), 'desktop');
                }
            }]);

            enquire.register( PHONE_DOWN, [{
                match: function(){
                    app.moveElements($mutable.filter('[data-mutable="phone-down"]'), 'mobile');
                },
                unmatch: function(){
                    app.moveElements($mutable.filter('[data-mutable="phone-down"]'), 'desktop');
                }
            }]);

            enquire.register( VERTICAL_TABLETS_DOWN, [{
                match: function(){
                    app.moveElements($mutable.filter('[data-mutable="vertical-tablet-down"]'), 'mobile');
                },
                unmatch: function(){
                    app.moveElements($mutable.filter('[data-mutable="vertical-tablet-down"]'), 'desktop');

                    // en caso de que el menu este desplegado cuando se hace un resize
                    $('[data-func="deployMainNav"]').removeClass('deployed');
                    $('#main-nav').removeClass('deployed').removeAttr('style');
                }
            }]);

            // para qeu todo funcione bien en movil
            // se gatilla el evento resize en window
            $window.trigger('resize');
        },
		conditionalInits : function( $context ){
			if( !$context ){
				$context = $document;
			}
			// delegaciones directas
			if( $context.find('[data-func]').length ){
				this.autoHandleEvents( $context.find('[data-func]') );
			}

			if( $('[data-func="stickyheader"]').length ){
                this.stickyheader( $('[data-func="stickyheader"]') );
			}

			if( $('[data-role="videothumb"]').length ){
                this.videohide( $('[data-role="videothumb"]') );
			}
		
		},

		setGlobals : function(){
			$body = $('body');
			$mainHeader = $('#main-header');
            $mainNav = $('#main-nav');
            if( $mainNav.length ){
                this.navPos = $mainNav.offset().top;
            }
		},
		
        debug : function( message ){
            DEBUG && console.log( message );
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
        },

		//FUNC:

		//<START
		// CIPER especiales
		filtrar_inicial : function(event){
			var $selector = $(event.currentTarget);
			var inicial = $selector.text();
			$selector.siblings().removeClass("current");
			$selector.addClass("current");
			$('[data-search]').val("")
			$('.simple-row--top article').hide();
			$('.simple-row--top article[data-inicial="'+inicial+'"]').show();
		},

		buscar_inicial : function(event){
			event.preventDefault();
			var s = $('[data-search]').val();
			if(s==""){
				$('.simple-row--top article').hide();
				$('.simple-row--top article[data-inicial="A"]').show();
				return;
			}

			s = s.toLowerCase();

			s  = 	s.replace(new RegExp(/\s/g),"");
			s  = 	s.replace(new RegExp(/[àáâãäå]/g),"a");
			s  = 	s.replace(new RegExp(/æ/g),"ae");
			s  = 	s.replace(new RegExp(/ç/g),"c");
			s  = 	s.replace(new RegExp(/[èéêë]/g),"e");
			s  = 	s.replace(new RegExp(/[ìíîï]/g),"i");
			s  = 	s.replace(new RegExp(/ñ/g),"n");
			s  = 	s.replace(new RegExp(/[òóôõö]/g),"o");
			s  = 	s.replace(new RegExp(/œ/g),"oe");
			s  = 	s.replace(new RegExp(/[ùúûü]/g),"u");
			s  = 	s.replace(new RegExp(/[ýÿ]/g),"y");
			s  = 	s.replace(new RegExp(/\W/g),"");

			s = s.toLowerCase().replace(/\b[a-z]/g, function(letter) {
				return letter.toUpperCase();
			});
			$('.simple-row--top article').hide();
			$(".simple-row--top article[data-fullname*='"+s+"']").show();
		},
		//END>

		mapSectionsPositions : function( $items ){
            var map = [];
            $items.each(function( index, el ){
                var $el = $(el),
                    $target = $( $el.attr('href') ),
                    targetOffset = $target.offset();

                targetOffset.bottom = targetOffset.top + $target.height();

                map.push({
                    $item : $el,
                    offset : targetOffset,
                    selector : $el.attr('href')
                });
            });

            return map;
        },

        setFixedHeader : function(){
            if( Modernizr.mq(VERTICAL_TABLETS_DOWN) ){
                var headerHeight = document.querySelector('#main-header').offsetHeight;
                document.body.style.marginTop = headerHeight + 14 + 'px';
            }
            else {
                document.body.style.marginTop = 0;
            }
        },

        blockScroll : function( event ){
            event.stopPropagation();
        },

		//GENERAL

		handleMobileTables : function(){
            $('.regular-content-area table').each(function(i, table){
                $(table).wrap('<div class="regular-content-table-holder"></div>');
            });
		},

		setLightBox : function( classes ){
            /// se crean los elementos
            var $bg = $('<div />').attr({ id : 'lightbox-background', class : 'lightbox-background' }),
                $scrollable = $('<div />').attr({ class : 'lightbox-scrollable-holder' }),
                $holder = $('<div />').attr({ class : 'lighbox-holder' }).append('<div class="lightbox-close-holder"></div>'),
                $content = $('<div />').attr({ class : 'lightbox-content' }),
                $closeBtn = $('<button class="primary-btn small-btn icon-btn--close-lb"></button>');

            // se inicia la promesa
            var promise = new $.Deferred();

            if( classes ){
                $holder.addClass( classes );
            }
            $closeBtn.on('click', this.closeLightBox);

            $holder.appendTo( $scrollable ).find('.lightbox-close-holder').append( $closeBtn );

            $body.append( $bg );

            $bg.animate({ opacity : 1 }).promise().then(function(){
                $body.css('overflow', 'hidden');
                $bg.append( $scrollable );
                $holder.append( $content );
                promise.resolve( $bg, $content );
                $bg.off();
            });

            return promise;
        },

		scrollNavigation : function( $nav ){
            var app = this,
                $navItems = $nav.children(),
                locationsMap = this.mapSectionsPositions( $navItems );

            $window.on('resize.ScrollNav', function(){
                locationsMap = app.mapSectionsPositions( $navItems );
            });

            $window.on('scroll.ScrollNav', function(){
                var scrollPosition = $window.scrollTop();

                locationsMap.forEach(function( item_info ){
                    if( scrollPosition > (item_info.offset.top - 100) ){
                        $navItems.removeClass('current');
                        item_info.$item.addClass('current');
                    }
                });
            });
		},

		scrollToTarget : function( event ){
            event.preventDefault();

            var $item = $(event.currentTarget),
                target = $item.attr('href') || $item.data('target');

            if( !$(target).length ){ return; }

            $('html, body').animate({
                scrollTop : $(target).offset().top
            });
        },

		loadModal : function( event ){
            event.preventDefault();

            var app = this,
                $item = $(event.currentTarget),
                lightbox_promise = this.setLightBox('programa-detail'),
                ajax_promise = $.ajax({
					url: $item.data('target'),
					method: $item.data('method') || 'GET',
					data: $item.data('query') || {}
				});
                
            $.when(lightbox_promise, ajax_promise).then(function( lightbox_info, ajax_response ){
                var $lightbox_bg = lightbox_info[0],
                    $lightbox_content = lightbox_info[1],
                    response = ajax_response[0];

                $lightbox_content.append( response );

                throttle(function(){
                    $lightbox_bg.addClass('loaded');
                });

            }).fail(function(){
                app.debug('fallo algo en el ajax');
                app.closeLightBox();
            });
        },
		
        getShareCount : function( $elements ){
            // se setea el api de google plus primero
            // api key publico
            // if( typeof gapi !== 'undefined' ){
            //     gapi.client.setApiKey('AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ');
            // }

            $elements.each(function(index, element){
                var type = element.getAttribute('data-type'),
                    url = element.getAttribute('data-url'),
                    jsonUrl = '',
                    data = {};

                var params = {
                    nolog: true,
                    id: url,
                    source: "widget",
                    userId: "@viewer",
                    groupId: "@self"
                };

                if( type === 'facebook' ){
                    jsonUrl = 'http://graph.facebook.com/';
                    data.id = url;
                }
                else if( type === 'twitter' ){
                    // Url obsoleta.
                    //jsonUrl = 'http://urls.api.twitter.com/1/urls/count.json';
                    //data.url = url;
                    return;
                }
                else if( type === 'linkedin' ){
                    jsonUrl = 'http://www.linkedin.com/countserv/count/share';
                    data.format = 'jsonp';
                    data.url = url;
                }
                else {
                    // gapi.client.rpcRequest('pos.plusones.get', 'v1', params).execute(function(resp) {
                    //     console.log('count:', resp.result.metadata.globalCounts.count);
                    // });
                }

                $.ajax({
                    method : 'GET',
                    url : jsonUrl,
                    data : data,
                    dataType : 'jsonp'
                }).then(function( response ){
                    var count = '';

                    // se saca el valor de cada red segun lo que responda el API correspondiente
                    if( type === 'facebook' ){ count = response.shares; }
                    else if( type === 'twitter' ){ count = response.count; }
                    else if( type === 'linkedin' ){ count = response.count; }
                    else {
                        // google
                    }


                    // prevencion de error en caso de false o undefined
                    count = count ? count : 0;
                    element.textContent = count;
                });
            });
		},
		
		calendarControl : function( event ){
			event.preventDefault();

			var app = this;

			var $btn = $(event.currentTarget),
			$dataHolder = $btn.parents('[data-role="calendar-data"]'),
			$itemsHolder = $('[data-events-holder]'),
			$monthName = $('[data-role="calendar-month"]'),
			direction = $btn.data('direction'),
			month = $dataHolder.data('month'),
			year = $dataHolder.data('year'),
			filter = $dataHolder.data('filter');

			if( app.isLoading ){
				return;
			}

			app.isLoading = true;

			/// se debe indicar que se esta cargando, asumo estados estandar
			/// eso queire decir, opacity nomas
			$monthName.css('opacity', '0.2');
			$itemsHolder.css('opacity', '0.2');

			$.getJSON('/wp-json/st-rest/actividades', {
				direction : direction,
				month : month,
				year : year,
				filter : filter
			}).then(function( response ){
				$dataHolder.data('month', response.month_num);
				$dataHolder.data('year', response.year);

				$monthName
				.text( response.month_name + ' - ' +  response.year)
				.attr({
					'data-prev' : response.prev,
					'data-next' : response.next
				});

				$itemsHolder.html( response.items );

				$monthName.css('opacity', '1');
				$itemsHolder.css('opacity', '1');

				app.isLoading = false;
			});
		},

		deployTarget : function( event ){
			event.preventDefault();

			var $item = $(event.currentTarget),
			target = $item.data('target'),
			$targetElem;

			if( !target ){
				console.warn('No se especificó un objetivo en el atributo "data-target":', target );
				return;
			}

			$targetElem = $(target);
			if( !$targetElem.length ){
				console.warn('El objetivo no fue encontrado o el atributo "data-target" no es un selector válido :', target );
				return;
			}

			$item.data('animating', true);

			if( $item.data('deployed') ){
				$targetElem
				.slideUp().promise()
				.then(function(){
					$item.data({
						deployed : false,
						animating : false
					}).removeClass('deployed');

					$targetElem.removeClass('deployed');
				});
			}
			else {
				$targetElem
				.slideDown().promise()
				.then(function(){
					$item.data({
						deployed : true,
						animating : false
					}).addClass('deployed');

					$targetElem.addClass('deployed');
				});
			}
		},

		deployMainNav : function( event ){
			event.preventDefault();

			var $btn = $(event.currentTarget),
			$nav = $('[data-role="nav-container"]'),
			$headerBody = $('[data-role="header-body"]');

			if( $btn.data('deployed') ) {
				$btn
				.data('deployed', false)
				.removeClass('deployed');

				$nav.removeClass('deployed');
				$headerBody.removeClass('deployed');
			}
			else {
				$btn
				.data('deployed', true)
				.addClass('deployed');

				$nav.addClass('deployed');
				$headerBody.addClass('deployed');
			}
		},

		deployCollapsable : function( event ) {
			event.preventDefault();

			var $item = $(event.currentTarget),
			$targetElem = $item.parents('.collapsable').find('.collapsable-body');

			$item.data('animating', true);

			if( $item.data('deployed') ){
				$targetElem
				.slideUp().promise()
				.then(function(){
					$item.data({
						deployed : false,
						animating : false
					}).removeClass('deployed');

					$targetElem.removeClass('deployed');
				});
			}
			else {
				$targetElem
				.slideDown().promise()
				.then(function(){
					$item.data({
						deployed : true,
						animating : false
					}).addClass('deployed');

					$targetElem.addClass('deployed');
				});
			}
		},

		toggleTarget : function( event ){
            event.preventDefault();

            $( event.currentTarget.getAttribute('data-target') ).toggleClass('deployed');

            // expansion para cuando quiero enfocar algo despues de mostrarlo
            if( event.currentTarget.getAttribute('data-focus') ){
                $( event.currentTarget.getAttribute('data-focus') ).focus();
            }
        },

        tabControl : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $target = $('[data-tab-name="'+ $button.data('target') +'"]');

            $button.siblings().removeClass('active');
            $target.siblings().removeClass('active');

            throttle(function(){
                $button.addClass('active');
                $target.addClass('active');
            });
        },

        deployParent : function( event ){
            event.preventDefault();
            $(event.currentTarget).parents( event.currentTarget.getAttribute('data-parent') ).toggleClass('deployed');
        },

        showTab : function( event ){
            event.preventDefault();
            var $item = $(event.currentTarget);

            $('[data-tabname="'+ $item.data('target') +'"]').addClass('active').siblings().removeClass('active');
            $item.addClass('active').siblings().removeClass('active');
		},
		
		deployMobileSearch : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $searchBox = $('#mobile-search-holder');

            $button.toggleClass('deployed');
            $searchBox.toggleClass('deployed');
		},

		printPage : function( event ){
            event.preventDefault();
            window.print();
		},

		goToTop : function( event ){
            event.preventDefault();
            $('html, body').animate({scrollTop : 0},800);
		},


		//HELPERS

		stickyheader : function($element){
			var $navBar = $element,
				$top = $navBar.data('offset');
			
			$window.scroll(function () {
				var scroll = actualposition();
				if (scroll >= $top) {
					$navBar.addClass('sticker');
				} else {
					$navBar.removeClass('sticker');
				}
			});
		},

		videohide : function($element){
			var $video = $element,
				$hiddenvideos = $('[data-role="videothumb"]:hidden'),
				$container = $('[data-module="videohide"]'), 
				$showatstart = $container.data('qant'),
				$btnhide = $('[data-role="hidevideos"]'),
				$btnshow = $('[data-role="loadvideos"]'),
				$total = $video.length;

			$video.slice(0, $showatstart).show();
			$('[data-role="hidevideos"]').hide();
			
			$btnshow.click( function(e){
				e.preventDefault();
				$hiddenvideos.show('slow');
				$(this).hide();
				$btnhide.show();
			});

			$btnhide.click( function(e){
				e.preventDefault();
				$video.slice($showatstart, $total).hide('slow');
				$(this).hide();
				$btnshow.show();
			});
		},
		
		//SELF INIT

		//data-role="textcounter"
		//data-role="countdown"
		initTextCounter : function(){
			$('[data-textcounter]').keyup(function(e){
				var $textarea = $(this),
					maxlength = parseInt($textarea.attr('maxlength')),
					valuelength = $textarea.val().length,
					countdown = $textarea.parent().find('[data-role="countdown"]');
	
				e.preventDefault();
				countdown.text(maxlength - valuelength);

			});
		},

		initAreaResizer : function(){
			jQuery.each(jQuery('textarea[data-autoresize]'), function() {
				var offset = this.offsetHeight - this.clientHeight;
				var resizeTextarea = function(el) {
					jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
				};
				jQuery(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
			});
		},


		initCleanSpace : function(){
			$('[data-cleanspace]').on({
				keydown: function(e) {
					if (e.which === 32) return false;
				},
				change: function() {
					this.value = this.value.replace(/\s/g, "");
				}
			});
		},

		initValidFile: function(){
			$('[data-validfile]').change(function(e){
				var $input = $(this),
					filename = $(this).val(),
					$father = $input.parents('.form-control').find('.form-control--file'),
					$mother = $input.parents('.form-control'),
					maxsize = $input.data('max-size'),
					filesize = $input.get(0).files[0].size,
					$okmessage = $mother.find('.form-control__text').text(),
					$errormessage = $mother.data('error-message');

				e.preventDefault();
				console.log('filesize: ' + filesize);
				console.log('okmessage: ' + $okmessage);
				//define el limite de tamaño
				if(maxsize){
					maxsize = maxsize;
					console.log('limit defined:' + maxsize);
				}else{
					maxsize = 100000 //100mb
					console.log('limit undefined:' + maxsize);
				}

				if(filesize>maxsize){
					console.log('too heavy');
					$mother.find('.form-control__text').html($errormessage);
					return false;
				}else{
					console.log('just right');
					$mother.find('.form-control__text').hide();
					if (filename.substring(3,11) == 'fakepath') {
						filename = filename.substring(12);
					}
					if(!filename){
						filename = $father.find('.content__btn--file__desc').text();
					}
					$father.find('.content__btn--file__desc').html(filename);
					return true;
				}
			});
		},

		copyClipboard : function( event ){
            event.preventDefault();

            var $button = $(event.currentTarget),
                $target = $('[data-target-name="'+ $button.data('target') +'"]'),
                $value = $target.val(),
                $textArea = document.createElement("textarea"),
                $okbtn = $('.copyboard-status'),
                $isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

            $textArea.value = $value;
            document.body.appendChild($textArea);

            if($isiOSDevice){
                var editable = $textArea.contentEditable;
                var readOnly = $textArea.readOnly;

                $textArea.contentEditable = true;
                $textArea.readOnly = false;

                var range = document.createRange();
                range.selectNodeContents($textArea);

                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                $textArea.setSelectionRange(0, 999999);
                $textArea.contentEditable = editable;
                $textArea.readOnly = readOnly;
            }else{
                $textArea.select();
            }

            if(document.execCommand('copy')){
                $okbtn.fadeIn(1500).addClass('ok');
                setTimeout(function () {
                    $okbtn.fadeOut('slow').addClass('ok');
                }, 1500);
            }else{
                $okbtn.fadeIn(1500).addClass('error');
                setTimeout(function () {
                    $okbtn.fadeOut('slow').removeClass('error');
                }, 1500);
            }

            document.body.removeChild($textArea);
            console.log('copied');
        },
		
		goToTop : function( event ){
            event.preventDefault();
            $('html, body').animate({scrollTop : 0},800);
        },
        
        stickyParent : function(){
            jQuery.each(jQuery('[data-sticky]'), function() {
                var $sticky = $(this);
                
                $sticky.stick_in_parent();
            });
        }
	};

	var app = new App();
	$document.ready(function(){ app.onReady && app.onReady(); });
	$window.on({'load' : function(){ app.onLoad && app.onLoad(); }
});

}(window, document, jQuery));

/////////////////////////////////////////
// Plugins y APIS
/////////////////////////////////////////
(function( window, $, undefined ){
    var $window = $(window);

    // pruebas personalizadas para modernizr
    Modernizr.addTest('device', function(){
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    });


    var unique = function( arr ) {
        var unique = [], i;

        for (i = 0; i < arr.length; i++) {
            var current = arr[i];
            if (unique.indexOf(current) < 0) { unique.push(current); }
        }
        return unique;
    };

    $.fn.svgfallback = function( callback ) {
        if( Modernizr.svg ){ return false; }

        return this.each(function() {
            this.src = this.getAttribute('data-svgfallback');
        });
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

    $.fn.equalizeHeights = function( dinamic, mqException ){
        var items = this,
            eq_h = function( $collection ){
                var heightArray = [];

                $collection.removeClass('height-equalized').height('auto');

                if( !mqException || !Modernizr.mq(mqException) ){
                    $collection.each(function(i,e){ heightArray.push( $(e).outerHeight() ); });
                    $collection.css({ height : Math.max.apply( Math, heightArray ) }).addClass('height-equalized').attr('data-max-height', Math.max.apply( Math, heightArray ));
                }
            };

        setTimeout(function(){ eq_h( items ); }, 0);

        if( dinamic ) { 
            $window.on('resize', function(){ 
                setTimeout(function(){ eq_h( items ); }, 10);
            });
        }
    };

    $.fn.equalizeChildrenHeights = function( dinamic, mqException ){
        return this.each(function(i,e){
            if( $(e).parents('[data-override-eq="true"]').length ){ return; }
            $(e).children().equalizeHeights(dinamic, mqException);
        });
    };

    $.fn.equalizeTarget = function( dinamic, mqException ){
        return this.each(function( index, box ){
            $(box).find( $(box).data('eq-target') ).equalizeHeights( dinamic, mqException );
        });
    };

    $.fn.equalizeGroup = function( attname, dinamic, mqException ){
        var groups = this.groupByAtt( attname );

        groups.forEach(function( $set ){
            $set.equalizeHeights( dinamic, mqException );
        });

        return this;
    };

    $.fn.random = function() {
        var randomIndex = Math.floor(Math.random() * this.length);  
        return $(this[randomIndex]);
    };
}( this, jQuery ));