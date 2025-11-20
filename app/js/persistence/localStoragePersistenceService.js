/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


export class LocalStoragePersistenceService {
    constructor({key}) {
        this.key = key
    }

    save(objectToSave) {
        const str = JSON.stringify(objectToSave)

        try {
            localStorage.setItem(this.key, str)
        } catch(e) {
            if (e.name === "QuotaExceededError") {
                throw Error("Not enough storage space on local workspace for uploaded file.")
            } else {
                throw e
            }

        }
    }

    load() {
        const str = localStorage.getItem(this.key)
        return JSON.parse(str)
    }
}