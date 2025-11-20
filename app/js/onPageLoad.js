/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { setPageFromLocationBar, goToUrl } from "./router.js"

document.body.style.display = ""

export function setupPageLoad() {
  setPageFromLocationBar()

  // Prevent page reload when clicking nav links
  function overrideNavLinkDefaultBehavior() {
      const links = Array.from(document.querySelectorAll("cds-side-nav-link"))
      
      for (let l of links) {
          l.addEventListener("click", (e) => {
              goToUrl(l.getAttribute("href"))
              e.preventDefault()
              document.querySelector("cds-side-nav").removeAttribute("expanded")
          })
      }
  }

  overrideNavLinkDefaultBehavior()
}
