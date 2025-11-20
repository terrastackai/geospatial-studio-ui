/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/fine-tuning/fine-tuning-table";
import sinon from "sinon";

describe("fine-tuning-table", () => {
  let element;
  let mockTunes;

  beforeEach(async () => {
    mockTunes = [
      {
        name: "Tune 1",
        id: "1",
        base_model: { name: "Model A" },
        created_at: "2023-01-01",
        updated_at: "2023-01-02",
        status: "Complete",
      },
      {
        name: "Tune 2",
        id: "2",
        base_model: { name: "Model B" },
        created_at: "2023-01-03",
        updated_at: "2023-01-04",
        status: "Pending",
      },
    ];
    window.app = {
      backend: {
        getTunes: sinon
          .stub()
          .resolves({ results: mockTunes, total_records: mockTunes.length }),
        deleteTune: sinon.stub().resolves({ success: true }),
      },
    };
    element = await fixture("<fine-tuning-table></fine-tuning-table>");
  });

  afterEach(() => {
    sinon.restore();
  });
  it("should render the table with correct headers", () => {
    const headers = element.shadowRoot.querySelectorAll("bx-table-header-cell");
    expect(headers[1].textContent).to.equal("Name");
    expect(headers[2].textContent).to.equal("ID");
    expect(headers[3].textContent).to.equal("Model");
    expect(headers[4].textContent).to.equal("Created");
    expect(headers[5].textContent).to.equal("Updated");
    expect(headers[6].textContent).to.equal("Status");
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
      `bx-table-header-cell[data-column-id="name"]`
    );
    firstHeader.dispatchEvent(sortEvent);
    await element.updateComplete;

    expect(element.state.sortInfo.columnId).to.equal("name");
    expect(element.state.sortInfo.direction).to.equal("ascending");

    it("should render noTuneTemplate when there are no tunes", async () => {
      window.app.backend.getTunes.resolves({ results: [], total_records: 0 });
      await element.loadTunes();
      await element.updateComplete;

      const noTuneElement = element.shadowRoot.querySelector(
        ".no-tune-template-container"
      );
      expect(noTuneElement).to.exist;
      expect(noTuneElement.innerHTML).to.include("No Tunes found!");
    });
  });
});
