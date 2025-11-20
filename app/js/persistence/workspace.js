/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { readFileAsBase64, sleep } from "../utils.js"

export class Workspace {

    constructor(persistanceService) {
        this.persistanceService = persistanceService
        this.userWorkspace = {
            projects: [
                {
                    name: "default project",
                    layers: []
                }
            ]
        }
        this.initialised = false
        this.init()
    }

    async init() {
        await this.loadWorkspace()
        this.initialised = true
    }

    async addLayerFromFileUpload({file, name}) {
        const fileContent = await readFileAsBase64(file)
        const newLayer = {
            id: crypto.randomUUID(),
            name: name,
            datasource: "localfile",
            filetype: file.type,
            filedata: fileContent,
            ui: {
                opacity: 1,
                visible: true
            }
        }

        this.userWorkspace.projects[0].layers.unshift(newLayer)
        await this.saveWorkspace()
        return newLayer
    }

    async deleteLayer(layer) {
        this.userWorkspace.projects[0].layers = this.userWorkspace.projects[0].layers.filter(l => l.id !== layer.id)
        await this.saveWorkspace()
    }

    async getWorkspace() {
        await this.waitForConfigToBeLoaded()
        return this.userWorkspace
    }

    async waitForConfigToBeLoaded() {
        while(!this.initialised) {
            await sleep(1) //keep processing events
        }
    }

    async saveWorkspace() {
        await this.persistanceService.save(this.userWorkspace)
    }
    
    async loadWorkspace() {
        const savedWorkspace = await this.persistanceService.load()
        if (savedWorkspace) {
            this.userWorkspace = savedWorkspace
        }
    }

}