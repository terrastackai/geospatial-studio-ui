/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


export class IndexedDbPersistenceService {
    constructor({key}) {
        this.key = key
        this.storeName = "workspace"
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {

            const request = window.indexedDB.open(this.key, 1);
            request.onerror = (event) => {
                reject(event)
              };
              request.onsuccess = (event) => {
                this.db = event.target.result
                resolve()
              };
              request.onupgradeneeded = (event) => {
                this.db = event.target.result
                const createStoreRequest = this.db.createObjectStore(this.storeName, { autoIncrement: true });
                
                createStoreRequest.onsuccess = (event) => {
                    resolve()
                }
              }

        })
    }

    async save(objectToSave) {
        return new Promise(async (resolve, reject) => {
            const str = JSON.stringify(objectToSave)
            await this.initDatabase()
    
            const transaction = this.db.transaction([this.storeName], "readwrite")
            const request = transaction.objectStore(this.storeName).put(str,"workspace")
            
            request.onsuccess = (event) => {
                console.log("saved")
                resolve()
            };
            
            request.onerror = (event) => {
                console.error("error saving", event)
                reject(event)
            };
        })
    }

    async load() {
        await this.initDatabase()

        return new Promise((resolve, reject) => {
            const request = this.db.transaction(this.storeName).objectStore(this.storeName).get("workspace")
            request.onerror = (event) => {
                reject(event)
            }

            request.onsuccess = (event) => {
                if (event.target.result) {
                    resolve(JSON.parse(event.target.result))
                } else {
                    resolve()
                }
                
            }

        })
        
    }
}