// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/nodejump-jsbundle-0.0.1 -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-core-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/js-toolbox-0.0.1") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-common-0.0.1") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-navbar-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-auth-0.0.1") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/aj-share-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/bootstrap-utils-js-0.0.1") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-share-ui-js-0.0.1") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-status-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-notification-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-progress-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/aj-edit-js-0.0.6") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/aj-view-0.0.4") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/new-link-dialog-js-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/nodejump-app-0.0.2") -->

<!-- one.embedText("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/nodejump-helpbar-js-0.0.2") -->

function AJ_loginCompleted(aj, userLoggedIn) {

	

	var client = aj.createClient();
	
	var lastInjectedHashValue = null;
	
	var helpBar = $.initHelpBar($("#helpbar"));
	
	var nodejump = $.initNodeJumpApp({
		elem: $("#nodejumpapp"),
		client: client,
		nodeChangeHandler: function(nj, node, secret) {
			if (!nj.isAnonymousUser()) {
				window.location.hash = "#"+node.url();
			} else {
				window.location.hash = "#"+node.url()+"&"+secret;
			}
			lastInjectedHashValue = window.location.hash;
		}
	});
	
	nodejump.initComponents();
	
	nodejump.readHash(window.location.hash, function(hadHash) {
		if (!hadHash) {
			
			if (AJ.userNodeUri) {
					nodejump.initForUser(function() {
						nodejump.startAutoCommit();
						nodejump.startAutoRefresh();
					} );
			} else {
				nodejump.initForAnonymous(function() {
					nodejump.startAutoCommit();
					nodejump.startAutoRefresh();
				});
			}
			return;
		}
		
		nodejump.startAutoCommit();
		nodejump.startAutoRefresh();
	});
	
		
	
	$(window).hashchange( function(){
		if (!lastInjectedHashValue || !(window.location.hash.valueOf() === lastInjectedHashValue.valueOf())) {
			
			nodejump.readHash(window.location.hash, function(hadHash) {
				
			});
		}
		lastInjectedHashValue = null;
	});
	
	 
	$(window).focus(function() {
		nodejump.startAutoCommit();
		nodejump.startAutoRefresh();
	});
	
	$(window).blur(function() {
		nodejump.stopAutoCommit();
		nodejump.stopAutoRefresh();
	});

	$(window).unload(function() {
		nodejump.stopAutoCommit();
		nodejump.stopAutoRefresh();
	});
	
}

function AJ_engineLoaded(aj) {

	AJ.statusBar = $.ajInitStatusBar($("#ajstatusbar"), aj);
	AJ.notificationBar = $.ajInitNotificationBar($("#ajnotificationbar"), aj);
	AJ.navbar = $.ajInitNavbar($("#ajnavbar"), aj);
	AJ.progressBar=$.ajInitProgressBar($("#ajprogressbar"));
	
	
}

window.onload = function() {

}

// <!-- one.end -->
