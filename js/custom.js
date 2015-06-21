(function() {
	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};
	if( $('.container').length != 0 && $('nav.thumb-nav').length != 0 ){
		var containers = [].slice.call( document.querySelectorAll( '.container' ) ),
			containersCount = containers.length,
			nav = document.querySelector( 'nav.thumb-nav' ),
			pageTriggers = [].slice.call( nav.children ),
			isAnimating = false, current = 0;
	}
	function init() {
		resetScroll();
		// disable scrolling
		window.addEventListener( 'scroll', noscroll );
		// set current page trigger
		classie.add( pageTriggers[ current ], 'thumb-nav__item--current' );
		// set current container
		$('#content .container').first().addClass('container--current');
		// initialize events
		initEvents2();
	}

	function initEvents2() {
		// slideshow navigation
		pageTriggers.forEach( function( pageTrigger ) {
			pageTrigger.addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				navigate( this );
			} );
		} );

		// open each container's content area when clicking on the respective trigger button
		$('.container').each( function( container ) {
			$(this).find( 'button.trigger' ).click(function() {
				toggleContent( $('.container'), this );
			});
		});

		// keyboard navigation events
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which,
				isContainerOpen = containers[ current ].getAttribute( 'data-open' ) == 'open';

			switch (keyCode) {
				// left key
				case 37:
					if( current > 0 && !isContainerOpen ) {
						navigate( pageTriggers[ current - 1 ] );
					}
					break;
				// right key
				case 39:
					console.log(current);
					if( current < containersCount - 2 && !isContainerOpen ) {
						navigate( pageTriggers[ current + 1 ] );
					}
					break;
			}
		} );
	}

	function navigate( pageTrigger ) {
		var oldcurrent = current,
			newcurrent = pageTriggers.indexOf( pageTrigger );

		if( isAnimating || oldcurrent === newcurrent ) return;
		isAnimating = true;

		// reset scroll
		allowScroll();
		resetScroll();
		preventScroll();

		var currentPageTrigger = pageTriggers[ current ],
			nextContainer = document.getElementById( pageTrigger.getAttribute( 'data-container' ) ),
			currentContainer = containers[ current ],
			dir = newcurrent > oldcurrent ? 'left' : 'right';

		classie.remove( currentPageTrigger, 'thumb-nav__item--current' );
		classie.add( pageTrigger, 'thumb-nav__item--current' );

		// update current
		current = newcurrent;

		// add animation classes
		classie.add( nextContainer, dir === 'left' ? 'container--animInRight' : 'container--animInLeft' );
		classie.add( currentContainer, dir === 'left' ? 'container--animOutLeft' : 'container--animOutRight' );

		onEndAnimation( currentContainer, function() {
			// clear animation classes
			classie.remove( currentContainer, dir === 'left' ? 'container--animOutLeft' : 'container--animOutRight' );
			classie.remove( nextContainer, dir === 'left' ? 'container--animInRight' : 'container--animInLeft' );

			// clear current class / set current class
			classie.remove( currentContainer, 'container--current' );
			$('#content .container.container--current').removeClass('container--current');
			$('#content .container.container--current').next('.container').addClass('container--current');
			classie.add( nextContainer, 'container--current' );

			isAnimating = false;
		} );
	}

	// show content section
	function toggleContent( container, trigger ) {
		if($('.container.container--current').hasClass('container--open' )) {
			$('.container.container--current').removeClass('container--open' );
			$('.container.container--current .trigger').removeClass('trigger--active' );
			$('#menu.menu').removeClass('hide-nav' );
			$('.thumb-nav').removeClass('thumb-nav--hide');
			$('.container').attr( 'data-open', '' );
			preventScroll();
		}
		else {
			$('.container.container--current').addClass('container--open' );
			$('.container.container--current .trigger').addClass('trigger--active' );
			$('.thumb-nav').addClass('thumb-nav--hide');
			$('#menu.menu').addClass('hide-nav' );
			$('.container.container--current').attr( 'data-open', 'open' );
			allowScroll();
		}
	}

	// scroll functions
	function resetScroll() { document.body.scrollTop = document.documentElement.scrollTop = 0; }
	function preventScroll() { window.addEventListener( 'scroll', noscroll ); }
	function allowScroll() { window.removeEventListener( 'scroll', noscroll ); }
	function noscroll() { 
		window.scrollTo( 0, 0 ); 
	}
	
	if( $('.container').length != 0 && $('nav.thumb-nav').length != 0 ){
		init();
	}
	

	// For Demo purposes only (prevent jump on click)
	[].slice.call( document.querySelectorAll('.items-wrap a') ).forEach( function(el) { el.onclick = function() { return false; } } );






	//////////////////////////////========================================///////////////

	function SVGMenu( el, options ) {
		this.el = el;
		this.init();
	}

	SVGMenu.prototype.init = function() {
		this.trigger = this.el.querySelector( 'button.menu__handle' );
		this.shapeEl = this.el.querySelector( 'div.morph-shape' );

		var s = Snap( this.shapeEl.querySelector( 'svg' ) );
		this.pathEl = s.select( 'path' );
		this.paths = {
			reset : this.pathEl.attr( 'd' ),
			open : this.shapeEl.getAttribute( 'data-morph-open' ),
			close : this.shapeEl.getAttribute( 'data-morph-close' )
		};

		this.isOpen = false;

		this.initEvents();
	};

	SVGMenu.prototype.initEvents = function() {
		this.trigger.addEventListener( 'click', this.toggle.bind(this) );
	};

	SVGMenu.prototype.toggle = function() {
		var self = this;

		if( this.isOpen ) {
			classie.remove( self.el, 'menu--anim' );
			setTimeout( function() { classie.remove( self.el, 'menu--open' );	}, 250 );
		}
		else {
			classie.add( self.el, 'menu--anim' );
			setTimeout( function() { classie.add( self.el, 'menu--open' );	}, 250 );
		}
		this.pathEl.stop().animate( { 'path' : this.isOpen ? this.paths.close : this.paths.open }, 350, mina.easeout, function() {
			self.pathEl.stop().animate( { 'path' : self.paths.reset }, 800, mina.elastic );
		} );
		
		this.isOpen = !this.isOpen;
	};

	new SVGMenu( document.getElementById( 'menu' ) );
})(jQuery);

var slider = null;

jQuery(document).ready(function(){
	if($(window).width() <= 580){
		if($('.bxslider').length != 0){
			slider = $('.bxslider').bxSlider({
				pager: false
			});
		}
	}

	$('a.btn-pause-play').click(function(even){
		even.preventDefault;
		var id = $(this).parents('.intro__image').find('video').attr('id');
		$(this).toggleClass('active');
		var video = document.getElementById(id);
		playPause(video);
	});

	$('.btn-card').click(function(even){
		even.preventDefault;
		$(this).toggleClass('active');
		$('#frmCard').slideToggle();
	});
	
});

jQuery(window).resize(function(){
	if($(window).width() <= 580 && slider == null){
		if($('.bxslider').length != 0){
			slider = $('.bxslider').bxSlider({
				pager: false
			});
		}
	}
	else{
		if($('.bxslider').length != 0){
			slider.reloadSlider();
		}
	}
});

jQuery(window).load(function(){
	$('.btn-popup').fancybox({
		padding: 0
	}).trigger('click');


	if($('#carousel').length != 0 || $('#slider').length != 0){
		$('#carousel').flexslider({
			animation: "slide",
			controlNav: false,
			animationLoop: false,
			slideshow: false,
			itemWidth: 210,
			itemMargin: 5,
			asNavFor: '#slider'
		});

		$('#slider').flexslider({
			animation: "slide",
			controlNav: true,
			directionNav: false,
			animationLoop: true,
			slideshow: false,
			sync: "#carousel"
		});
	}
	if(jQuery(window).width() < 768){
		if(jQuery('.list-videos ul li').length != 0){
			jQuery('.list-videos ul li').each(function(){
				$(this).attr("onClick","return true");
			});
		}
	}
});

function playPause(myVideo) { 
    if (myVideo.paused) 
        myVideo.play(); 
    else 
        myVideo.pause(); 
}

