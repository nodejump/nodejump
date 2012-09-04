// <!-- one.createPublic nodejump-helpbar-js-0.0.2 -->

// help bar module
(function($) {

	$.initHelpBar = function(elem) {

		var helpbar = {};

		helpbar.priv = {};

		helpbar.priv.setHeight = function(height) {
			var heightPx = height + "px";
			$('.footer').css('height', heightPx);
			$('.push').css('height', heightPx);
			$('.wrapper').css('margin-bottom', "-" + heightPx);

			if ($('.phoneHelpMenu').is(':visible')) {
				$('.hideHelpButton', elem).show();
				$('.formattingReferenceButton').hide();
				$('.linkingAndNavigationReferenceButton').hide();
				$('.sharingReferenceButton').hide();
			}

		};

		// init UI 
		(function() {

			$('.formattingReferenceButton', elem).click(function() {
				helpbar.priv.setHeight(400);
			});

			$('.linkingAndNavigationReferenceButton', elem).click(function() {
				helpbar.priv.setHeight(400);
			});

			$('.sharingReferenceButton', elem).click(function() {
				helpbar.priv.setHeight(400);
			});

			$('.hideHelpButton', elem).click(function() {
				$('.hideHelpButton', elem).hide();
				$('.formattingReferenceButton').show();
				$('.linkingAndNavigationReferenceButton').show();
				$('.sharingReferenceButton').show();
			});

			$('.noHelpButton').click(function() {
				//$('.expand', elem).css('height', '60px');
				$('.footer').css('height', '60px');
				$('.push').css('height', '60px');
				$('.wrapper').css('margin-bottom', '-60px');
			});

		})();

		return {

		};
	};

})(jQuery);

// <!-- one.end -->
