<?php
/**
 * Nextcloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Sander Brand <brantje@gmail.com>
 * @copyright Sander Brand 2016
 */
namespace OCA\Passman\Db;

use OCA\Passman\Utility\Utils;
use OCP\IDBConnection;
use OCP\AppFramework\Db\Mapper;

class CredentialMapper extends Mapper {
	private $utils;
	public function __construct(IDBConnection $db, Utils $utils) {
		parent::__construct($db, 'passman_credentials');
		$this->utils = $utils;
	}


	/**
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
	 */
	public function getCredentialsByVaultId($vault_id, $user_id) {
		$sql = 'SELECT * FROM `*PREFIX*passman_credentials` ' .
			'WHERE `user_id` = ? and vault_id = ?';
		return $this->findEntities($sql, [$user_id, $vault_id]);
	}

	/**
	 * @param $vault_id
	 * @param $user_id
	 * @return Credential[]
	 */
	public function getRandomCredentialByVaultId($vault_id, $user_id) {
		$sql = 'SELECT * FROM `*PREFIX*passman_credentials` ' .
			'WHERE `user_id` = ? and vault_id = ? AND shared_key is NULL LIMIT 20';
		$entities = $this->findEntities($sql, [$user_id, $vault_id]);
		$count = count($entities)-1;
		$entities = array_splice($entities, rand(0, $count), 1);
		return $entities;
	}

	/**
	 * @param $timestamp
	 * @return Credential[]
	 */
	public function getExpiredCredentials($timestamp){
		$sql = 'SELECT * FROM `*PREFIX*passman_credentials` ' .
			'WHERE `expire_time` > 0 AND `expire_time` < ?';
		return $this->findEntities($sql, [$timestamp]);
	}

    /**
     * @param $credential_id
     * @param null $user_id
     * @return Credential
     */
	public function getCredentialById($credential_id, $user_id = null){
		$sql = 'SELECT * FROM `*PREFIX*passman_credentials` ' .
			'WHERE `id` = ?';
        // If we want to check the owner, add it to the query
		$params = [$credential_id];
        if ($user_id !== null){
        	$sql .= ' and `user_id` = ? ';
			array_push($params, $user_id);
		}
		return $this->findEntity($sql,$params);
	}

	/**
	 * @param $credential_id
	 * @return Credential
	 */
	public function getCredentialLabelById($credential_id){
		$sql = 'SELECT id, label FROM `*PREFIX*passman_credentials` ' .
			'WHERE `id` = ? ';
		return $this->findEntity($sql,[$credential_id]);
	}

	/**
	 * @param $raw_credential
	 * @return Credential
	 */
	public function create($raw_credential){
		$credential = new Credential();

		$credential->setGuid($this->utils->GUID());
		$credential->setVaultId($raw_credential['vault_id']);
		$credential->setUserId($raw_credential['user_id']);
		$credential->setLabel($raw_credential['label']);
		$credential->setDescription($raw_credential['description']);
		$credential->setCreated($this->utils->getTime());
		$credential->setChanged($this->utils->getTime());
		$credential->setTags($raw_credential['tags']);
		$credential->setEmail($raw_credential['email']);
		$credential->setUsername($raw_credential['username']);
		$credential->setPassword($raw_credential['password']);
		$credential->setUrl($raw_credential['url']);
		$credential->setFavicon($raw_credential['favicon']);
		$credential->setRenewInterval($raw_credential['renew_interval']);
		$credential->setExpireTime($raw_credential['expire_time']);
		$credential->setDeleteTime($raw_credential['delete_time']);
		$credential->setFiles($raw_credential['files']);
		$credential->setCustomFields($raw_credential['custom_fields']);
		$credential->setOtp($raw_credential['otp']);
		$credential->setHidden($raw_credential['hidden']);
		$credential->setSharedKey($raw_credential['shared_key']);
		return parent::insert($credential);
	}

	/**
	 * @param $raw_credential array An array containing all the credential fields
	 * @return Credential The updated credential
	 */
	public function updateCredential($raw_credential){
		$original = $this->getCredentialByGUID($raw_credential['guid']);
		$credential = new Credential();
		$credential->setId($original->getId());
		$credential->setGuid($original->getGuid());
		$credential->setVaultId($original->getVaultId());
		$credential->setUserId($original->getUserId());
		$credential->setLabel($raw_credential['label']);
		$credential->setDescription($raw_credential['description']);
		$credential->setCreated($original->getCreated());
		$credential->setChanged($this->utils->getTime());
		$credential->setTags($raw_credential['tags']);
		$credential->setEmail($raw_credential['email']);
		$credential->setUsername($raw_credential['username']);
		$credential->setPassword($raw_credential['password']);
		$credential->setUrl($raw_credential['url']);
		$credential->setFavicon($raw_credential['favicon']);
		$credential->setRenewInterval($raw_credential['renew_interval']);
		$credential->setExpireTime($raw_credential['expire_time']);
		$credential->setFiles($raw_credential['files']);
		$credential->setCustomFields($raw_credential['custom_fields']);
		$credential->setOtp($raw_credential['otp']);
		$credential->setHidden($raw_credential['hidden']);
		$credential->setDeleteTime($raw_credential['delete_time']);
		$credential->setSharedKey($raw_credential['shared_key']);
		return parent::update($credential);
	}

	public function deleteCredential(Credential $credential){
		return $this->delete($credential);
	}

	public function upd(Credential $credential){
		$this->update($credential);
	}

    /**
     * Finds a credential by the given guid
     * @param $credential_guid
     * @return Credential
     */
	public function getCredentialByGUID($credential_guid, $user_id = null){
	    $q = 'SELECT * FROM `*PREFIX*passman_credentials` WHERE guid = ? ';
		$params = [$credential_guid];
		if ($user_id !== null){
			$q .= ' and `user_id` = ? ';
			array_push($params, $user_id);
		}
        return $this->findEntity($q, $params);
    }
}