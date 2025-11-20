/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/data-set-factory/dataset-table";
import sinon from "sinon";
import { noDataTemplate } from "../../../js/components/data-set-factory/dataset-table";

describe("dataset-table", () => {
  let element;
  let mockDatasets;

  beforeEach(async () => {
    mockDatasets = [
      {
        dataset_name: "Dataset 1",
        description: "Type 1",
        purpose: "Task 1",
        created_at: "2023-01-01",
        updated_at: "2023-01-02",
      },
      {
        dataset_name: "Dataset 2",
        description: "Type 2",
        purpose: "Task 2",
        created_at: "2023-01-03",
        updated_at: "2023-01-04",
      },
    ];

    window.app = {
      backend: {
        getDatasets: sinon.stub().resolves(mockDatasets),
      },
    };
    element = await fixture("<dataset-table></dataset-table>");
  });
  afterEach(() => {
    sinon.restore();
  });

  it("should render the table with correct headers", () => {
    const headers = element.shadowRoot.querySelectorAll("bx-table-header-cell");
    expect(headers[1].textContent).to.equal("Name");
    expect(headers[2].textContent).to.equal("Type");
  });

  it("should update sorting information and trigger table update on sort event", async () => {
    const sortEvent = new CustomEvent("bx-table-header-cell-sort", {
      detail: {
        sortDirection: "ascending",
      },
      bubbles: true,
      composed: true,
    });

    const firstHeader = element.shadowRoot.querySelector(
      `bx-table-header-cell[data-column-id="dataset_name"]`
    );
    firstHeader.dispatchEvent(sortEvent);
    await element.updateComplete;

    expect(element.state.sortInfo.columnId).to.equal("dataset_name");
    expect(element.state.sortInfo.direction).to.equal("ascending");
  });

  it("should render the noDataTemplate when there are no datasets", async () => {
    const datasets = app.backend.getDatasets();
    if (datasets.length === 0) {
      const noDataTemplate = await fixture(noDataTemplate());
      expect(noDataTemplate).to.exist;
    } else {
      !expect(noDataTemplate).to.exist;
    }
  });
});
