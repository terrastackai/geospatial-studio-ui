/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { formatdataSetDateString } from "../../utils.js";
import {
  readyStatusIcon,
  progressStatusIcon,
  pendingStatusIcon,
  warningStatusIcon,
  errorStatusIcon,
  addIcon2,
} from "../../icons.js";
import "../../libs/carbon-web-components/data-table.min.js";
import "../../libs/carbon-web-components/pagination.min.js";
import "../../libs/carbon-web-components/textarea.min.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

    button {
      margin: 0;
      padding: 0;
      background: unset;
      border: unset;
    }

    cds-table-toolbar {
      background: var(--cds-layer-01);
    }

    cds-table-toolbar-search[expanded] {
      --cds-field-hover: var(--cds-layer-01);
    }

    #content-wrapper {
      display: flex;
      padding: 1rem;
      width: 100%;
    }

    #table-wrapper {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 25rem;
    }

    #table-scroll {
      flex-grow: 1;
      background: var(--cds-layer-01, #262626);
      overflow: auto;
    }

    cds-table-row {
      cursor: pointer;
    }

    cds-table-cell span {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
    }

    .no-issues {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--cds-text-03);
      background: var(--cds-layer-01, #262626);
    }

    #issue-details-panel {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 450px;
      height: 25rem;
      padding: 1rem;
      overflow: auto;
      background: var(--cds-layer-01, #262626);
    }

    .header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      row-gap: 0.5rem;
      width: 100%;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 400;
    }

    .header p {
      margin: 0;
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 14px;
      font-weight: 400;
    }

    .header p span {
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .field {
      display: flex;
      column-gap: 1rem;
      margin: 0;
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 14px;
      font-weight: 400;
    }

    .field span {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
      color: var(--cds-text-01, #f4f4f4);
    }

    .description-container cds-textarea {
      display: inline-block;
      margin-top: 0.5rem;
    }

    #comments-section {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
    }

    #comments-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
    }

    .comment-container {
      display: flex;
      column-gap: 1rem;
    }

    .user-initials {
      min-width: 2rem;
      min-height: 2rem;
      max-width: 2rem;
      max-height: 2rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000;
      letter-spacing: -0.26px;
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .user-initials[user] {
      background-color: #1192e8;
    }

    .user-initials[other] {
      background-color: #158784;
    }

    cds-button {
      width: fit-content;
    }
  </style>
  <div id="content-wrapper">
    <div id="table-wrapper">
      <cds-table-toolbar slot="toolbar">
        <cds-table-toolbar-content>
          <cds-table-toolbar-search
            placeholder="Search"
          ></cds-table-toolbar-search>
          <cds-button id="add-feedback-button">
            Add feedback ${addIcon2({ width: 16, height: 16, slot: "icon" })}
          </cds-button>
        </cds-table-toolbar-content>
      </cds-table-toolbar>
      <div id="table-scroll">
        <cds-table sort>
          <cds-table-head>
            <cds-table-header-row>
              <cds-table-header-cell>Name</cds-table-header-cell>
              <cds-table-header-cell>Issue Type</cds-table-header-cell>
              <cds-table-header-cell>Created</cds-table-header-cell>
              <cds-table-header-cell>Updated</cds-table-header-cell>
              <cds-table-header-cell>Last Editor</cds-table-header-cell>
              <cds-table-header-cell>Status</cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>
          <cds-table-body></cds-table-body>
        </cds-table>
      </div>
      <div class="no-issues-container"></div>
      <cds-pagination
        id="feedback-pagination"
        start="0"
        total-items="0"
        page-size="5"
      >
        <cds-select-item value="5">5</cds-select-item>
        <cds-select-item value="10">10</cds-select-item>
        <cds-select-item value="25">25</cds-select-item>
      </cds-pagination>
    </div>
    <div id="issue-details-panel-container"></div>
  </div>
`;

window.customElements.define(
  "feedback-table",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.issues;
      this.totalIssues;
      this.query = "";
    }

    render() {
      this.setDOM(template(this));

      this.tableBody = this.shadow.querySelector("cds-table-body");
      this.noIssuesContainer = this.shadow.querySelector(
        ".no-issues-container"
      );
      this.pagination = this.shadow.querySelector("#feedback-pagination");
      this.searchBar = this.shadow.querySelector("cds-table-toolbar-search");
      this.issueDetailsPanelContainer = this.shadow.querySelector(
        "#issue-details-panel-container"
      );
      this.feedbackButton = this.shadow.querySelector("#add-feedback-button");

      this.feedbackButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("open-feedback-modal"));
      });

      this.pagination.addEventListener(
        "cds-pagination-changed-current",
        (e) => {
          if (!this.issues || this.issues.length === 0) {
            return;
          }

          this.updateTable();
        }
      );

      this.pagination.addEventListener("cds-page-sizes-select-changed", (e) => {
        this.updateTable();
      });

      this.searchBar.addEventListener("cds-search-input", (e) => {
        this.query = e.detail.value;
        this.pagination.page = 1;
        this.updateTable();
      });

      this.getIssues();
    }

    async getIssues() {
      this.setupSkeletonTable();
      try {
        const response = await app.backend.getIssues();

        if ("results" in response) {
          this.issues = response.results;
          this.totalIssues = response.page_count;
          this.updateTable();
        } else {
          app.showMessage(
            "Failed to load issues: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading issues:", error);
        app.showMessage(
          "An error occured while loading the issues",
          "",
          "error",
          5000
        );
      }
    }

    updateTable() {
      this.tableBody.innerHTML = "";
      this.noIssuesContainer.innerHTML = "";

      let issuesToDisplay;

      const onSearch = (query) => {
        query = query.toLowerCase();
        let searchItems = [];
        if (query) {
          searchItems = this.issues.filter(
            (issue) =>
              issue.key.toLowerCase().includes(query) ||
              issue.fields.issuetype.name.toLowerCase().includes(query) ||
              (issue.fields.comment.comments.length > 0
                ? issue.fields.comment.comments[
                    issue.fields.comment.comments.length - 1
                  ]?.author.displayName
                    .toLowerCase()
                    .includes(query)
                : "You".toLowerCase()?.includes(query))
          );
        }
        return searchItems;
      };

      if (this.query !== "") {
        issuesToDisplay = onSearch(this.query);
        this.pagination.setAttribute(
          "total-items",
          `${issuesToDisplay.length}`
        );
        this.pagination.totalPages = Math.ceil(
          issuesToDisplay / this.pagination.pageSize
        );
      } else {
        issuesToDisplay = this.issues;
        this.pagination.setAttribute("total-items", `${this.totalIssues}`);
        this.pagination.totalPages = Math.ceil(
          this.totalIssues / this.pagination.pageSize
        );
      }

      let start = this.pagination.pageSize * (this.pagination.page - 1);
      let end = this.pagination.pageSize + start;

      issuesToDisplay = issuesToDisplay.slice(start, end);

      if (issuesToDisplay.length === 0) {
        this.noIssuesContainer.innerHTML = this._renderNoIssuesTable();
        this.issueDetailsPanelContainer.innerHTML = "";
        return;
      }

      issuesToDisplay.forEach((issue) => {
        this.addRow(issue);
      });

      this.shadow
        .querySelectorAll("cds-table-row")[0]
        .setAttribute("selected", "");

      this.setupIssueDetailsPanel(issuesToDisplay[0]);
    }

    setupSkeletonTable() {
      this.tableBody.innerHTML = "";
      this.noIssuesContainer.innerHTML = "";
      this.tableBody.innerHTML += this._renderTableSkeletonRow();
    }

    addRow(issue) {
      const rowTemplate = document.createElement("template");
      rowTemplate.innerHTML = this._renderTableRow(issue);
      const rowElement = rowTemplate.content.firstElementChild;

      rowElement.addEventListener("click", () => {
        if (rowElement.hasAttribute("selected")) {
          this.removeSelectedAttributeFromAllRows();
          this.issueDetailsPanelContainer.innerHTML = "";
        } else {
          this.removeSelectedAttributeFromAllRows();
          rowElement.setAttribute("selected", "");
          this.setupIssueDetailsPanel(issue);
        }
      });

      this.tableBody.appendChild(rowElement);
    }

    removeSelectedAttributeFromAllRows() {
      this.shadow
        .querySelectorAll("cds-table-row[selected]")
        .forEach((element) => {
          element.removeAttribute("selected");
        });
    }

    setupIssueDetailsPanel(issue) {
      this.issueDetailsPanelContainer.innerHTML =
        this._renderIssueDetails(issue);

      const commentsContainer = this.issueDetailsPanelContainer.querySelector(
        "#comments-container"
      );

      const newCommentInput = this.shadow.querySelector("#new-comment-input");
      const addCommentButton = this.shadow.querySelector("#add-comment-button");

      newCommentInput.addEventListener("input", () => {
        if (newCommentInput.value != "") {
          addCommentButton.removeAttribute("disabled");
        } else {
          addCommentButton.setAttribute("disabled", "");
        }
      });

      addCommentButton.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("send-comment", {
            detail: {
              comment: { body: newCommentInput.value },
              key: issue.key,
            },
          })
        );

        newCommentInput.value = "";
        addCommentButton.setAttribute("disabled", "");
      });

      commentsContainer.innerHTML = "";

      issue.fields.comment.comments.forEach((comment) => {
        const commentTemplate = document.createElement("template");
        commentTemplate.innerHTML = this._renderComment(comment);
        const commentElement = commentTemplate.content.firstElementChild;

        commentsContainer.appendChild(commentElement);
      });
    }

    addNewCommentLocally(key, comment) {
      for (let i = 0; i < this.issues.length; i++) {
        if (this.issues[i].key === key) {
          this.issues[i].fields.comment.comments.push(comment);
          this.setupIssueDetailsPanel(this.issues[i]);
          break;
        }
      }
    }

    _renderTableRow = (issue) => /* HTML */ `
      <cds-table-row>
        <cds-table-cell>${issue.key}</cds-table-cell>
        <cds-table-cell>${issue.fields.issuetype.name}</cds-table-cell>
        <cds-table-cell>
          ${formatdataSetDateString(issue.fields.created)}
        </cds-table-cell>
        <cds-table-cell>
          ${formatdataSetDateString(issue.fields.updated)}
        </cds-table-cell>
        <cds-table-cell>
          ${issue.fields.comment.comments.length > 0
            ? issue.fields.comment.comments[
                issue.fields.comment.comments.length - 1
              ].author.displayName
            : "You"}
        </cds-table-cell>
        <cds-table-cell>
          <span>
            ${this.getStatusIcon(issue.fields.status.name)}${issue.fields.status
              .name}
          </span>
        </cds-table-cell>
      </cds-table-row>
    `;

    _renderTableSkeletonRow = () => /* HTML */ `
      <cds-table-skeleton></cds-table-skeleton>
    `;

    _renderNoIssuesTable = () => /* HTML */ `
      <div class="no-issues">
        <svg
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          width="60"
          height="60"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path
            d="M8 18H12V20H8zM14 18H18V20H14zM8 14H12V16H8zM14 22H18V24H14zM20 14H24V16H20zM20 22H24V24H20z"
          ></path>
          <path
            d="M27,3H5A2.0025,2.0025,0,0,0,3,5V27a2.0025,2.0025,0,0,0,2,2H27a2.0025,2.0025,0,0,0,2-2V5A2.0025,2.0025,0,0,0,27,3Zm0,2,0,4H5V5ZM5,27V11H27l0,16Z"
          ></path>
          <title>Issues table</title>
        </svg>
        <h4>No Issues found!</h4>
      </div>
    `;

    _renderIssueDetails = (issue) => /* HTML */ `
      <div id="issue-details-panel">
        <section class="header">
          <h2>${issue.key}</h2>
          <p>
            Issued by <span>You</span> , last updated by
            <span>
              ${issue.fields.comment.comments.length > 0
                ? issue.fields.comment.comments[
                    issue.fields.comment.comments.length - 1
                  ].author.displayName
                : "You"}
            </span>
            at
            ${issue.fields.comment.comments.length > 0
              ? formatdataSetDateString(
                  issue.fields.comment.comments[
                    issue.fields.comment.comments.length - 1
                  ].updated
                )
              : formatdataSetDateString(issue.fields.updated)}
          </p>
        </section>
        <p class="field">
          Status<span>
            ${this.getStatusIcon(issue.fields.status.name)}${issue.fields.status
              .name}
          </span>
        </p>
        <p class="field">
          Issue Type<span>${issue.fields.issuetype.name}</span>
        </p>
        <p class="field">Summary<span>${issue.fields.summary}</span></p>
        <section class="description-container">
          <p class="field description-header">Description</p>
          <cds-textarea rows="3" readonly value="${issue.fields.description}">
          </cds-textarea>
        </section>
        <section id="comments-section">
          <p class="field">Comments</p>
          <div id="comments-container"></div>
          <cds-textarea
            id="new-comment-input"
            placeholder="Add a new comment"
            rows="5"
            label="Add a new comment"
          ></cds-textarea>
          <cds-button id="add-comment-button" kind="primary" size="sm" disabled>
            Submit comment
          </cds-button>
        </section>
      </div>
    `;

    _renderComment = (comment) => /* HTML */ `
      <div class="comment-container">
        <div
          class="user-initials"
          ${comment.author.displayName === "You" ? "user" : "other"}
        >
          ${this.getInitials(comment.author.displayName)}
        </div>
        <cds-textarea rows="3" readonly value="${comment.body}">
          <span slot="label-text">
            ${comment.author.displayName},
            ${formatdataSetDateString(comment.updated)}
          </span>
        </cds-textarea>
      </div>
    `;

    getStatusIcon(status) {
      switch (status) {
        case "To Do":
          return pendingStatusIcon();
        case "Blocked":
          return warningStatusIcon();
        case "In Progress":
          return progressStatusIcon();
        case "Researching":
          return progressStatusIcon();
        case "Testing":
          return progressStatusIcon();
        case "Awaiting Feedback":
          return progressStatusIcon();
        case "Reviewing":
          return progressStatusIcon();
        case "Cancelled":
          return errorStatusIcon();
        case "Ready":
          return readyStatusIcon();
        case "Done":
          return readyStatusIcon();

        default:
          return pendingStatusIcon();
      }
    }

    getInitials(displayName) {
      if (displayName === "You") {
        return displayName;
      }

      let initials = "";

      displayName
        .split(" ")
        .slice(0, 3)
        .forEach((name) => {
          initials += name[0];
        });

      return initials;
    }
  }
);
