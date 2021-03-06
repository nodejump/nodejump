// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/new-link-dialog-js-0.0.2 -->

(function($, AJ) {

	$.initNewLinkDialog = function(elem, client) {

		var nld = {};

		nld.dialog = null;

		nld.node = null;
		nld.secret = null;

		nld.onLinkCreated = null;
		nld.onCancel = null;

		nld.show = function(params) {
			nld.onLinkCreated = params.onLinkCreated;
			nld.onCancel = params.onCancel;
			nld.node = params.node;
			nld.secret = params.secret;

			
			nld.dialog.show();
			$(".insertLinkDialog-title", elem).val("");
			$('.insertLinkDialog-title', elem).focus();
		};

		nld.hide = function() {

			nld.dialog.hide();
		};

		// init UI
		(function() {
			nld.dialog = $.wrapDialog($('.insertLinkDialog', elem));

			$(".insertLinkDialog-createDocument", elem).click(
					function(evt) {
						evt.preventDefault();

						var title = $(".insertLinkDialog-title", elem).val();

						if (!title) {
							alert("Please specify a title");
							return;
						}

						nld.hide();

						
						
						AJ.common.createMarkdownChildDocument({
							client : client,
							node : nld.node,
							secret : nld.secret,
							documentTitle : title,
							onSuccess : function(node, secret) {
								
								var absoluteLink = node.url();
								
								nld.onLinkCreated({
									title : title,
									absoluteLink : absoluteLink,
									relativeLink : absoluteLink
											.substring(absoluteLink
													.lastIndexOf('/'))

								});

							},
							onFailure : function(ex) {
								AJ.ui.notify(
										"Unexpected error while creating child document: "
												+ ex, "alert-error");
							}
						});

					});

			$(".insertLinkDialog-cancel", elem).click(function(evt) {
				evt.preventDefault();

				nld.hide();
				nld.onCancel();
			});

		})();

		return {
			show : nld.show,
			hide : nld.hide,
			setModal : nld.dialog.setModal
		};

	};
})(jQuery, AJ);

// <!-- one.end -->
