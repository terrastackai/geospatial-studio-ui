/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


export default function asWebComponent(superclass) {
  class WebComponent extends superclass {
    constructor() {
      super();
      this.realShadow = this.attachShadow({ mode: "open" });
      this.setDOMCalled = false;
      this.init();
    }

    get shadow() {
      return this.realShadow;
    }

    /**
     * Called when the component is ready to render. By default,
     * calls the render() method;
     */
    connectedCallback() {
      this.render(false);
    }

    /**
     * Initialize or reset the state of your component
     */
    init() {}

    /**
     * Called to render the component
     * @param {boolean} update - if true (which is the default), an update is being requested rather than full DOM rebuild
     */
    render(update = true) {}

    /**
     * Reset the component to it's initial state
     */
    reset() {
      this.init();
      this.render(true);
    }

    /**
     * Call this method inside render() to build or update the component DOM
     * @param {String} htmlString
     * @param {boolean} update - if true, attempt to update the DOM rather than rebuilding it
     * @returns reference to the shadow DOM
     */
    setDOM(htmlString, update = false) {
      this.setDOMCalled = true;

      if (this.shadow.innerHTML === htmlString) return this.shadow; // nothing to update

      if (update === true) {
        console.warn(
          "setDOM() called with update = true, but base WebComponent class does not support it."
        );
      }

      this.shadow.innerHTML = htmlString;
      return this.shadow;
    }

    /**
     * Convenience method to map all elements that have an ID into a map object
     *
     * @returns { Object.<string, HTMLElement> } map of elements
     */
    mapElementsById() {
      /** @type { Object.<string, HTMLElement> } */ const byId = {};

      const processChild = (child) => {
        if (child.id) {
          byId[child.id] = child;
        }

        for (let child2 of child.childNodes) {
          processChild(child2);
        }
      };

      processChild(this.shadow);

      return byId;
    }
  }

  return WebComponent;
}
