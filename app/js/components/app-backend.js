/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import {
  FINISHED_TUNE,
  FAILED_TUNE,
  SUBMITTED_TUNE,
  RUNNING_TUNE,
  DEPLOYED_TUNE,
  PENDING_TUNE,
  DELETED_TUNE,
  decodeBase64,
} from "../utils.js";

window.customElements.define(
  "app-backend",
  class extends asWebComponent(HTMLElement) {
    async doSetup() {
      this.regex =
        /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))/g;
    }

    getHeaders() {
      const headers = {
        "content-type": "application/json",
        auth: "needed",
      };

      return headers;
    }

    render() {}

    mustBeLoggedIn() {
      if (!localStorage.getItem("access_token")) {
        throw new Error("Please Login");
      }
    }

    isLoggedIn() {
      return localStorage.getItem("access_token") ? true : false;
    }

    //=== Inference Endpoints ===//

    async getInferencesV2(
      limit = 25,
      skip = 0,
      createdBy = null,
      saved = false,
      model_id = null,
      tune_id = null
    ) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/inference?limit=${limit}&skip=${skip}` +
            (saved ? `&saved=${saved}` : "") +
            (createdBy != null ? `&created_by=${createdBy}` : "") +
            (model_id ? `&model_id=${model_id}` : "") +
            (tune_id ? `&tune_id=${tune_id}` : ""),
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getInferenceV2(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/inference/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async submitInferenceV2(payload) {
      let res;
      let method = "POST";

      app.progress.show();

      try {
        res = await fetch("/studio-gateway/v2/inference", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async deleteInferenceV2(id) {
      let res;
      let method = "DELETE";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/inference/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async tryoutInferenceV2(payload) {
      let res;
      let method = "POST";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/tunes/${payload.fine_tuning_id}/try-out`,
          {
            headers: this.getHeaders(),
            method: method,
            body: JSON.stringify(payload),
          }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async checkDataAvailability(req) {
      let res;
      let method = "POST";
      let data_connector = req.data_connector;
      delete req.data_connector;

      try {
        app.progress.show();

        res = await fetch(`/studio-gateway/v2/data-advice/${data_connector}`, {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(req),
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getTaskStepLogs(task_id, step_id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/tasks/${task_id}/logs/${step_id}`,
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getModelsV2(
      limit = 25,
      skip = 0,
      filter_sandbox = true,
      internal_name = null
    ) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/models?limit=${limit}&skip=${skip}${
            internal_name ? `&internal_name=${internal_name}` : ""
          }`,
          { headers: this.getHeaders(), method: method }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();

      if (filter_sandbox) {
        json.results = json.results.filter(
          (model) => !model["display_name"].includes("sandbox")
        );
        return json;
      } else {
        return json;
      }
    }

    async getModelV2(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/models/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async deleteModel(model_id) {
      let res;
      let method = "DELETE";

      app.progress.show();
      try {
        res = await fetch(`/studio-gateway/v2/models/${model_id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      try {
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        if (res.status === 204) {
          return { success: true };
        }

        let json = await res.json();
        return json;
      } catch (e) {
        throw e;
      }
    }

    async getDataSourcesV2(limit = 25, skip = 0, collection, connector) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/data-sources?limit=${limit}&skip=${skip}${
            collection ? "&collection=" + collection : ""
          }${connector ? "&connector=" + connector : ""}`,
          { headers: this.getHeaders(), method: method }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getDataSourceV2(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/data-sources/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getNotificationsV2(event_id, limit = 25, skip = 0) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/notifications/${event_id}?limit=${limit}&skip=${skip}`,
          { headers: this.getHeaders(), method: method }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async generatePresignedLink(objectName) {
      let res;
      let method = "GET";

      try {
        app.progress.show();
        res = await fetch(
          "/studio-gateway/v2/file-share?object_name=" + objectName,
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async uploadFile(uploadLink, file) {
      let res;
      let method = "PUT";

      try {
        app.progress.show();

        res = await fetch(uploadLink, {
          body: file,
          method: method,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      return res.status;
    }

    //=== Dataset Endpoints ===//

    async getDatasetsV2(
      limit = 10,
      skip = 0,
      dataset_name = null,
      purpose = null,
      status = null
    ) {
      let res;

      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(
          `/studio-gateway/v2/datasets?limit=${limit}&skip=${skip}${
            dataset_name != null ? "&dataset_name=" + dataset_name : ""
          }${purpose ? "&purpose=" + purpose : ""}${
            status ? "&status=" + status : ""
          }`,
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getDatasetV2(id) {
      let res;

      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/datasets/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async submitDatasetV2(payload) {
      let res;

      let method = "POST";

      app.progress.show();

      try {
        res = await fetch("/studio-gateway/v2/datasets/onboard", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async editDataset(payload, id) {
      let res;
      let method = "PATCH";
      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/datasets/${id}`, {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        console.log(e.message);
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async deleteDataset(dataset_id) {
      let res;
      let method = "DELETE";
      try {
        app.progress.show();
        res = await fetch("/studio-gateway/v2/datasets/" + dataset_id, {
          headers: this.getHeaders(),
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async preScanDatasetV2(payload) {
      let res;
      let method = "POST";

      app.progress.show();

      try {
        res = await fetch("/studio-gateway/v2/datasets/pre-scan", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getDatasetV2Identities(dataset_purpose) {
      let res;
      let method = "GET";

      try {
        app.progress.show();
        res = await fetch(
          `/studio-gateway/v2/datasets?purpose=` +
            dataset_purpose +
            "&status=Succeeded",
          {
            headers: this.getHeaders(),
            method: method,
          }
        );

        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async getSampleGeodata(dataset_id) {
      let res;
      let method = "GET";
      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/datasets/${dataset_id}/sample?sample_count=10`, {
          headers: this.getHeaders(),
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        console.log(e.message);
        throw e;
      }

      let json = await res.json();
      return json;
    }

    //=== Tune Endpoints ===//

    async getModelsAndTunes(
      limit = 10,
      skip = 0,
      name = "",
      purpose = [],
      status = [],
      type = null
    ) {
      let res;
      let method = "GET";

      app.progress.show();
      try {
        let url = `/studio-gateway/v2/tunes-and-models?limit=${limit}&skip=${skip}${
          name != "" ? `&name=${name}` : ""
        }${type ? `&type=${type}` : ""}`;

        if (purpose.length > 0) {
          purpose.forEach((entry) => {
            url += `&purpose=${entry}`;
          });
        }

        if (status.length > 0) {
          status.forEach((entry) => {
            url += `&status=${entry}`;
          });
        }

        res = await fetch(url, { headers: this.getHeaders(), method: method });
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getTunes(
      limit = 10,
      skip = 0,
      name = "",
      purpose = null,
      status = null
    ) {
      let res;
      let method = "GET";

      app.progress.show();
      try {
        res = await fetch(
          `/studio-gateway/v2/tunes?limit=${limit}&skip=${skip}${
            name != "" ? `&name=${name}` : ""
          }${purpose ? `&purpose=${purpose}` : ""}${
            status ? `&status=${status}` : ""
          }`,
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getSharedTunes(limit = 25, skip = 0) {
      let res;
      let method = "GET";
      try {
        app.progress.show();
        // TODO: And filter for shared tunes was added to this API
        res = await fetch(
          `/studio-gateway/v2/tunes?shared=true&limit=${limit}&skip=${skip}`,
          {
            headers: this.getHeaders(),
            method: method,
          }
        );
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      if (!json.results) return [];
      return json.results;
    }

    async getTune(tune_id) {
      let res;
      let method = "GET";
      try {
        app.progress.show();
        res = await fetch("/studio-gateway/v2/tunes/" + tune_id, {
          headers: this.getHeaders(),
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      if (res.status === 404) {
        json.tune_status = DELETED_TUNE;
        json.tune_id = tune_id;
      }
      return json;
    }

    async getTuneMetrics(tune_id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/tunes/${tune_id}/metrics`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      if (res.status === 404) {
        return [];
      }

      let json = await res.json();
      return json;
    }

    async updateTune(tune_id, req) {
      let res;
      let method = "PATCH";
      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/tunes/${tune_id}`, {
          headers: this.getHeaders(),
          body: JSON.stringify(req),
          method: method,
        });

        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        console.log(e.message);
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async deleteTune(tune_id) {
      let res;
      let method = "DELETE";
      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/tunes/${tune_id}`, {
          headers: this.getHeaders(),
          method: method,
        });

        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      try {
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        if (res.status === 204) {
          return { success: true };
        }

        let json = await res.json();
        return json;
      } catch (e) {
        throw e;
      }
    }

    async deployTunedModel(tune_id, req) {
      let res;
      let method = "POST";

      if (typeof req === "object") {
        req = JSON.stringify(req);
      }

      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/tunes/${tune_id}/deploy`, {
          headers: this.getHeaders(),
          body: req,
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        console.log(e.message);
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async downloadTune(tune_id) {
      let res;
      let method = "POST";
      try {
        app.progress.show();
        res = await fetch("/fine-tuning/tune/download", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify({
            tune_id: tune_id,
          }),
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async inferTune(tune_id) {
      let res;
      let method = "GET";
      try {
        app.progress.show();
        res = await fetch("/fine-tuning/tune/infer/" + tune_id, {
          headers: this.getHeaders(),
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async renameTune(doc) {
      let res;
      let method = "POST";
      try {
        app.progress.show();
        res = await fetch("/fine-tuning/tune/rename", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(doc),
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async getBaseModels(
      limit = 25,
      skip = 0,
      model_category = null,
      name = "",
      purpose = [],
      status = []
    ) {
      let res;
      let method = "GET";

      app.progress.show();
      try {
        let url = `/studio-gateway/v2/base-models?limit=${limit}&skip=${skip}${
          model_category ? "&model_category=" + model_category : ""
        }${name != "" ? `&name=${name}` : ""}`;

        if (purpose.length > 0) {
          purpose.forEach((entry) => {
            url += `&purpose=${entry}`;
          });
        }

        if (status.length > 0) {
          status.forEach((entry) => {
            url += `&status=${entry}`;
          });
        }

        res = await fetch(url, { headers: this.getHeaders(), method: method });
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getBaseModel(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/base-models/${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getInferenceTasksV2(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/inference/${id}/tasks`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getTaskOutputURL(id) {
      let res;
      let method = "GET";

      app.progress.show();

      try {
        res = await fetch(`/studio-gateway/v2/tasks/${id}/output`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (error) {
        console.log(error.message);
        throw error;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async getTasks(
      limit = 25,
      skip = 0,
      model_category = null,
      purpose = null
    ) {
      let res;
      let method = "GET";
      try {
        app.progress.show();
        res = await fetch(
          `/studio-gateway/v2/tune-templates?limit=${limit}&skip=${skip}${
            model_category ? "&model_category=" + model_category : ""
          }${purpose ? "&purpose=" + purpose : ""}`,
          { headers: this.getHeaders(), method: method }
        );

        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async getTask(taskId) {
      let res;
      let method = "GET";

      try {
        app.progress.show();
        res = await fetch("/studio-gateway/v2/tune-templates/" + taskId, {
          headers: this.getHeaders(),
          method: method,
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      return json;
    }

    async submitTune(req) {
      let res;
      let method = "POST";
      try {
        app.progress.show();
        res = await fetch("/studio-gateway/v2/submit-tune", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(req),
        });
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        console.log(e.message);
        throw e;
      }

      try {
        let json = await res.json();
        return json;
      } catch (e) {
        return null;
      }
    }

    //=== API Key Endpoints ===//

    async getAPIKeys() {
      let res;
      let method = "GET";

      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/auth/api-keys`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async generateAPIKey() {
      let res;
      let method = "POST";

      try {
        res = await fetch("/studio-gateway/v2/auth/api-keys", {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async deleteAPIKey(id) {
      let res;
      let method = "DELETE";

      try {
        app.progress.show();
        res = await fetch(`/studio-gateway/v2/auth/api-keys?apikey_id=${id}`, {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      if (res.status === 204) {
        return res.status;
      } else if (res.statusText) {
        return res.statusText;
      } else {
        return;
      }
    }

    //=== Issue Endpoints ===//

    async getIssues() {
      let res;
      let method = "GET";

      try {
        app.progress.show();
        res = await fetch("/studio-gateway/issue", {
          headers: this.getHeaders(),
          method: method,
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async postIssue(payload) {
      let res;
      let method = "POST";

      try {
        app.progress.show();
        res = await fetch("/studio-gateway/issue", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    async postComment(key, payload) {
      let res;
      let method = "POST";

      try {
        app.progress.show();
        res = await fetch("/studio-gateway/issue/" + key + "/comment", {
          headers: this.getHeaders(),
          method: method,
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.log(e.message);
        throw e;
      }

      app.progress.hide();

      let json = await res.json();
      return json;
    }

    //=== Misc Endpoints ===//

    async getPendingTaskIdsByIds(uuids) {
      const pendingTuneIds = [];
      const completedTuneIds = [];
      const tasks = [];
      try {
        await Promise.all(
          uuids.map(async (uuid) => {
            const response = await app.backend.getTune(uuid);
            if (response) {
              switch (response.tune_status?.toLowerCase()) {
                case FINISHED_TUNE:
                case FAILED_TUNE:
                case DEPLOYED_TUNE:
                  completedTuneIds.push(response.tune_id);
                  tasks.push(response);
                  break;
                case SUBMITTED_TUNE:
                case RUNNING_TUNE:
                case PENDING_TUNE:
                  pendingTuneIds.push(response.tune_id);
                  tasks.push(response);
                  break;
                case DELETED_TUNE:
                  completedTuneIds.push(response.tune_id);
                  break;
                default:
                  console.log(
                    "Unknown reponse status: " + response.tune_status
                  );
                  break;
              }
            }
          })
        );
        return {
          pendingTuneIds: pendingTuneIds,
          completedTuneIds: completedTuneIds,
          tasks: tasks,
        };
      } catch (error) {
        console.log(error);
        return {
          pendingTuneIds: uuids,
          completedTuneIds: completedTuneIds,
          tasks: tasks,
        };
      }
    }

    /*
     * layer_name: weatherfm:era5_100_metre_wind_expanded
     * start_date: 2015-07-01T00:00:00Z
     * end_date: 2015-07-02T00:00:00Z
     * example url: https://gfm-geoserver-nasageospatial.cash.sl.cloud9.ibm.com/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=weatherfm%3Aera5_100_metre_wind_expanded&cql_filter=timestamp%20BETWEEN%202015-07-01T00:00:00Z%20AND%202015-07-02T00:00:00Z&outputFormat=application%2Fjson
     */
    async getProperty(layer_name) {
      const params = {
        service: "wfs",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: layer_name,
        // cql_filter: `timestamp BETWEEN ${start_date} AND ${end_date}`,
        outputFormat: "application/json",
      };

      const urlParams = new URLSearchParams(params);
      const url = `https://gfm-geoserver-nasageospatial.cash.sl.cloud9.ibm.com/geoserver/wfs?${urlParams.toString()}`;

      let res;
      try {
        app.progress.show();
        res = await fetch(url);
        app.progress.hide();
      } catch (e) {
        app.progress.hide();
        throw e;
      }

      let json = await res.json();
      if (!json.features) return [];
      return json.features;
    }

    async getLocationFromLatLong(lat, lng) {
      let res;
      let token = app.env.geostudio.mapboxToken;
      let url;

      if (token) {
        url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`;
      } else {
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      }

      try {
        res = await fetch(url);
      } catch (e) {
        throw e;
      }

      let json = await res.json();
      return json;
    }

    //===========================//
    //=== VERSION 1 ENDPOINTS ===//
    //===========================//

    // async createLayers(payload) {
    //   let res;
    //   let method = "POST";

    //   console.log(payload);

    //   try {
    //     app.progress.show();
    //     res = await fetch("/studio-gateway/v1/layers", {
    //       headers: this.getHeaders(),
    //       method: method,
    //       body: JSON.stringify(payload),
    //     });
    //   } catch (e) {
    //     console.log(e.message);
    //     throw e;
    //   }

    //   app.progress.hide();
    //   let json = await res.json();
    //   return json;
    // }
  }
);
