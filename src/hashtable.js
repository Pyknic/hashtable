/* 
 * HashTable implementation that supports complex objects using JSON 
 * serialization and both session and offline persistance by using the
 * sessionStorage and localStorage functionality.
 * 
 * Copyright (c) Emil Forslund, 2017
 */
{
    /**
     * Parses the specified integer with long precision into a 16 digit 
     * hexadecimal string padded with zeroes if nescessary.
     * 
     * @param {number} long  the integer to parse
     * @returns {String}     the hexadecial string
     */
    function toHex(long) {
        return ("000000000000000" + long.toString(16)).substr(-16);
    }
    
    /**
     * Parses the specified hex value (potentially padded with zeroes) and
     * returns the number it represents in decimal.
     * 
     * @param {String} hex  the hex value
     * @returns {number}    the decimal value
     */
    function fromHex(hex) {
        return parseInt(hex, 16);
    }
    
    /**
     * Abstract base class for maps that use a Storage object to keep a table
     * of objects organized by hash.
     * <p>
     * Warning! This implementation is abstract! It should not be implemented
     * directly but be extended by an implementing class!
     * 
     * @template T
     */
    class HashTable {
        
        /**
         * Creates a new MemberTable from an array of materialized members.
         * <p>
         * Warning! MemberTable is abstract! This constructor should only be
         * called from an implementing class!
         * 
         * @param {Storage} storage             storage object to use
         * @param {String} namespace            name to store values under
         * @param {function(T)} hasher          takes a value returning the key
         * @param {Array.<T>|undefined} values  initial array of values
         * 
         * @returns {HashTable.<T>}  the created instance
         */
        constructor(storage, namespace, hasher, values) {
            this.storage    = storage;
            this.namespace  = namespace;
            this.identifier = hasher;
            
            this.storage.setItem(namespace, '');
            if (typeof(values) !== 'undefined' && values.length !== 0) {
                this.putAll(values);
            }
        }
        
        /**
         * Returns an array of all the keys in the table.
         * 
         * @returns {Array.<number>}  all keys
         */
        keys() {
            let ids  = this.storage.getItem(this.namespace).split(',');
            let keys = [];
            
            for (let id of ids) {
                keys.push(fromHex(id));
            }
            
            return keys;
        }
        
        /**
         * Returns an array of all the values in the table.
         * 
         * @returns {Array.<T>}  the values in the table
         */
        values() {
            let ids    = this.storage.getItem(this.namespace).split(',');
            let values = [];

            for (let id of ids) {
                values.push(JSON.parse(
                    this.storage.getItem(this.namespace + '_' + id)
                ));
            }
            
            return values;
        }
        
        /**
         * Stores the specified value object locally. If a value was already 
         * stored on that key, it will be overwritten. It is therefore wise 
         * to first check for existance using the has(key)-function.
         * 
         * @param {T} value         the value to store
         * @return {HashTable.<T>}  this instance
         */
        put(value) {
            let hexId = toHex(this.identifier(value));
            let ids   = this.storage.getItem(this.namespace);
            
            // If the id is not in the list, we need to add it.
            if (ids.indexOf(hexId) === -1) {
                if (ids.length === 0) {
                    this.storage.setItem(this.namespace, hexId);
                } else {
                    this.storage.setItem(this.namespace, ids + ',' + hexId);
                }
            }
            
            // Now we need to store the actual member.
            this.storage.setItem(
                this.namespace + '_' + hexId, 
                JSON.stringify(value)
            );
            
            return this;
        }
        
        /**
         * Stores all the values specified, potentially more efficiently than
         * calling put() several times. If any key already existed, it will
         * be overwritten. It is therefore wise to first check existance using
         * the has(key)-function.
         * 
         * @param {Array.<T>} values  array of members to add
         * @returns {HashTable.<T>}   this instance
         */
        putAll(values) {
            let ids = this.storage.getItem(this.namespace).split(',');
            
            for (let value of values) {
                let hexId = toHex(this.identifier(value));
                ids.push(hexId);
                this.storage.setItem(
                    this.namespace + '_' + hexId, 
                    JSON.stringify(value)
                );
            }
            
            this.storage.setItem(this.namespace, ids.join());
            return this;
        }
        
        /**
         * Deletes the value stored under the specified key. If the key did
         * not exist, this method has no effect.
         * 
         * @param {number} key       the key of the value to delete
         * @returns {HashTable.<T>}  this instance
         */
        delete(key) {
            let hexId = toHex(key);
            let name  = this.namespace + '_' + hexId;
            
            if (this.storage.getItem(name) !== undefined) {
                this.storage.removeItem(name);
                
                let ids = this.storage.getItem(this.namespace);
                let idx = ids.indexOf(hexId);
                
                if (idx !== -1) {
                    let prefix = ids.substring(idx - 1, 1) === ',' ? 1 : 0;
                    let suffix = ids.substring(idx + hexId.length, 1) === ',' ? 1 : 0;
                    let separator = (prefix + suffix === 2) ? ',' : '';
                    
                    ids = ids.substring(0, idx - prefix) + separator +
                          ids.substring(idx + hexId.length + suffix);
                  
                    this.storage.setItem(this.namespace, ids);
                } else {
                    console.debug(
                        `Deleted member ${name} but could not find it in list.`
                    );
                }
            }
            
            return this;
        }

        /**
         * Returns the value with the specified key stored locally, or if it
         * doesn't exist, throws an exception.
         * 
         * @param {number} key  the key of the value to look for
         * @returns {T}         the value with that key
         */
        get(key) {
            var json = this.storage.getItem(this.namespace + '_' + toHex(key));

            if (typeof(json) === 'undefined' || json === null) {
                throw `Could not find any member with id '${key}'.`;
            }

            return JSON.parse(json);
        }

        /**
         * Returns true if the specified key exists, else false.
         * 
         * @param {number} key  the key to look for
         * @returns {boolean}   true if it exists, else false
         */
        has(key) {
            var json = this.storage.getItem(this.namespace + '_' + toHex(key));
            return typeof(json) !== 'undefined';
        }
    }
    
    /**
     * Implementation of HashTable that stores values in the session storage.
     * 
     * @template T
     */
    class SessionHashTable extends HashTable {

        /**
         * Creates a new HashTable from an array of values and a function that
         * given a value returns the key to use.
         * 
         * @param {string} namespace            namespace to store under
         * @param {function(T)} hasher          given a value returns the key
         * @param {Array.<T>|undefined} values  the initial array of values
         * @returns {SessionHashTable<T>}       the created instance
         */
        constructor(namespace, hasher, values) {
            super(sessionStorage, namespace, hasher, values);
        }
    }
    
    /**
     * Implementation of HashTable that stores values in the local storage.
     * 
     * @template T
     */
    class LocalHashTable extends HashTable {

        /**
         * Creates a new HashTable from an array of values and a function that
         * given a value returns the key to use.
         * 
         * @param {string} namespace            namespace to store under
         * @param {function(T)} hasher          given a value returns the key
         * @param {Array.<T>|undefined} values  the initial array of values
         * @returns {LocalHashTable<T>}         the created instance
         */
        constructor(namespace, hasher, values) {
            super(localStorage, namespace, hasher, values);
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //                         Expose in public API                           //
    ////////////////////////////////////////////////////////////////////////////
    
    window.SessionHashTable = SessionHashTable;
    window.LocalHashTable   = LocalHashTable;
}