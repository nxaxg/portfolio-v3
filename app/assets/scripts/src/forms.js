/******************
MIT License

Copyright (c) 2016 Fernando Silva Müller (@fdograph)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Chilean RUT validator written in VanillaJS
******************/
(function(window, document){
	"use strict";

	var NinjaRut = function( protoRut ){
		this.protoRut = protoRut;
		this.cleanRut = this.clean();
		this.process();
		return this;
	};
	NinjaRut.prototype = {
		clean : function(){
			var allowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'k'];

			// clean the proto rut by removing forbidden characters
			var clean = Array.prototype.map.call(this.protoRut.toLowerCase(), function(c){ return c; });
			clean = clean.filter(function( c ){
				return allowed.indexOf(c) !== -1;
			});

			return clean.join('');
		},

		process : function(){
			this.number = this.cleanRut.substring(0, this.cleanRut.length - 1);
			this.digit = this.cleanRut.charAt(this.cleanRut.length - 1);
			this.isValid = this.validate();
		},

		getDigit : function(){
			var sum = 0,
				mul = 2,
				res;

			var i = this.number.length;

			while( i-- ){
				sum = sum + parseInt(this.number.charAt(i)) * mul;
				if( mul % 7 === 0 ){ mul = 2; }
				else { mul++; }
			}

			res = sum % 11;
			if( res === 0 ){ return '0'; }
			else if( res === 1 ){ return 'k'; }
			else { return 11 - res; }
		},

		validate : function(){
			// if too short
			if( this.cleanRut.length < 6 ){
				return false;
			}

			// if impossible ruts(but valid tho)
			// Eg: 11111111-1
			if( this.cleanRut.match(/(\d)\1{7,9}/) ){
               	return false;
            }

            // math validation
            if( this.digit != this.getDigit() ){
            	return false;
            }

            return true;
		},

		format : function( dots ){
			var formatedNum = dots ? this.number.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") : this.number;
			return formatedNum + '-' + this.digit;
		}
	};

	window.NinjaRut = NinjaRut;
}(window, document));

(function(window, document, $){
	"use strict";

	// check for Validizr dependency
	if( typeof Validizr === 'undefined' ){
		console.log('Error: Validizr is required');
		return;
	}

	/////////////////////////////////////////
	///////////////////////////////////////// CommonForm Module
	/////////////////////////////////////////

	var CommonForm = function( form ){
		this.form = form;
		var self = this;
		var func = form.getAttribute('data-validation') || false;

		this.validizr = new Validizr(this.form, {
			validInputCallback : this.validInputAction,
			notValidInputCallback : this.invalidInputAction,
			customValidations : this.customValidations,
			validFormCallback :  $.proxy(self[func], self),
		});
		return this;
	};
	CommonForm.prototype = {
		validInputAction : function( input ){
			$(input).parents('.form-control').find('.form-control__text').show(); //added
			$(input).parents('.form-control').removeClass('form-control--invalid');
			$(input).parents('.form-control').addClass('form-control--valid');
			if($('.form-control').hasClass('form-control--invalid')){
				$(this).parent('form').addClass('invalid-form');
			}else{
				$(this).parent('form').addClass('valid-form');
			}
		},
		invalidInputAction : function( input ){
			$(input).parents('.form-control').find('.form-control__text').hide(); //added
			$(input).parents('.form-control').removeClass('form-control--valid');
			$(input).parents('.form-control').addClass('form-control--invalid');
			if($('.form-control').hasClass('form-control--invalid')){
				$(this).parent('form').addClass('invalid-form');
			}else{
				$(this).parent('form').addClass('valid-form');
			}
		},
		generic_submit : function( $form ){
			$form.submit();
		},
		generic_ajax :function($form){
			$($form).addClass('sending');
			$.ajax({
					url: $($form).attr('action'),
					method: $($form).attr('method'),
					data: $($form).serialize(),
					dataType: 'json'
			}).done(function( response ){
				if(response.status == 'ok') {
					$($form).parent('div').html(response.response_html);
				}
				if(response.status == 'error') {
					$($form).parent('div').html(response.response_html);
				}
			})
		},
		customValidations : {
			
			onlyNumbers : function( input, validizr, event ){
				var $input = $(input),
					value = $input.val(),
					cleanValue = value.replace(/\D/g, ''),
					minLength = $input.data('minlength') || false,
					maxLength = $input.data('maxlength') || false;

				// force clean value to input
				$input.val(cleanValue);

				// only act on required fields
				// if no value and not required
				if( !cleanValue && !$input.prop('required') ){ return true; }

				// value validation

				// if no value after cleaning
				if( !cleanValue ){ return false; }

				// if less than specified minimun length
				if( minLength && cleanValue.length < minLength ){ return false; }

				// if more than specified maximum length
				if( maxLength && cleanValue.length > maxLength ){ return false; }

				// return value based boolean
				return !!cleanValue;
			},

			onlyString : function( input, validizr, event ){
				var $input = $(input),
					value = $input.val(),
					cleanValue = value.replace(/\d/g, ''),
					minLength = $input.data('minlength') || false,
					maxLength = $input.data('maxlength') || false;

				// force clean value to input
				$input.val(cleanValue);

				// only act on required fields
				// if no value and not required
				if( !cleanValue && !$input.prop('required') ){ return true; }

				// value validation

				// if no value after cleaning
				if( !cleanValue ){ return false; }

				// if less than specified minimun length
				if( minLength && cleanValue.length < minLength ){ return false; }

				// if more than specified maximum length
				if( maxLength && cleanValue.length > maxLength ){ return false; }

				// return value based boolean
				return !!cleanValue;
			},

			equalTo : function( input, validizr, event ){
				var $input = $(input),
					inputType = validizr.getInputType( input ),
					value = $input.val(),
					sample = $('#' + $input.data('sample')).val();

				// value validation

				// check if any is empty
				if( !value || !sample ){ return false; }

				// check if is email depending on input type
				if( inputType === 'email' ){
					//if email input and any of the values isnt an email
					if( !validizr.emailRegEx.test( value ) || !validizr.emailRegEx.test( sample ) ){
						return false;
					}
				}

				// check if both values are equal
				if( value !== sample ){ return false; }

				// return value based boolean
				return !!value;
			},

			matchPattern : function( input, validizr, event ){
				var $input = $(input),
					value = $input.val(),
					protoPattern = $input.data('pattern'),
					pattern = new RegExp(protoPattern);

				// value validation

				// if no value
				if( !value ){ return false; }

				// return regexp based boolean
				return pattern.test( value );
			},

			validRut : function( input, validizr, event ){
				var $input = $(input),
					rut = new NinjaRut( $input.val().trim() );

                // value validation
               	if( !rut.isValid ){ return false; }

                // if autoformat is specified
                if( $input.data('autoformat') ){
                	$input.val( rut.format(true) );
                }

                // if it passes is considered valid
                return true;
			},

			fileValidate : function(input, validizr, event){
				var $input = $(input),
					filename = $(input).val(),
					maxsize = $input.data('max-size'),
					filesize = $input.get(0).files[0].size;

				console.log('filesize: ' + filesize);
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
					return false;
				}else{
					console.log('just right');
					if (filename.substring(3,11) == 'fakepath') {
						filename = filename.substring(12);
					}
					if(!filename){
						filename = $(input).siblings('.form-control__file__text').text();
					}
					$(input).siblings('.form-control__file__text').html(filename);
					return true;
				}
			}
		}
	};

	$.fn.commonForm = function(){
		if( this.data('commonForm') ){ return this.data('commonForm'); }
		return this.each(function(i, el){
			$(el).data('commonForm', (new CommonForm(el)));
		});
	};

	// self initialization
	$(document).ready(function(){
		$('[data-module="common-form"]').commonForm();
	});
}(window, document, jQuery));