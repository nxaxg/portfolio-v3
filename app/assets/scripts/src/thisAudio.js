(function(window, document, $){
	"use strict";

	var AudioPlay = function(element){
        this.$audio = $(element);
        this.$audioElement = document.createElement('audio');
        
        this.$audiosrc = this.$audio.data('target');
        this.$audioElement.setAttribute('src', this.$audiosrc);

        this.$playbutton = this.$audio.find('[data-role="button-play"]');
        this.$pausebutton = this.$audio.find('[data-role="button-pause"]');
        this.$playbutton.on('click', this.playAudio.bind(this));
        this.$pausebutton.on('click', this.pauseAudio.bind(this));
        return this;
    };

    AudioPlay.prototype = {
        playAudio : function(event){
            event.preventDefault();
            this.$audioElement.play();
            this.$playbutton.toggleClass('remove');
            this.$pausebutton.toggleClass('remove');
        },
        pauseAudio : function(event){
            event.preventDefault();
            this.$audioElement.pause();
            this.$pausebutton.toggleClass('remove');
            this.$playbutton.toggleClass('remove');
        }
    }

    $.fn.audio = function(){
		if( this.data('audio') ){ return this.data('audio'); }
		return this.each(function(i, el){
			$(el).data('audio', (new AudioPlay(el)));
		});
    };
    
    $('[data-module="audio-js"]').audio();

}(window, document, jQuery));