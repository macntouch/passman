// Importers should always start with this
var PassmanImporter = PassmanImporter || {};
(function(window, $, PassmanImporter) {
	'use strict';
	// Define the importer

// Define the importer
	PassmanImporter.randomData = {
		info: {
			name: 'Random data',
			id: 'randomData',
			description: 'Create\'s 50 random credentials for testing purposes.'
		}
	};

	PassmanImporter.randomData.readFile = function () {
		return new C_Promise(function () {
			var tags =
				['Social media',
					'Hosting',
					'Forums',
					'Webshops',
					'FTP',
					'SSH',
					'Banking',
					'Applications',
					'Server stuff',
					'mysql',
					'Wifi',
					'Games',
					'Certificate',
					'Serials'
				];
			var label;
			var credential_list = [];
			var _this = this;
			var generateCredential = function (max, i, callback) {
				if (jQuery) {
					var url = OC.generateUrl('apps/passman/api/internal/generate_person');
					$.ajax({
						url: url,
						dataType: 'json',
						success: function (data) {
							if(data) {
								var _credential = PassmanImporter.newCredential();
								label = (Math.random() >= 0.5) ? data.domain : data.email_d + ' - ' + data.email_u;
								_credential.label = label;
								_credential.username = data.username;
								_credential.password = data.password;
								_credential.url = data.url;

								var tag_amount = Math.floor(Math.random() * 5);
								var ta = 0;
								var _tags = [];
								while (ta < tag_amount) {
									var item = tags[Math.floor(Math.random() * tags.length)];
									if (_tags.indexOf(item) === -1) {
										_tags.push(item);
										ta++
									}
								}
								_credential.tags = _tags.map(function (item) {
									if (item) {
										return {text: item}
									}

								}).filter(function (item) {
									return (item);
								});
								credential_list.push(_credential);

								if (i < max) {
									var progress = {
										percent: i / max * 100,
										loaded: i,
										total: max
									};
									_this.call_progress(progress);
									generateCredential(max, i + 1, callback)
								} else {
									callback(credential_list)
								}
							} else {
								generateCredential(max, i , callback)
							}
						}
					});
				}
			};


			generateCredential(50, 1, function (credential_list) {
				_this.call_then(credential_list);
			});
		});
	};
})(window, $, PassmanImporter);