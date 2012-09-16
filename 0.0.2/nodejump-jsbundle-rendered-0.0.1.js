
// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/nodejump-jsbundle-rendered-0.0.1 -->

/* AJ Core API. */

	if (!window.AJ) { AJ = {}; }
	
	if (!window.AJ.utils) {AJ.utils = {}; }
	
	if (!window.AJ.ui) {AJ.ui = {}; }
	
	AJ.userEmail =null;
	AJ.userNodeUri = null;
	AJ.userNodeSecret = null;
	AJ.sessionToken = null;
	AJ.notificationBar = null;
	AJ.progressBar = null;
	AJ.statusBar = null;
	AJ.navbar = null;
	AJ.odb = null;
	
	
	
	AJ.utils.addBasicAuth = function(url, username, password) {
		var httpEnd = url.valueOf().indexOf("//")+2;
		
		var httpPart = url.valueOf().substring(0, httpEnd);
		
		var authPart = username + ":" + password + "@";
		
		var resourcePart = url.valueOf().substring(httpEnd, url.valueOf().length);
		
		return httpPart + authPart + resourcePart;
	};
	
	
	
	// assure that for all other domains but aj cookies are only available in
	// the
	// specific path of the currently open page.
	AJ.utils.getSavePath = function() {
		if (window.location.host.valueOf() == "appjangle.com") {
			return undefined;
		}
		
		return window.location.pathname;
	}
	
	AJ.utils.isAppjangleLink = function(url) {
		return (url.indexOf("http://appjangle.com/edit") === 0 || 
				url.indexOf("http://appjangle.com/view") === 0 ||
				url.indexOf("https://u1.linnk.it") === 0 ||
				url.indexOf("http://slicnet.com") === 0 ||
				url.indexOf("https://admin1.linnk.it") === 0);
	};
	
	AJ.utils.parseAppLink = function(url) {
		var hashIdx = url.indexOf('#');
		var hash = url.substring(hashIdx);
		
		var params = hash.split("&");

		var address=null;
		var secret=null;
		var feature=null;
		
		if (params[0]) {
			address = params[0].substr(1);
		}

		if (params[1]) {
			if (params[1].indexOf("feature=") === 0) {
				feature=params[1].substring("feature=".length);
			} else {
				secret = params[1];
			}
		}
		
		if (params[2]) {
			if (params[1].indexOf("feature=") === 0) {
				feature=params[1].substring("feature=".length);
			}
		}
		
		return {
			address: address,
			secret: secret,
			feature: feature};
	};
	
	
	
	AJ.ui.notify = function(html, notificationClass) {
		if (AJ.notificationBar) {
			AJ.notificationBar.notify(html, notificationClass);
			return;
		}
		
		alert($(html).text());
		
	}
	
	AJ.ui.showProgressBar = function() {
		if (AJ.progressBar) {
			AJ.progressBar.show();
		}
	};
	
	AJ.ui.hideProgressBar = function() {
		if (AJ.progressBar) {
			AJ.progressBar.hide();
		}
	}
	
	
	AJ.ui.showWait = function() {
		if (AJ.navbar) {
			AJ.navbar.showWait();
		}
	};
	
	AJ.ui.showLoginPanel = function() {
		if (AJ.navbar) {
			AJ.navbar.showLogin();
		}
	};
	
	AJ.ui.showLoggedInPanel = function() {
		if (AJ.navbar) {
			AJ.navbar.showLoggedIn();
		}
	};
	
	AJ.ui.showStatus = function(html) {
		if (AJ.statusBar) {
			AJ.statusBar.showStatus(html);
		}
	}
	
	AJ.loginWithSessionToken = function(params) {
		var c = params.one.createClient();
	
		c.loginUser({
			sessionToken : params.sessionToken,
			appNodeUri : "https://u1.linnk.it/0fs7dr/Apps1/appjangle",
			appNodeSecret : "",
			onSuccess : function(res) {
				
				if (AJ.navbar) {
					AJ.navbar.setEmail(res.userEmail);
				}
				AJ.ui.showLoggedInPanel();
	
				AJ.userEmail = res.userEmail;
				AJ.userNodeUri = res.userNodeUri;
				AJ.userNodeSecret = res.userNodeSecret;
				AJ.sessionToken = res.sessionToken;
				
				c.shutdown({
					onSuccess : function() {
						params.onSuccess();
					}
				});
			},
			onInvalidDetails : function() {
				AJ.utils.setCookie("appjangle-session", "logout", 1, JS.utils.getSavePath());
				params.onInvalidSession();
				return;
			},
			onUserNotRegisteredForApplication : function() {
				params.onFailure("User is not registered for this application.");
				return;
			},
			onChallenge : function(res) {
				params.onFailure("Unexpected challenge while loggin in.");
				return;
			},
			onFailure : function(ex) {
				params.onFailure(ex);
			}
		});
	};
	
	AJ.loginWithUsernameAndPassword = function(one, username, password) {
		if (!AJ.utils.validateEmail(username)) {
			alert("Please supply a valid email address.");
			return;
		}
		AJ.ui.showWait();
		
		var c = one.createClient();
		
		c.loginUser({
			email: username.toLowerCase(),
			password: password,
			appNodeUri: "https://u1.linnk.it/0fs7dr/Apps1/appjangle",
			appNodeSecret: "",
			onSuccess : function(res) {
				
				if (AJ.navbar) {
					AJ.navbar.setEmail(res.userEmail);
				}
				AJ.ui.showLoggedInPanel();
				
				AJ.userEmail = res.userEmail;
				AJ.userNodeUri = res.userNodeUri;
				AJ.userNodeSecret = res.userNodeSecret;
				AJ.sessionToken = res.sessionToken;
				AJ.utils.setCookie("appjangle-session", res.sessionToken, 20, AJ.utils.getSavePath());
				
				c.shutdown({
					onSuccess : function() {
					}
				});
			},
			onInvalidDetails : function() {
				alert("Invalid username and/or password.");
				AJ.ui.showLoginPanel();
				return;
			},
			onUserNotRegisteredForApplication : function() {
				AJ.ui.notify("User is not registered. Please register first.", "alert-error");
				AJ.ui.showLoginPanel();
				return;
			},
			onChallenge : function(res) {
				AJ.ui.notify("Unexpected challenge while logging in.", "alert-error");
				AJ.ui.showLoginPanel();
				return;
			},
			onFailure : function(ex) {
				AJ.ui.notify("Unexpected exception: " + ex, "alert-error");
				AJ.ui.showLoginPanel();
			}
		});
		
	};

	function odbOnLoad() {
	
		var odb = new Odb();
		AJ.odb = odb;
		var one = odb.init("<no api key>");
		
		if (window.AJ_engineLoaded && typeof AJ_engineLoaded == 'function') {
			AJ_engineLoaded(one);
		}
	
		var sessionCookie = AJ.utils.getCookie("appjangle-session");
		if (sessionCookie && !(sessionCookie === "logout")) {
			AJ.ui.showWait();
			
			AJ.loginWithSessionToken({one: one, 
				sessionToken: sessionCookie, 
				onSuccess: function() {
				if (window.AJ_loginCompleted && typeof AJ_loginCompleted == 'function') {
					
					AJ_loginCompleted(one, true);
				}
				},
				onInvalidSession: function() {
					if (window.AJ_loginCompleted && typeof AJ_loginCompleted == 'function') {
						AJ_loginCompleted(one, false);
					}
				},
				onFailure: function(ex) {
					AJ.ui.notify("Unexpected exception: " + ex, "alert-error");
					if (window.AJ_loginCompleted && typeof AJ_loginCompleted == 'function') {
						AJ_loginCompleted(one, false);
					}
				}
				
			});
	
			return;
		}
		
		AJ.ui.showLoginPanel();

		if (window.AJ_loginCompleted && typeof AJ_loginCompleted == 'function') {

			AJ_loginCompleted(one, false);
		}
	
	}
	




(function(dest) {

	var basicCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	dest.isSimpleChar = function(testchar) {

		var srclength = basicCharacters.length;

		var valid = false;
		for ( var i = 0; i < srclength; i++) {
			if (valid || basicCharacters.charAt(i) === testchar) {
				valid = true;
			}
		}
		
		return valid;

	};

	dest.getSimpleText = function(input) {

		var text = '';

		var inputLenght = input.length;

		for ( var j = 0; j < inputLenght; j++) {

			var testchar = input.charAt(j);

			var valid = dest.isSimpleChar(testchar);

			if (valid) {
				text = text + testchar;
			} else {
				text = text + "_";
			}

		}

		return text;
	};

	/**
	 * Checks whether a particular position in a text can be characterized
	 * as whitespace.
	 */
	dest.inWord = function(pos, text) {
		if (!pos) throw "pos must be defined";
		if (!text) throw "text must be defined";

		if (pos === 0) {
			return false;
		}

		var thisChar = text[pos];
		var previousChar = text[pos - 1];
		
		
		if (dest.isSimpleChar(thisChar) || dest.isSimpleChar(previousChar)) {
			return true;
		}

		return false;
	};

	// from a given position extracts a word using normal characters
	dest.extractWord = function(pos, text) {
		
		var before = '';
		var char = text[pos];
		var after = '';
		
		
		if (pos > 0) {
			
			for (var i = pos-1; i >= 0; i--) {
				if (!dest.isSimpleChar(text[i]) || text[i] === " ") {
					break;
				}
				before = text[i] + before;
				
			}
			 
			
		}
		
		if (pos+1 < text.length) {
			for (var j=pos+1; j < text.length; j++) {
				if (!dest.isSimpleChar(text[j]) || text[j] === " ") {
					break;
				}
				after = after + text[j];
				
			}
			
		}
		return {
			startPos : pos - before.length,
			endPos : pos + after.length + 1,
			word: before + char + after
		}
		
		
	};
	
	dest.getRandomCharacters = function(destlength) {

		var text = '';

		var srclength = basicCharacters.length;

		for ( var i = 0; i < destlength; i++) {
			var pos = Math.floor(Math.random() * srclength);
			text += basicCharacters.charAt(pos);
		}

		return text;

	};

	dest.validateEmail = function(email) { 
	    var re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
	    return re.test(email.toLowerCase());
	};
	
	dest.getCookie = function(c_name) {
		var i, x, y, ARRcookies = document.cookie.split(";");
		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");
			if (x == c_name) {
				return unescape(y);
			}
		}
	};

	dest.setCookie = function(c_name, value, exdays, path) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value)
				+ ((exdays == null) ? "" : "; expires=" + exdate.toUTCString())
				+ ((path == null) ? "" : "; path=" + path);
		document.cookie = c_name + "=" + c_value;
	};

	
	
	
})(AJ.utils);
// change location into which tools are to be injected into





(function($, AJ) {

	AJ.common = function() {

		var common = {};
		
		/**
		 * Assures that a node will be rendered correctly, if it holds markdown
		 * content. 
		 */
		common.configureMarkdownNode = function(client, node) {
			client
					.append({
						node : client
								.reference("https://admin1.linnk.it/types/v01/isHtmlValue"),
						to : node
					});

			client
					.append({
						node : client
								.reference("https://u1.linnk.it/6wbnoq/Types/aTemplate"),
						to : node
					});

			client
					.append({
						node : client
								.reference("https://u1.linnk.it/6wbnoq/Types/isMarkdown"),
						to : node
					});
		};

		/**
		 * Creates a new child document with the designated title as markdown document.
		 */
		common.createMarkdownChildDocument = function(params) {
			
			var client = params.client;
			var node = params.node;
			var secret = params.secret;
			var documentTitle = params.documentTitle;
			var onSuccess = params.onSuccess;
			var onFailure = params.onFailure;
			
			var simpleTitle = AJ.utils.getSimpleText(documentTitle);
			if (simpleTitle.length > 25) {
				simpleTitle = simpleTitle.substring(0, 24);
			}

			client.load({
				node : node,
				secret : secret,
				onSuccess : function(res) {

					var newNode = client.append({
						node : "# " + documentTitle + "\n\n",
						to : res.loadedNode,
						atClosestAddress : "./" + simpleTitle
					});

					common.configureMarkdownNode(client, newNode);

					onSuccess(newNode, secret);

				},
				onFailure : function(ex) {
					onFailure(ex);
				}
			});
		};
		
		/**
		 * That a node with the format /apps/appname is available for the
		 * current user.
		 */
		common.assertApplicationNode = function(params) {
			
			common.priv.checkAppNode(params);
			
		};
		
		/**
		 * Will append not directly to the selected node but append intermediary
		 * nodes, which assure good acccess performance, even if the total
		 * number of appended nodes is very large.
		 */
		common.appendDeep = function(params) {
			
			common.priv.loadCounterNode(params);
		};
		
		common.priv = {};
		
		common.priv.appendNodeWithCount = function(params) {
			
			var client = params.client;
			var toNode = params.toNode;
			var secret = params.secret;
			var count = params.count;
			var counterNode = params.counterNode;
			var nodeFactory = params.nodeFactory;
			
			var onSuccess = params.onSuccess;
			var onFailure = params.onFailure;
			
			if (!toNode)
				throw "Node with count cannot be appended to node <null>";
			if (!counterNode)
				throw "Counter node must be defined";

			var c = client;

			AJ.odb.path()
					.getHierarchicalPathFromIncrementalNumber(
							count,
							toNode.url(),
							function(res) {

								if (!res.parentPath)
									throw "Parent path should be defined";
								if (!res.newElementName)
									throw "New element name should be defined";

								
								c
										.appendSafe({
											node : res.newElementName,
											to : c.reference(res.parentPath),
											atAddress : "./"
													+ res.newElementName,
											onSuccess : function(res) {

												var newCounterNode = c
														.updateValue({
															forNode : counterNode,
															newValue : parseInt(parseInt(count) + 1)
														});

												c.replace({
													node : counterNode,
													withNode : newCounterNode
												});

												var editNode = c.append({
													node : nodeFactory(),
													to : res.appendedNode,
													atAddress : "./n"
												});

												common
														.configureMarkdownNode(
																c,
																editNode);

												onSuccess(editNode, secret);

											},
											onImpossible : function(res) {
												params.count = parseInt(parseInt(count) + 1);
												common.priv
														.appendNodeWithCount(
																params);
											},
											onFailure : function(ex) {
												onFailure("Unexpected failure: "
														+ ex);
											}
										});

							});

			
		};
		
		common.priv.loadCounterNode = function(params) {
			
			var client = params.client;
			var toNode = params.toNode;
			var secret = params.secret;
			var onSuccess = params.onSuccess;
			var onFailure = params.onFailure;
			var nodeFactory = params.nodeFactory;
			
			var c = client;
			
			c
			.load({
				url : toNode.url() + "/counter",
				secret: secret,
				onUndefined : function(res) {
					var counter = c.append({
						node : 1,
						to : toNode,
						atAddress : "./counter"
					});

					c
							.append({
								node : c
										.reference("https://u1.linnk.it/6wbnoq/Types/aCounter"),
								to : counter
							});

					params.count = 1;
					params.counterNode = counter;
					
					common.priv.appendNodeWithCount(params);
					
				},
				onSuccess : function(res) {

					var counter = res.loadedNode;

					var counterValue = c.dereference({
						ref : counter
					});

					params.count = counterValue.value();
					params.counterNode = counterValue;
					
					common.priv.appendNodeWithCount(params);
					

				},
				onFailure : function(ex) {
					onFailure("Unexpected failure: " + ex);
				}
			});

		};
		
		common.priv.createAppNode = function(params) {
			var client = params.client;
			var applicationName = params.applicationName;
			var onSuccess = params.onSuccess;
			var onFailure = params.onFailure;
			
			client.load({
				url: AJ.userNodeUri,
				secret: AJ.userNodeSecret,
				onSuccess: function(res) {
					client.assertChild({
						forNode : res.loadedNode,
						withPath : "apps",
						onSuccess : function(res) {
							if (!res.childNode)
								throw "Child node should have been defined.";
							
							client.assertChild({
								forNode : res.childNode,
								withPath : applicationName,
								onSuccess : function(res) {

									onSuccess(res.childNode, AJ.userNodeSecret);

								},
								onFailure : function(ex) {
									onFailure("Unexpected exception while creating application node: " + ex);
								}

							});

						},
						onFailure : function(ex) {
							onFailure("Unexpected exception while creating application node: " + ex);
						}
					});
				},
				onFailure: function(ex) {
					onFailure("Unexpected exception while loading user node: "+ex);
				}
			});
			
		};
		
		common.priv.checkAppNode = function(params) {
			var client = params.client;
			var applicationName = params.applicationName;
			var onSuccess = params.onSuccess;
			var onFailure = params.onFailure;
			
			client.load({
				url : AJ.userNodeUri+"/apps/"+applicationName,
				secret : AJ.userNodeSecret,
				onSuccess : function(res) {
					onSuccess(res.loadedNode, AJ.userNodeSecret);
				},
				onUndefined: function() {
					common.priv.createAppNode(params);
				},
				onFailure : function(ex) {
					onFailure("Unexpected exception while loading application node: " + ex);
				}
			});
		};
		
		return {
			createMarkdownChildDocument : common.createMarkdownChildDocument,
			configureMarkdownNode : common.configureMarkdownNode,
			assertApplicationNode : common.assertApplicationNode,
			appendDeep : common.appendDeep
		};
	}();

})(jQuery, AJ);




(function($) {

	/*
	 * Returns an aj navigation bar object.
	 * 
	 * Parameter element with navbar base html, aj root.
	 */
	$.ajInitNavbar = function(elem, aj) {
		$(".appjangle-signout-button", elem).click(function() {
			AJ.utils.setCookie("appjangle-session", "logout");
			location.reload();
		});
	
		$(".appjangle-signin-button", elem).click(function() {

			var email = $(".appjangle-useremail-input", elem).val().valueOf();
			var password = $(".appjangle-userpassword-input", elem).val().valueOf();
			
			if (!email) {
				AJ.ui.notify("<strong>Email Required:</strong> Please provide an email address in order to login.");
				return;
			}
			
			if (!password) {
				AJ.ui.notify("<strong>Password Required:</strong> Please provide a password in order to login.");
				return;
			}
			
			AJ.loginWithUsernameAndPassword(aj, email, password);
		});
		
		return {
			elem: elem,
			showWait: function() {
				$(".navbar-signin", elem).hide();
				$(".navbar-signout", elem).hide();
				$(".navbar-wait", elem).fadeIn('fast');
			},
			showLogin: function() {
				$(".navbar-signin", elem).show();
				$(".navbar-signout", elem).hide();
				$(".navbar-wait", elem).hide();
			},
			showLoggedIn: function() {
				$(".navbar-signin").hide();
				$(".navbar-wait").hide();
				$(".navbar-signout").fadeIn('fast');
			},
			setEmail: function(email) {
				$(".appjangle-userEmail", elem).text(email);
			}
			
		};

	};
	
})(jQuery);






// AJ auth module following
if (!window.AJ) {
	AJ = {};
}

if (!window.AJ.auth) {
	AJ.auth = {};
}

if (!window.AJ.auth.internal) {
	AJ.auth.internal = {};
}

AJ.auth.internal.createAuthStore = function(c, p_address, etcNode, callback) {

	var authStoreNode = c.append({
		node : "authStore",
		to : etcNode,
		atClosestAddress : "./authStore"
	});

	c.append({
		node : c.reference("https://u1.linnk.it/6wbnoq/Types/authStore"),
		to : authStoreNode
	});

	c.commit({
		onSuccess : function() {
			callback(c, p_address, authStoreNode);
		}
	});

};

AJ.auth.internal.assertAuthStore = function(c, p_address, callback) {
	if (!callback)
		throw "Callback must be defined";

	c
			.load({
				url : AJ.userNodeUri + "/etc",
				secret : AJ.userNodeSecret,
				forceReload : true,
				onSuccess : function(res) {

					var etcNode = res.loadedNode;

					c
							.select({
								from : res.loadedNode,
								linkingTo : c
										.reference("https://u1.linnk.it/6wbnoq/Types/authStore"),
								onSuccess : function(res) {
									if (res.children.length === 0) {
										AJ.auth.internal.createAuthStore(c,
												p_address, etcNode, function(c,
														p_address,
														authStoreNode) {
													callback(c, p_address,
															authStoreNode);
												});
										return;
									}

									callback(c, p_address, res.children[0]);
								},
								onUndefined : function(undefRes) {
									AJ.auth.internal.createAuthStore(c,
											p_address, etcNode, function(c,
													p_address, authStoreNode) {
												callback(c, p_address,
														authStoreNode);
											});
								},
								onUnauthorized : function(res) {
									alert("Wrong authorization for user node.");
								},
								onFailure : function(ex) {
									alert("Unexpected failure: " + ex);
								}
							});

				},
				onUndefined : function(res) {
					alert("etc Node does not exist.");
				},
				onUnauthorized : function(res) {
					alert("Wrong authorization for user node.");
				},
				onFailure : function(ex) {
					alert("Unexpected failure while loading etc node: " + ex);
				}
			});
}

AJ.auth.loadSecretFromAuthStore = function(c, p_address, onSuccess, onFailure) {

	AJ.auth.internal.assertAuthStore(c, p_address, function(c, p_address,
			authStoreNode) {
		var selectedAddress = p_address;

		c.select({
			from : authStoreNode,
			linkingTo : c.reference(selectedAddress),
			onSuccess : function(res) {
				if (res.children.length === 0) {
					// E.renderResults(c, selectedAddress, null);
					onSuccess(false, c, selectedAddress, null);
					return;
				}

				var secret = c.dereference({
					ref : res.children[0]
				}).value();

				onSuccess(true, c, p_address, secret);

			},
			onFailure : function(ex) {
				onFailure(ex);
			}
		});
	});

};

AJ.auth.registerSecret = function(c, secret, p_address, onSuccess, onFailure) {

	AJ.auth.internal
			.assertAuthStore(
					c,
					p_address,
					function(c, p_address, authStoreNode) {
						if (p_address == null)
							throw "Address must be defined.";

						var newAddress = p_address;

						c
								.select({
									from : authStoreNode,
									linkingTo : c.reference(newAddress),
									onSuccess : function(res) {
										if (res.children.length === 0) {

											var secretNode = c.append({
												node : secret,
												to : authStoreNode,
												atClosestAddress : "./secret"
											});

											c.append({
												node : c.reference(newAddress),
												to : secretNode
											});

											c.commit({
												onSuccess : function() {
													onSuccess();
												}
											});

											return;
										}

										var oldSecretNode = c.dereference({
											ref : res.children[0]
										});
										

										var newSecretNode = c.updateValue({
											forNode : oldSecretNode,
											newValue : secret
										});

										c.replace({
											node : oldSecretNode,
											withNode : newSecretNode
										});

										c.commit({
											onSuccess : function() {
												onSuccess();
											}
										});

									},
									onUndefined : function(res) {
										onFailure("auth store Node does not exist.");
									},
									onUnauthorized : function(res) {
										onFailure("Wrong authorization for auth store node node.");
									},
									onFailure : function(ex) {
										onFailure("Unexpected failure while registering secret: "
												+ ex);
									}
								});
					});

};



(function(glb) {

	var shr = {};

	shr.publish = function(client, node, callback) {

		shr.isPublished(client, node, function(hasPublicReadToken) {
			if (hasPublicReadToken) {
				glb.ui.notify(
						"Cannot publish document. It is already published.",
						"alert-warning");
				return;
			}

			var c = client;

			var newToken = c.newPublicReadToken();

			c.append({
				node : newToken,
				to : node
			});

			c.commit({
				onSuccess : function(res) {
					callback();
				}
			});

		});

	};

	shr.isPublished = function(client, node, callback) {
		var c = client;
		c.selectToken({
			from : node,
			grants : "read",
			onSuccess : function(res) {

				for ( var i = 0; i < res.children.length; i++) {
					var tokenRef = res.children[i];
					var token = c.dereference({
						ref : tokenRef
					});
					if (token.hasSecret() == false) {
						callback(true);
						return;
					}
				}

				callback(false);
				return;
			},
			onFailure : function(ex) {
				glb.ui.notify("Unexpected failure while generating view link: "
						+ ex, "alert-error");
			}

		});
	}

	shr.newReadLink = function(client, node, callback) {
		var c = client;
		shr.isPublished(client, node, function(hasPublicReadNode) {

			var httpLink;
			var ajViewLink;
			var token;

			if (hasPublicReadNode) {
				httpLink = node.url().valueOf() + ".node.html";
				ajViewLink = "http://appjangle.com/view#" + node.url();
				token = null;
			} else {

				var secret = AJ.utils.getRandomCharacters(12);
				var newToken = c.newToken({
					grants : "read",
					secret : secret
				});

				c.append({
					node : newToken,
					to : node
				});

				httpLink = AJ.utils.addBasicAuth(node.url().valueOf(), "token",
						secret)
						+ ".node.html";
				ajViewLink = "http://appjangle.com/view#"
						+ node.url().valueOf() + "&" + secret;
				token = secret;
			}

			var res = {
				url : node.url(),
				httpLink : httpLink,
				ajViewLink : ajViewLink,
				token : token
			};

			callback(res);

			c.commit({
				onSuccess : function(res) {
				}
			});

		});

	};

	shr.newReadWriteLink = function(client, node, callback) {
		var c = client;

		c.load({
			node : node,
			onSuccess : function(res) {
				var secret = AJ.utils.getRandomCharacters(12);

				var newToken = c.newToken({
					grants : "readwrite",
					secret : secret
				});

				c.append({
					node : newToken,
					to : node
				});

				var res = {
					url : node.url(),
					token : secret
				};

				callback(res);

				c.commit({
					onSuccess : function(res) {
					}
				});
			},
			onFailure : function(ex) {
				alert("Unexpected failure while generating edit link: " + ex);
			}
		});

	};

	glb.initShare = function(aj) {

		return {
			publish : function(client, node, callback) {
				shr.publish(client, node, callback);
			},
			isPublished : function(client, node, callback) {
				shr.isPublished(client, node, callback);
			},
			newReadLink : function(client, node, callback) {
				shr.newReadLink(client, node, callback);
			},
			newReadWriteLink : function(client, node, callback) {
				shr.newReadWriteLink(client, node, callback);
			}
		}
	};

})(AJ);





(function($) {

	/**
	 * Use with: http://twitter.github.com/bootstrap/javascript.html#modals
	 */
	$.wrapDialog = function(elem) {

		var dialog = {};

		dialog.setModal = function(modal) {

			if (modal) {
				elem.addClass('modal');
				elem.addClass('fade');
				elem.addClass('hide');
				$('.modal-body', elem).css('max-height', '480px');
				dialog.modal = true;
				return;
			}

			elem.removeClass('modal');
			elem.removeClass('fade');
			elem.removeClass('hide');
			$('.modal-body', elem).css('max-height', '2000px');
			dialog.modal = false;

		};

		dialog.show = function() {
			//alert(elem+" width "+elem.width());
			if ($(window).width() < 500) {
				dialog.setModal(false);
			} else {
				dialog.setModal(true);
			}
			
			elem.show();
			
			if (dialog.modal) {
				elem.modal('show');
			}
		};
		
		dialog.hide = function() {
			elem.modal('hide');
			elem.hide();
		};
		
		// init
		(function() {
			
			elem.resize(function(evt) {
				if ($(window).width() < 500) {
					dialog.setModal(false);
				} else {
					dialog.setModal(true);
				}
			});
			
			$('.close', elem).click(function(evt) {
				evt.preventDefault();
				dialog.hide();
			});
		}) ();
		
		return {
			show : dialog.show,
			hide : dialog.hide,
			setModal : dialog.setModal,
			isModal : dialog.modal
		};

	};
})(jQuery);





(function($, AJ) {

	$.initAjShareDialog = function(params) {
		var elem = params.elem;
		var client = params.client;
		var editLinkFactory = params.editLinkFactory;
		var viewLinkFactory = params.viewLinkFactory;
		
		var share = {};

		share.node = null;
		share.dialog = null;

		share.service = AJ.initShare(client);

		share.show = function(node) {
			share.node = node;
			
			share.dialog.show();
			
			share.service.isPublished(client, share.node, function(
					hasPublicReadToken) {
				
				if (hasPublicReadToken) {
					
					share.priv.showPublished(share.node.url()); 
					return;
				}
				
				$('.publishButton', elem).removeAttr('disabled');
			});

		};

		share.hide = function() {
			share.dialog.hide();
		};

		share.setModal = function(modal) {

			share.dialog.setModal(modal);

		};

		share.priv = {};
		
		share.priv.showPublished = function(address) {
			$('.publishComponent', elem).hide();
			$('.publishedAddress', elem).html("<a href='"+address+"'>"+address+"</a>");
			$('.publishedComponent', elem).show();
		};
		
		share.priv.showLink = function(link) {
			$('.generatedLink', elem).html("<a href='"+link+"' >"+link+"</a>");
			$('.linkDisplay', elem).show();
		};
		
		// init UI
		(function() {

			share.dialog = $.wrapDialog($('.shareUiDialog', elem));

			$('.publishButton', elem).click(function(evt) {
				evt.preventDefault();

				share.service.publish(client, share.node, function() {
					share.priv.showPublished(share.node.url()); 
				});

			});

			$('.generateEditLinkButton', elem).click(function(evt) {
				evt.preventDefault();
				
				share.service.newReadWriteLink(client, share.node, function(res) {
					share.priv.showLink(editLinkFactory(res.url, res.token));
				});
			});

			$('.generateViewLinkButton', elem).click(function(evt) {
				evt.preventDefault();
				
				share.service.newReadLink(client, share.node, function(res) {
					share.priv.showLink(viewLinkFactory(res.url, res.token));
				});
			});
			
			$('.closeButton', elem).click(function(evt) {
				evt.preventDefault();
				
				share.dialog.hide();
			});

		})();
		
		return {
			show : share.show,
			hide : share.hide,
			setModal : share.setModal
		};

	};
})(jQuery, AJ);





(function($) {

	/*
	 * Returns an aj navigation bar object.
	 * 
	 * Parameter element with navbar base html, aj root.
	 */
	$.ajInitStatusBar = function(elem, aj) {

		return {
			elem : elem,
			showStatus : function(html) {
				elem.show();
				$(" .statusBar", elem).fadeIn('fast');

				var statusElement = $("<p class='statusItem'>" + html + "</p>").prependTo(
						$(".statusText", elem));

				setTimeout(function() {
					statusElement.fadeOut('slow');
					statusElement.remove();
					if ($(".statusItem", elem).length === 0) {
						elem.hide();
					}
				}, 3000);
			}

		};

	};

})(jQuery);




(function($) {

	
	/*
	 * Returns an aj navigation bar object.
	 * 
	 * Parameter element with navbar base html, aj root.
	 */
	$.ajInitNotificationBar = function(elem, aj) {

		return {
			elem: elem,
			notify: function(html, notificationClass) {
				$(elem).show();
				
				$(".notificationMessage", elem).removeClass("alert-success");
				$(".notificationMessage", elem).removeClass("alert-info");
				$(".notificationMessage", elem).removeClass("alert-error");
				
				$(".notificationMessage", elem).addClass(notificationClass ? notificationClass : "alert-success");
				
				$(".notificationText", elem).html(html);
				
				$(".notificationBar", elem).fadeIn('fast');
				
				$(".close").click(function() {
					$(elem).hide();
				});
			}
			
		};

	};
	
})(jQuery);





// ---
// progress bar component js
(function($) {

	
	$.ajInitProgressBar = function(elem) {

		return {
			elem : elem,
			show : function() {
				elem.show();
				$(".progressBar", elem).show();
			},
			hide : function() {
				elem.hide();
				$(".progressBar", elem).hide();
			}
		};

	};

})(jQuery);





// -----
// edit application component
(function($, AJ) {

	$.initAjEdit = function(params) {
		var edit = {};
		
		// const
		var elem = params.elem;
		var client = params.client;
		// variables, with init
		edit.nodeChangeListener = params.nodeChangeListener;
		edit.textChangeListener = params.textChangeListener;
		edit.newEditorFactory = params.editorFactory;
		
		// variables without init
		edit.client = client;
		edit.loadedNode = null;
		edit.nodeSecret = null;
		
		
		edit.editor = null;
		edit.monitorChangesTimer = null;
		edit.commitedLocalChange = false;

		edit.loadNode = function(p_address, secret, callback, forceReload) {
			var c = edit.client;

			if (!p_address.substring) {
				throw "Address must be of type string and not: "
						+ typeof p_address;
			}

			if (edit.loadedNode) {
				var chachedValue = c.dereference({
					ref : edit.loadedNode
				}).value().valueOf();
			}

			c.load({
				url : p_address.valueOf(),
				secret : secret,
				forceReload : forceReload,
				onSuccess : function(res) {

					var valueNode = c.dereference({
						ref : res.loadedNode
					});

					// do nothing if value has not changed
					if (chachedValue
							&& valueNode.value().valueOf() === chachedValue) {
						callback(false);
						return;
					}

					if (edit.nodeChangeListener
							&& (!(edit.loadedNode) || !(edit.loadedNode.url()
									.valueOf() === res.loadedNode.url()
									.valueOf()))) {
						edit.nodeChangeListener(client, res.loadedNode, secret
								.valueOf());
					}

					edit.loadedNode = res.loadedNode;
					edit.nodeSecret = secret;

					if (edit.editor === null) {
						if (!edit.newEditorFactory)
							throw "Please specify editor factory.";
						edit.editor = edit.newEditorFactory();
					}

					var cursorPos = edit.editor.getCursor();

					edit.editor.setValue(valueNode.value());

					edit.editor.setCursor(cursorPos);

					if (AJ.userEmail != null
							&& p_address.indexOf(AJ.userNodeUri) != 0) {

						AJ.auth.registerSecret(c, secret, p_address,
								function() {

								}, function(ex) {
									alert("Error while registering secret: "
											+ ex);
								});

					}

					if (edit.textChangeListener()) {
						edit.textChangeListener();
					}
					edit.commitedLocalChange = false;
					callback(true);

				},
				onUndefined : function(undefRes) {
					alert("Node is not defined.")
				},
				onUnauthorized : function(res) {
					alert("Wrong authorization for node.");
				},
				onFailure : function(ex) {
					alert("Unexpected failure while loading node: " + ex);
				}
			});

		};

		edit.saveLocal = function(callback) {

			if (!edit.loadedNode)
				throw "Cannot commit local changes if no node is loaded.";

			if (!edit.client)
				throw "Cannot commit local changes if no client is specified.";

			// creating save context
			edit.client.load({
				node : edit.loadedNode,
				secret : edit.secret,
				onSuccess : function(res) {

					var c = edit.client;

					var oldValue = c.dereference({
						ref : edit.loadedNode
					});

					var newText = edit.editor.getValue();

					// no changes ...
					if (oldValue.value().valueOf() === newText.valueOf()) {
						callback(false);
						return;
					}

					var newValue = c.updateValue({
						forNode : oldValue,
						newValue : newText
					});

					c.replace({
						node : oldValue,
						withNode : newValue
					});

					if (edit.textChangeListener()) {
						edit.textChangeListener();
					}
					edit.commitedLocalChange = true;

					callback(true);
				}
			});

		}

		edit.save = function(callback) {

			edit.saveLocal(function(wasChanged) {

				if (edit.commitedLocalChange) {
					edit.commitedLocalChange = false;
					var c = edit.client;

					var nodeToSave = edit.loadedNode;

					c.commit({
						onSuccess : function() {
							c.clearVersions({
								node : nodeToSave,
								keep : 5,
								onSuccess : function(res) {
									callback(true);
								},
								onFailure : function(ex) {
									AJ.ui.notify(
											"Exception while clearing versions: "
													+ ex, "alert-error");
								}
							});
						}
					});
					return;
				}

				callback(false);

			});

		};

		edit.createNewNode = function(callback) {
			if (AJ.userEmail == null) {
				AJ.ui.showStatus("Creating new data seed.");

				edit.createNewSeedNode(callback);
				return;
			}

			edit.createNewNodeInUserData(callback);
		};

		edit.createNewSeedNode = function(callback) {
			edit.client.seed({
				onSuccess : function(res) {

					var editNode = edit.client.append({
						node : "# Hello\n\nWrite Markdown here!",

						to : res.root,
						atAddress : "./ed"
					});

					AJ.common.configureMarkdownNode(edit.client, editNode);

					var newToken = edit.client.newPublicReadToken();

					edit.client.append({
						node : newToken,
						to : editNode
					});

					edit.loadNode(editNode.url(), res.secret, callback);

				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected error while creating anonymous document: "
									+ ex, "alert-error");
				}
			});
		};

		edit.assertEditDocsNode = function(onSuccess) {
			var c = edit.client;

			AJ.common.assertApplicationNode({
				client : c,
				applicationName : "edit",
				onSuccess : function(node, secret) {
					c.assertChild({
						forNode : node,
						withPath : "docs",
						onSuccess : function(res) {
							onSuccess(res.childNode);
						},
						onFailure : function(ex) {
							AJ.ui.notify(
									"Unexpected exception while loading applicatio node: "
											+ ex, "alert-error");
						}

					});
				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected exception while loading application node: "
									+ ex, "alert-error");
				}

			});

		};

		edit.appendNewDocNode = function(toNode, callback) {
			if (!toNode)
				throw "Cannot append to node <null>";

			var c = edit.client;
			AJ.ui.showStatus("Creating new node in user database.");

			AJ.common.appendDeep({
				client : c,
				toNode : toNode,
				secret : AJ.userNodeSecret,
				nodeFactory : function() {
					return "#";
				},
				onSuccess : function(node, secret) {
					AJ.ui.showStatus("Loading new node.");
					edit.loadNode(node, secret, callback);
				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected exception while creating new document:"
									+ ex, "alert-error");
				}
			});

		}

		edit.createNewNodeInUserData = function(callback) {
			AJ.ui
					.showStatus("Creating new node in user database: Loading document database.");

			edit.client.load({
				url : AJ.userNodeUri + "/apps/edit/docs",
				depth : 0,
				secret : AJ.userNodeSecret,
				onSuccess : function(res) {
					edit.appendNewDocNode(res.loadedNode, callback);
				},
				onUndefined : function(res) {

					edit.assertEditDocsNode(function(docsNode) {
						edit.appendNewDocNode(docsNode, callback);
					});
				},
				onFailure : function(ex) {
					alert("Unexpected failure: " + ex);
				}
			});
		};

		return {
			setClient : function(client) {
				edit.client = client;
			},
			load : function(client, address, secret, callback, forceReload) {
				if (client === null)
					throw "Client must not be <null>";
				edit.client = client;
				edit.loadNode(address, secret, callback, forceReload);
			},
			load : function(address, secret, callback, forceReload) {
				if (edit.client === null) {
					edit.client = aj.createClient();
				}
				edit.loadNode(address, secret, callback, forceReload);
			},
			commitLocal : function(callback) {
				edit.saveLocal(callback);
			},
			commitOrReload : function(callback) {
				edit.save(function(wasChanged) {
					if (wasChanged) {
						callback(true);
						return;
					}

					edit.loadNode(edit.loadedNode.url(), edit.nodeSecret,
							function(wasChanged) {
								callback(wasChanged);
							}, true);
				});
			},
			save : function(callback) {
				edit.save(callback);
			},
			reload : function(callback) {
				edit.loadNode(edit.loadedNode, edit.nodeSecret, callback);
			},
			createNewNode : function(callback) {
				edit.createNewNode(callback);
			},
			setEditorFactory : function(factory) {
				edit.newEditorFactory = factory;
			},
			setNodeChangeListener : function(listener) {
				edit.nodeChangeListener = listener;
			},
			setTextChangeListener : function(listener) {
				edit.textChangeListener = listener;
			},
			getLoadedNode : function() {
				return edit.loadedNode;
			},
			getSecret : function() {
				return edit.nodeSecret;
			},
			getClient : function() {
				return edit.client;
			},
			getValue : function() {
				return edit.editor.getValue();
			},
			getEditor : function() {
				return edit.editor;
			}
		};

	};
})(jQuery, AJ);





// -------
// aj view component js
(function($, AJ) {
	$.initAjView = function(params) {

		if (params.elem.length === 0) {
			throw "Selector for view component does not define any element.";
		}

		var elem = params.elem;
		var client = params.client;
		var renderers = params.renderers;
		var editHandler = params.editHandler;
		var viewHandler = params.viewHandler;
		var nodeChangeListener = params.nodeChangeListener;

		var activeMonitor = null;
		var currentNodeUrl = null;
		var currentNodeSecret = null;
		var cachedValue = null;
		var cachedChildrenList = null;

		var viewImpl = {};

		viewImpl.utils = {
			getChildText : function(childUrl, parentUrl) {
				if (childUrl.indexOf(parentUrl) === 0) {
					return childUrl.substring(parentUrl.length);
				}

				return childUrl;
			},
			renderChildrenList : function(forNode) {
				var children = client.selectAll({
					from : forNode
				});

				var result = "";

				var i;
				var parentUrl = forNode.url();
				for (i = 0; i < children.length; ++i) {
					var childUrl = children[i].url();
					result = result + "<li><a href='" + childUrl + "'>"
							+ viewImpl.utils.getChildText(childUrl, parentUrl)
							+ "</a></li>";
				}

				return result;
			},
			assertNoSlash: function(text) {
				if (text.length === 0) {
					return text;
				}
				
				if (text[text.length-1] === '/') {
					return text.substring(0, text.length-1);
				}
				
				return text;
			}

		};

		viewImpl.load = function(nodeUrl, nodeSecret, callback) {

			if (activeMonitor) {
				activeMonitor.stop({
					onSuccess : function(res) {
					}
				});
			}

			if (nodeUrl.valueOf().indexOf(AJ.userNodeUri) === 0) {
				nodeSecret = AJ.userNodeSecret;
			}

			chachedValue = null;

			client
					.load({
						url : nodeUrl,
						secret : nodeSecret,
						onSuccess : function(res) {
							AJ.odb
									.rendering()
									.render(
											{
												node : res.loadedNode,
												registry : renderers,
												client : client,
												onSuccess : function(html) {
													cachedValue = html;

													if (nodeChangeListener
															&& (!currentNodeUrl || !(currentNodeUrl
																	.valueOf() === nodeUrl
																	.valueOf()))) {
														nodeChangeListener(
																client,
																client
																		.reference(nodeUrl),
																nodeSecret);
													}

													currentNodeUrl = nodeUrl;
													currentNodeSecret = nodeSecret;

													$(".viewContent", elem)
															.html(html);

													var childrenList = viewImpl.utils
															.renderChildrenList(res.loadedNode);
													$(".childrenItems", elem)
															.html(childrenList);

													viewImpl.rewireLinks();

													// viewImpl.loadAhead(1);

													callback.onSuccess();
												},
												onFailure : function(ex, res) {

													callback.onFailure(ex, res);
												}
											});

						},
						onFailure : function(ex, res) {

							callback.onFailure(ex, res);
						}
					});

		};

		viewImpl.stopMonitor = function() {
			if (activeMonitor) {
				activeMonitor.stop({
					onSuccess : function(res) {
					}
				});
			}
		}

		viewImpl.monitorChanges = function(freqInMs) {

			if (activeMonitor) {
				activeMonitor.stop({
					onSuccess : function(res) {
					}
				});
			}

			if (cachedValue === null) {
				cachedValue = $(".viewContent", elem).html();
			}

			if (cachedChildrenList === null) {
				cachedChildrenList = $(".childrenItems", elem).html();
			}

			var currentNode = client.reference(currentNodeUrl);

			client
					.load({
						url : currentNodeUrl,
						secret : currentNodeSecret,
						onSuccess : function(res) {
							activeMonitor = client
									.monitor({
										node : currentNode,
										interval : 1000,
										onChange : function(ctx) {
											// generate html for node
											AJ.odb
													.rendering()
													.render(
															{
																node : res.loadedNode,
																registry : renderers,
																client : client,
																onSuccess : function(
																		html) {
																	if (!(html
																			.valueOf() == cachedValue
																			.valueOf())) {
																		cachedValue = html;
																		$(
																				".viewContent",
																				elem)
																				.html(
																						html);
																		viewImpl.rewireLinks();
																	}

																	var childrenList = viewImpl.utils
																			.renderChildrenList(res.loadedNode);
																	if (!(childrenList
																			.valueOf() == cachedChildrenList
																			.valueOf())) {
																		cachedChildrenList = childrenList;
																		
																		
																		
																		$(
																				".childrenItems",
																				elem)
																				.html(
																						childrenList);
																		viewImpl.rewireLinks();
																	}
																},
																onFailure : function(
																		ex) {
																	AJ.ui
																			.notify(
																					"Unexpected exception: "
																							+ ex,
																					"alert-error");
																}
															});

										}
									});
						}
					});

			return;

		};

		viewImpl.rewireLinks = function() {
			$("a", elem)
					.each(
							function(index, value) {
								if ($(this).attr('rewired')) {
									return;
								}
								
								$(this).attr('rewired', 'rewired');
								
								var link = $(this).attr('href');
	
								if (link.indexOf('.') === 0
										&& !(link.indexOf('..') === 0)) {
									link = viewImpl.utils.assertNoSlash(currentNodeUrl) + link.substring(1);
									$(this).attr('href', link);
								}

								if (link === "#") {
									return;
								}

								if (!AJ.utils.isAppjangleLink(link)) {
									return;
								}

								// define js function to handle click on link
								$(this)
										.click(
												function(evt) {
													evt.preventDefault();

													if (link
															.indexOf("http://appjangle.com/edit") === 0) {
														var details = AJ.utils
																.parseAppLink(link);

														editHandler(
																client,
																client
																		.reference(details.address),
																details.secret);

														return;
													}

													var viewCallback = {
														onSuccess : function() {
														},
														onFailure : function(ex) {
															AJ.ui
																	.notify(
																			"Exception while loading node: "
																					+ ex,
																			"alert-error");
														}
													};

													if (link
															.indexOf("http://appjangle.com/view") === 0) {
														var details = AJ.utils
																.parseAppLink(link);

														if (!viewHandler) {

															viewImpl
																	.load(
																			details.address,
																			details.secret,
																			viewCallback);
														} else {
															viewHandler(
																	client,
																	client.reference(details.address),
																	details.secret);
														}
														return;
													}

													if (!viewHandler) {
														viewImpl.load(link,
																null,
																viewCallback);
													} else {
														viewHandler(
																client,
																client.reference(link),
																null);
													}
													return;

												});

							});
		};

		viewImpl.loadAhead = function(steps) {

			if (!currentNodeUrl) {
				throw "Cannot load ahead if no node is loaded.";
			}
			client.load({
				url : currentNodeUrl,
				secret : currentNodeSecret,
				depth : steps,
				onSuccess : function() {

				},
				onFailure : function(ex) {
					AJ.ui.notify("Unexpected error: " + ex, "alert-error");
				}

			});
		};

		$(".toggleChildrenButton", elem)
				.click(
						function() {

							if ($(".toggleChildrenButton", elem).hasClass(
									"btn-info")) {
								$(".childrenList", elem).collapse('show');
								$(".toggleChildrenButton", elem).removeClass(
										"btn-info");
								$(".toggleChildrenButton", elem).addClass(
										"btn-warning");
								$(".toggleChildrenButton, elem")
										.html(
												"<i class='icon-minus icon-white'></i> Hide Children");

							} else {
								$(".childrenList", elem).collapse('hide');
								$(".toggleChildrenButton", elem).removeClass(
										"btn-warning");
								$(".toggleChildrenButton", elem).addClass(
										"btn-info");
								$(".toggleChildrenButton", elem)
										.html(
												"<i class='icon-plus icon-white'></i> Show Children");
							}
						});

		return {
			elem : elem,
			monitorChanges : function(freqInMs) {
				viewImpl.monitorChanges(freqInMs);
			},
			stopMonitor : function() {
				viewImpl.stopMonitor();
			},
			load : function(nodeUrl, nodeSecret, callback) {
				viewImpl.load(nodeUrl, nodeSecret, callback);
			},
			loadAhead : function(steps) {
				viewImpl.loadAhead(steps);
			},
			getCurrentNodeUrl : function() {
				return currentNodeUrl;
			},
			getSecret : function() {
				return currentNodeSecret;
			},
			setCurrentNodeUrl : function(url) {
				currentNodeUrl = url;
			},
			setCurrentNodeSecret: function(secret) {
				currentNodeSecret = secret;
			},
			rewireLinks : viewImpl.rewireLinks
		};

	};
})(jQuery, AJ);





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

			$(".insertLinkDialog-title", elem).val("");

			nld.dialog.show();
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





// node jump application module
(function($, AJ) {

	// nodejump application js
	$.initNodeJumpApp = function(params) {

		var nj = {};
		var elem = params.elem;
		var client = params.client;
		var nodeChangeHandler = params.nodeChangeHandler;

		nj.isChanged = false;

		// the last loaded/ edited value.
		nj.valueCache = null;

		// the reference to the currently open document
		nj.loadedNode = null;
		// access secret for current document
		nj.secret = null;
		// editor component
		nj.edit = null;
		// view component
		nj.view = null;
		// share component
		nj.share = null;

		nj.isAnonymous = false;

		nj.insertLinkDialog = null;
		// monitor for auto-refresh
		nj.monitor = null;
		// timer for auto-commit
		nj.committer = null;

		nj.initComponents = function() {

			var renderers = AJ.odb.rendering().createDefaultRendererRegistry();

			var converter = new Markdown.Converter();

			renderers.addRenderer(AJ.odb.rendering().createMarkdownRenderer(
					function(input) {
						return converter.makeHtml(input);
					}));

			nj.share = $.initAjShareDialog({
				elem : $('.shareDialog', elem),
				client : client,
				editLinkFactory : function(url, token) {
					return "http://nodejump.com/#" + url + "&" + token;
				},
				viewLinkFactory : function(url, token) {
					return "http://nodejump.com/#" + url + "&" + token
							+ "&feature=readOnly";
				}
			});

			nj.insertLinkDialog = $.initNewLinkDialog($('.insertLinkDialog',
					elem), client);

			nj.edit = $.initAjEdit({
				elem : $(".editorContent", elem),
				client : client,
				textChangeListener : function() {
					nj.view.load(nj.loadedNode.url(), nj.secret, {
						onSuccess : function() {
						},
						onFailure : function(ex) {
							Aj.ui.notify(
									"Unexpected exception while loading node: "
											+ ex, "alert-error");
						}
					});

				},
				nodeChangeListener : function() {
					
				},
				editorFactory : function() {
					$(".editorContent", elem).show(); // to assure codemirror
					// is
					// rendered
					// correctly.

					var editorElem = $(".textArea", elem).get(0);
					if (!editorElem) {
						throw "Editor element is not defined: " + elem
								+ ".textArea";
					}

					var editor = CodeMirror.fromTextArea(editorElem, {
						// mode: 'markdown',
						lineNumbers : true,
						matchBrackets : true,
						theme : "default",
						indentWithTabs : true,
						lineWrapping : true,
						onChange : function(editor, changeParams) {
							if (!$('.editStatus', elem).html() === "Loading") {
								$(".editStatus", elem).html("Unsaved");
							}
						}
					});

					return editor;
				}
			});

			nj.view = $.initAjView({
				elem : $(".viewComponent", elem),
				client : client,
				renderers : renderers,
				editHandler : function(client, node, secret) {

				},
				nodeChangeListener : function(client, node, secret) {
					
				},
				viewHandler : function(client, node, secret) {
					nj.load(node, secret, function() {

					});
				}
			});

			$(".insertLinkButton", elem).click(
					function(evt) {
						evt.preventDefault();

						var codemirror = nj.edit.getEditor();

						var title = null;

						var selection = codemirror.getSelection();

						var somethingSelected = selection
								&& selection.length > 0;

						if (somethingSelected ) {
							var safeSelection = selection;
							if (safeSelection.length > 45) {
								safeSelection = selection.substring(0, 44);
							}
							
							nj.priv.createAndInsertChildDocument(safeSelection,
									codemirror.getCursor(true), codemirror
											.getCursor(false));
							return;
						}

						var inWord = AJ.utils.inWord(codemirror
								.indexFromPos(codemirror.getCursor()),
								codemirror.getValue());

						if (inWord) {

							var exWord = AJ.utils.extractWord(codemirror
									.indexFromPos(codemirror.getCursor()),
									codemirror.getValue());

							nj.priv.createAndInsertChildDocument(exWord.word,
									codemirror.posFromIndex(exWord.startPos),
									codemirror.posFromIndex(exWord.endPos));

							return;
						}

						// if nothing is selected, ask user for document title.
						nj.insertLinkDialog.show({
							node : nj.loadedNode,
							secret : nj.secret,
							onLinkCreated : function(res) {
								var codemirror = nj.edit.getEditor();

								codemirror.replaceRange("[" + res.title + "](."
										+ res.relativeLink + ")", codemirror
										.getCursor());
							},
							onCancel : function() {

							}
						});

					});

			$('.shareButton', elem).click(function(evt) {
				evt.preventDefault();

				nj.share.show(nj.loadedNode);
			});

		};

		nj.initForAnonymous = function(onSuccess) {

			nj.isAnonymous = true;

			nj.priv.createAnonymousDocument(function(node, secret) {

				nj.load(node, secret, onSuccess);
			});

		};

		nj.initForUser = function(onSuccess) {
			nj.priv.createNewUserDocument(function(node, secret) {
				nj.load(node, secret, onSuccess);
			});
		};

		nj.load = function(node, secret, callback) {

			if (nj.loadedNode && !(node.url() === nj.loadedNode.url())) {
				$('.editStatus', elem).html("Loading");
				$('.viewStatus', elem).html("Loading");
				$('.shareComponent', elem).hide();
			}

			nj.loadedNode = node;
			if (secret) {
				nj.secret = secret;
			}

			if (!secret) {
				secret = AJ.userNodeSecret;
			}

			$(".currentUrl", elem).html(
					"<a style='color: #909090;' href='" + node.url() + "' >"
							+ node.url() + "</a>");

			client.load({
				node : node,
				secret : secret,
				onSuccess : function(res) {

					var required = {
						editLoaded : false,
						viewLoaded : false
					};

					nj.edit.load(node.url(), secret, function() {
						nj.valueCache = nj.edit.getValue().valueOf();

						if (nodeChangeHandler) {
							var safeSecret = secret;
							if (!safeSecret) {
								safeSecret = nj.secret;
							}
							if (!safeSecret) {
								safeSecret = AJ.userNodeSecret;
							}
							nodeChangeHandler(nj, node, safeSecret);
						}
						required.editLoaded = true;
						if (required.editLoaded && required.viewLoaded) {
							callback();
						}
					});

					nj.view.load(nj.loadedNode.url(), secret, {
						onSuccess : function() {
							$('.viewStatus', elem).html("Viewing");
							$('.shareComponent', elem).fadeIn('fast');
							required.viewLoaded = true;
							if (required.editLoaded && required.viewLoaded) {
								callback();
							}
						},
						onFailure : function() {
						}
					});

				}
			});

		};

		/**
		 * Interpret hash code
		 */
		nj.readHash = function(hash, callback) {
			if (!hash || hash === null || hash === "" || hash === "#") {
				callback(false);
				return;
			}

			var link = AJ.utils.parseAppLink(hash);

			if (!link.address) {
				callback(false);
				return;
			}

			if (link.secret === null) {
				link.secret = AJ.userNodeSecret;
			}

			if (!AJ.userNodeUri) {
				nj.isAnonymous = true;
			}

			nj.load(client.reference(link.address), link.secret, function() {
				callback(true);
			});
		};

		nj.commitLocal = function(callback) {
			if (nj.loadedNode) {
				nj.edit.commitLocal(callback);
			}
		};

		nj.commitOrLoadRemote = function(callback) {
			if (nj.loadedNode) {
				$(".editStatus", elem).html("Synchronizing");
				nj.edit.commitOrReload(function(wasChanged) {

					$(".editStatus", elem).html("Saved");
				});
			}
		};

		nj.startAutoCommit = function() {
			if (nj.committer) {
				return;
			}

			nj.committer = setInterval(function() {
				nj.commitLocal(function() {

				});
			}, 900);
		};

		nj.stopAutoCommit = function() {
			clearInterval(nj.committer);
			nj.committer = null;

			nj.commitLocal(function() {

			});
		};

		nj.startAutoRefresh = function() {
			if (nj.monitor) {
				return;
			}
			nj.monitor = setInterval(function() {
				nj.commitOrLoadRemote(function() {

				});
			}, 2000);
			nj.commitOrLoadRemote(function() {

			});

		};

		nj.stopAutoRefresh = function() {
			nj.commitOrLoadRemote(function() {

			});
			clearInterval(nj.monitor);
			nj.monitor = null;
		};

		nj.isAnonymousUser = function() {
			return nj.isAnonymous;
		};

		nj.priv = {};

		nj.priv.createAndInsertChildDocument = function(title, replaceStart,
				replaceEnd) {

			var savetitle = AJ.utils.getSimpleText(title);
			AJ.common.createMarkdownChildDocument({
				client : client,
				node : nj.loadedNode,
				secret : nj.secret,
				documentTitle : savetitle,
				onSuccess : function(node, secret) {

					var codemirror = nj.edit.getEditor();

					var absoluteLink = node.url();

					var relativeLink = absoluteLink.substring(absoluteLink
							.lastIndexOf('/'));

					codemirror.replaceRange("[" + title + "](." + relativeLink
							+ ")", replaceStart, replaceEnd);

				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected error while creating child document: "
									+ ex, "alert-error");
				}

			});
		};

		nj.priv.createAnonymousDocument = function(onSuccess) {
			client.seed({
				onSuccess : function(res) {

					var rootNode = client.append({
						node : "# Documents\n\n",
						to : res.root,
						atAddress : "./nj"
					});

					AJ.common.configureMarkdownNode(client, rootNode);

					var newToken = client.newPublicReadToken();

					client.append({
						node : newToken,
						to : rootNode
					});

					onSuccess(rootNode, res.secret);

				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected error while creating anonymous document: "
									+ ex, "alert-error");
				}
			});
		};

		nj.priv.createNewUserDocument = function(onSuccess) {
			nj.priv
					.assertDocDbNode(function(docNode, secret) {
						AJ.common
								.appendDeep({
									client : client,
									toNode : docNode,
									secret : AJ.userNodeSecret,
									nodeFactory : function() {
										return "# Documents\n\n";
									},
									onSuccess : function(node, secret) {
										onSuccess(node, secret);
									},
									onFailure : function(ex) {
										AJ.ui
												.notify("Unexpected exception while creating new document: "
														+ ex);
									}
								});
					});

		};

		nj.priv.assertDocDbNode = function(onSuccess) {

			client.load({
				url : AJ.userNodeUri + "/apps/nodejump/docs",
				secret : AJ.userNodeSecret,
				onSuccess : function(res) {
					onSuccess(res.loadedNode, AJ.userNodeSecret);
				},
				onUndefined : function(res) {
					nj.priv.assertAppData(function(node, secret) {
						client.assertChild({
							forNode : node,
							withPath : "docs",
							onSuccess : function(res) {
								onSuccess(res.childNode, secret);
							},
							onFailure : function(ex) {
								AJ.ui.notify(
										"Unexpected exception while creating document database: "
												+ ex, "alert-error");
							}

						});
					});
				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected exception while accessing document database: "
									+ ex, "alert-error");
				}
			});

		};

		nj.priv.assertAppData = function(onSuccess) {

			AJ.common.assertApplicationNode({
				client : client,
				applicationName : "nodejump",
				onSuccess : function(node, secret) {
					onSuccess(node, secret);

				},
				onFailure : function(ex) {
					AJ.ui.notify(
							"Unexpected exception while creating application node: "
									+ ex, "alert-error");
				}
			});

		};

		return {
			load : nj.load,
			initComponents : nj.initComponents,
			initForAnonymous : nj.initForAnonymous,
			initForUser : nj.initForUser,
			readHash : nj.readHash,
			startAutoCommit : nj.startAutoCommit,
			stopAutoCommit : nj.stopAutoCommit,
			startAutoRefresh : nj.startAutoRefresh,
			stopAutoRefresh : nj.stopAutoRefresh,
			isAnonymousUser : nj.isAnonymousUser

		};
	};

})(jQuery, AJ);





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

//<!-- one.end -->
