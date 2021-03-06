// Importers should always start with this
var PassmanImporter = PassmanImporter || {};
(function(window, $, PassmanImporter) {
	'use strict';
	PassmanImporter.clippers = {
		info: {
			name: 'Clipperz.is',
			id: 'clippers',
			description: 'Go to menu -> Export -> Download HTML + JSON. Fields will be imported as custom fields.'
		}
	};

	PassmanImporter.clippers.readFile = function (file_data) {
		return new C_Promise(function() {
			var credential_list = [];
			var re = /<textarea>(.*?)<\/textarea>/gi;
			var matches = re.exec(file_data);
			if(matches){
				var raw_json = matches[0].substring(10);
				raw_json = PassmanImporter.htmlDecode(raw_json.slice(0, -11));
				var json_objects = PassmanImporter.readJson(raw_json);
				for(var i = 0; i < json_objects.length; i++){
					var card = json_objects[i];
					re = /(\w+)/gi;
					var tags = card.label.match(re);
					card.label = card.label.replace(tags.join(' '), '').trim();
					tags = tags.map(function(item){ return {text: item.replace('', '') }});


					var _credential = PassmanImporter.newCredential();
					_credential.label = card.label;
					_credential.description = card.data.notes;
					_credential.tags = tags;
					for(var field in card.currentVersion.fields){
						var field_data = card.currentVersion.fields[field];
						_credential.custom_fields.push(
							{
								'label': field_data.label,
								'value': field_data.value,
								'secret': (field_data.hidden == true)
							}
						)
					}
					if(_credential.label){
						credential_list.push(_credential);
					}
					var progress = {
						percent: i/json_objects.length*100,
						loaded: i,
						total: json_objects.length
					};
					this.call_progress(progress);
				}
			}
			this.call_then(credential_list);
		});
	};
})(window, $, PassmanImporter);
