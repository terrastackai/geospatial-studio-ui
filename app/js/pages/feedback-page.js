/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/feedback/feedback-table.js";
import "../components/breadcrumb-button.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }
    .earth-bg {
      position: fixed;
      width: 100vw;
      height: calc(100vh - 3rem);
      object-fit: cover;
      top: 3rem;
      left: 0;
    }
    .page-content {
      color: var(--cds-text-primary);
      margin: 2rem 4rem 4rem;
      width: calc(100vw - 8rem);
      z-index: 1;
    }
    .feedback-wrapper {
      width: 100%;
      margin-top: 2rem;
      padding-bottom: 1rem;
      border: 1px dashed transparent;
      border-radius: 0.25rem;
      background: linear-gradient(#393939, #2e2e2e);
    }
    h1,
    h4 {
      font-weight: 400;
      margin-left: 1rem;
    }
  </style>
  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <breadcrumb-button
      breadcrumb-href=""
      breadcrumb-text="Homepage"
    ></breadcrumb-button>
    <div class="feedback-wrapper">
      <h1>Feedback</h1>
      <h4>Manage your feedback submissions</h4>
      <feedback-table></feedback-table>
    </div>
  </div>
`;
window.customElements.define(
  "feedback-page",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.feedbackTable = this.shadow.querySelector("feedback-table");

      this.feedbackTable.addEventListener("open-feedback-modal", () => {
        app.feedbackModal.openModal();
      });

      this.feedbackTable.addEventListener("send-comment", (e) => {
        this.postComment(e.detail);
      });

      app.feedbackModal.addEventListener("feedback-sent", (e) => {
        this.feedbackTable.getIssues();
      });
    }

    async postComment(payload) {
      try {
        const response = await app.backend.postComment(
          payload.key,
          payload.comment
        );

        if ("created" in response) {
          app.showMessage("Comment uploaded successfully", "", "success", 5000);
          this.feedbackTable.addNewCommentLocally(payload.key, response);
        } else {
          app.showMessage(
            "Failed to upload comment: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error uploading comment:", error);
        app.showMessage(
          "An error occured while uploading the comment",
          "",
          "error",
          5000
        );
      }
    }
  }
);
