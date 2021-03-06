// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/ajMicroSync/docs/nodejump-app-0.0.1 -->

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

			nj.edit = $.initAjEdit($(".editorContent", elem), client);

			nj.edit.setEditorFactory(function() {
				$(".editorContent", elem).show(); // to assure codemirror is
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

			nj.edit.setTextChangeListener(function() {
				nj.view.load(nj.loadedNode.url(), nj.secret, {
					onSuccess : function() {
					},
					onFailure : function(ex) {
						Aj.ui.notify(
								"Unexpected exception while loading node: "
										+ ex, "alert-error");
					}
				});

			});

			$(".insertLinkButton", elem).click(
					function(evt) {
						evt.preventDefault();

						var codemirror = nj.edit.getEditor();

						var title = null;

						var selection = codemirror.getSelection();

						var somethingSelected = selection
								&& selection.length > 0;

						if (somethingSelected && selection.length < 20) {
							nj.priv.createAndInsertChildDocument(codemirror
									.getSelection(),
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

// <!-- one.end -->
