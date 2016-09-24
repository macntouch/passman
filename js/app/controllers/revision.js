'use strict';

/**
 * @ngdoc function
 * @name passmanApp.controller:RevisionCtrl
 * @description
 * # RevisionCtrl
 * Controller of the passmanApp
 */
angular.module('passmanApp')
	.controller('RevisionCtrl', ['$scope', 'SettingsService', 'VaultService', 'CredentialService', '$location', '$routeParams', '$rootScope', 'NotificationService', '$filter',
		function ($scope, SettingsService, VaultService, CredentialService, $location, $routeParams, $rootScope, NotificationService, $filter) {

			if (!SettingsService.getSetting('defaultVault') || !SettingsService.getSetting('defaultVaultPass')) {
				if (!$scope.active_vault) {
					$location.path('/')
				}
			} else {
				if (SettingsService.getSetting('defaultVault') && SettingsService.getSetting('defaultVaultPass')) {
					var _vault = angular.copy(SettingsService.getSetting('defaultVault'));
					_vault.vaultKey = angular.copy(SettingsService.getSetting('defaultVaultPass'));
					VaultService.setActiveVault(_vault);
					$scope.active_vault = _vault;

				}
			}
			if ($scope.active_vault) {
				$scope.$parent.selectedVault = true;
			}
			var storedCredential = SettingsService.getSetting('revision_credential');

			var getRevisions = function () {
				CredentialService.getRevisions($scope.storedCredential.credential_id).then(function (revisions) {
					$scope.revisions = revisions;
				})
			};

			if (!storedCredential) {
				CredentialService.getCredential($routeParams.credential_id).then(function (result) {
					$scope.storedCredential = CredentialService.decryptCredential(angular.copy(result));
					getRevisions();
				});
			} else {
				$scope.storedCredential = CredentialService.decryptCredential(angular.copy(storedCredential));
				getRevisions();
			}

			$scope.selectRevision = function (revision) {
				$scope.selectedRevision = angular.copy(revision);
				$scope.selectedRevision.credential_data = CredentialService.decryptCredential(angular.copy(revision.credential_data));
				$rootScope.$emit('app_menu', true);
			};

			$scope.closeSelected = function () {
				$rootScope.$emit('app_menu', false);
				$scope.selectedRevision = false;
			};

			$scope.deleteRevision = function (revision) {
				CredentialService.deleteRevision($scope.storedCredential.credential_id, revision.revision_id).then(function () {
					for (var i = 0; i < $scope.revisions.length; i++) {
						if ($scope.revisions[i].revision_id == revision.revision_id) {
							$scope.revisions.splice(i, 1);
							NotificationService.showNotification('Revision deleted', 5000);
							break;
						}
					}
				});
			};

			$scope.restoreRevision = function (revision) {
				var _revision = angular.copy(revision);
				var _credential = _revision.credential_data;
				_credential.revision_created =  $filter('date')(_revision.created * 1000 , "dd-MM-yyyy @ HH:mm:ss");
				CredentialService.updateCredential(_credential).then(function (result) {
					SettingsService.setSetting('revision_credential', null);
					$rootScope.$emit('app_menu', false);
					$location.path('/vault/' + $routeParams.vault_id);
					NotificationService.showNotification('Revision restored!', 5000)
				})
			};

			$scope.cancel = function () {
				$location.path('/vault/' + $routeParams.vault_id);
				$scope.storedCredential = null;
				SettingsService.setSetting('revision_credential', null);
			}

		}]);
