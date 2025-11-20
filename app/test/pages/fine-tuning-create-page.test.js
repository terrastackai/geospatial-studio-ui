/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../js/pages/fine-tuning-create-page";
describe("fine-tuning-create-page", () => {
  let element;

  beforeEach(async () => {
    element = await fixture(
      "<fine-tuning-create-page></fine-tuning-create-page>"
    );
  });

  it("should validate setup form", async () => {
    await element.updateComplete;

    const setupForm = element.shadowRoot
      .querySelector("create-tune-forms")
      .shadowRoot.querySelector("setup-form");

    expect(setupForm).to.exist;

    const nameInput = setupForm.shadowRoot.querySelector("#name-input");
    const descriptionInput =
      setupForm.shadowRoot.querySelector("#description-input");
    const baseModelInput =
      setupForm.shadowRoot.querySelector("#base-model-input");
    const taskInput = setupForm.shadowRoot.querySelector("#task-input");

    // **** Simulate input values ****
    nameInput.value = "Test Name";
    descriptionInput.value = "Test Description";
    baseModelInput.value = "test-base-model-id";
    taskInput.value = "test-task-id";

    // **** Trigger form validation ****
    element.setupFormValidation();

    // **** expectations for validation ****
    expect(nameInput.hasAttribute("invalid")).to.be.false;
    expect(descriptionInput.hasAttribute("invalid")).to.be.false;
    expect(baseModelInput.hasAttribute("invalid")).to.be.false;
    expect(taskInput.hasAttribute("invalid")).to.be.false;
  });

  it("should validate training data form", async () => {
    await element.updateComplete;

    const trainingDataForm = element.shadowRoot
      .querySelector("create-tune-forms")
      .shadowRoot.querySelector("training-data-form");

    expect(trainingDataForm).to.exist;

    const datasetInput =
      trainingDataForm.shadowRoot.querySelector("#dataset-input");

    datasetInput.value = "test-dataset-id";

    element.trainingDataFormValidation();

    expect(datasetInput.hasAttribute("invalid")).to.be.false;
    expect(element.submitTunePayload.id).to.equal("test-dataset-id");
  });

  it("should update progress counter and UI", async () => {
    await element.updateComplete;

    const progressIndicator = element.shadowRoot
      .querySelector("progress-tracker")
      .shadowRoot.querySelector("bx-progress-indicator");

    const progressSteps =
      progressIndicator.querySelectorAll("bx-progress-step");

    element.progressCounter = 1;
    element.updateProgress();

    expect(progressSteps[0].getAttribute("state")).to.equal("complete");
    expect(progressSteps[1].getAttribute("state")).to.equal("current");
    expect(progressSteps[2].getAttribute("state")).to.equal("queued");
    expect(progressSteps[3].getAttribute("state")).to.equal("queued");
  });

  it("should optimize payload", async () => {
    await element.updateComplete;

    const submitPayload = {
      data: { batch_size: 32 },
      model: { frozen_backbone: true },
      runner: { max_epochs: 10 },
    };

    const defaultParams = {
      data: { batch_size: 16 },
      model: { frozen_backbone: false },
      runner: { max_epochs: 5 },
    };

    const optimizedPayload = element.optimizePayload(
      submitPayload,
      defaultParams
    );

    expect(optimizedPayload).to.deep.equal({
      data: { batch_size: 32 },
      model: { frozen_backbone: true },
      runner: { max_epochs: 10 },
    });
  });
  it("should render dynamic review form", async () => {
    await element.updateComplete;

    element.reviewFormResults = {
      baseModels: [{ id: "model1", name: "Model 1" }],
      trainingDatasets: [{ id: "dataset1", name: "Dataset 1" }],
      tasks: [{ id: "task1", name: "Task 1" }],
    };

    const submitTunePayload = {
      name: "Test Tune",
      description: "Test Description",
      base_model_id: "model1",
      dataset_id: "dataset1",
      task_id: "task1",
      model_parameters: {
        data: { batch_size: 32 },
        runner: { max_epochs: 10 },
      },
    };

    element.renderDynamicReviewForm(submitTunePayload);

    const reviewForm = element.shadowRoot
      .querySelector("create-tune-forms")
      .shadowRoot.querySelector("review-form");

    const basicSettingsContainer = reviewForm.shadowRoot.querySelector(
      ".basic-settings-review-container"
    );
    const advancedSettingsContainer = reviewForm.shadowRoot.querySelector(
      ".left-side-advanced-settings"
    );

    expect(basicSettingsContainer.textContent).to.include("Test Tune");
    expect(basicSettingsContainer.textContent).to.include("Model 1");
    expect(basicSettingsContainer.textContent).to.include("Dataset 1");
    expect(basicSettingsContainer.textContent).to.include("Task 1");

    expect(advancedSettingsContainer.textContent).to.include("Batch Size: 32");
    expect(advancedSettingsContainer.textContent).to.include(
      "Number of epochs: 10"
    );
  });
});
