/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


function htmlToElement(html) {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

const svgIcon = (attrs = {}, svgText = "") => {
  const el = htmlToElement(svgText);
  for (let attr of Object.entries(attrs)) {
    el.setAttribute(attr[0], attr[1]);
    if (attr[0] === "title") {
      el.querySelector("title").innerHTML = attr[1];
    }
  }
  return el.outerHTML;
};

export const infoIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22"/> <path d="M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z"/> <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

export const forwardIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M22 16L12 26 10.6 24.6 19.2 16 10.6 7.4 12 6z"></path><title>Chevron right</title></svg>
`
  );

export const trashIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" > <rect width="16" height="16" transform="translate(0 0.503906)" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply" /> <path d="M7 6.50391H6V12.5039H7V6.50391Z" fill="currentColor" /> <path d="M10 6.50391H9V12.5039H10V6.50391Z" fill="currentColor" /> <path d="M2 3.50391V4.50391H3V14.5039C3 14.7691 3.10536 15.0235 3.29289 15.211C3.48043 15.3985 3.73478 15.5039 4 15.5039H12C12.2652 15.5039 12.5196 15.3985 12.7071 15.211C12.8946 15.0235 13 14.7691 13 14.5039V4.50391H14V3.50391H2ZM4 14.5039V4.50391H12V14.5039H4Z" fill="currentColor" /> <path d="M10 1.50391H6V2.50391H10V1.50391Z" fill="currentColor" /> </svg>`
  );

export const playIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M7,28a1,1,0,0,1-1-1V5a1,1,0,0,1,1.4819-.8763l20,11a1,1,0,0,1,0,1.7525l-20,11A1.0005,1.0005,0,0,1,7,28ZM8,6.6909V25.3088L24.9248,16Z" transform="translate(0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const pauseIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>pause</title><path d="M12,8V24H8V8h4m0-2H8A2,2,0,0,0,6,8V24a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2Z"/><path d="M24,8V24H20V8h4m0-2H20a2,2,0,0,0-2,2V24a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const copyIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13.6667 4.00302V13.003H4.66675V4.00302H13.6667ZM13.6667 3.00302H4.66675C4.40153 3.00302 4.14718 3.10838 3.95964 3.29591C3.7721 3.48345 3.66675 3.7378 3.66675 4.00302V13.003C3.66675 13.2682 3.7721 13.5226 3.95964 13.7101C4.14718 13.8977 4.40153 14.003 4.66675 14.003H13.6667C13.932 14.003 14.1863 13.8977 14.3739 13.7101C14.5614 13.5226 14.6667 13.2682 14.6667 13.003V4.00302C14.6667 3.7378 14.5614 3.48345 14.3739 3.29591C14.1863 3.10838 13.932 3.00302 13.6667 3.00302Z" fill="#F4F4F4"/> <path d="M1.66675 8.00302H0.666748V1.00302C0.666748 0.737805 0.772105 0.483451 0.959641 0.295914C1.14718 0.108378 1.40153 0.00302124 1.66675 0.00302124H8.66675V1.00302H1.66675V8.00302Z" fill="#F4F4F4"/> </svg> `
  );

export const viewIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M30.94,15.66A16.69,16.69,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16.69,16.69,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM16,25c-5.3,0-10.9-3.93-12.93-9C5.1,10.93,10.7,7,16,7s10.9,3.93,12.93,9C26.9,21.07,21.3,25,16,25Z"></path><path d="M16,10a6,6,0,1,0,6,6A6,6,0,0,0,16,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z"></path><title>Show</title></svg>
`
  );

export const viewOffIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M5.24,22.51l1.43-1.42A14.06,14.06,0,0,1,3.07,16C5.1,10.93,10.7,7,16,7a12.38,12.38,0,0,1,4,.72l1.55-1.56A14.72,14.72,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16,16,0,0,0,5.24,22.51Z"></path><path d="M12 15.73a4 4 0 013.7-3.7l1.81-1.82a6 6 0 00-7.33 7.33zM30.94 15.66A16.4 16.4 0 0025.2 8.22L30 3.41 28.59 2 2 28.59 3.41 30l5.1-5.1A15.29 15.29 0 0016 27 16.69 16.69 0 0030.94 16.34 1 1 0 0030.94 15.66zM20 16a4 4 0 01-6 3.44L19.44 14A4 4 0 0120 16zm-4 9a13.05 13.05 0 01-6-1.58l2.54-2.54a6 6 0 008.35-8.35l2.87-2.87A14.54 14.54 0 0128.93 16C26.9 21.07 21.3 25 16 25z"></path><title>Hide</title></svg>
`
  );

export const closeIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"></path></svg>
`
  );

export const addIcon2 = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 32 32" aria-hidden="true" class="add-icon"><path d="M17 15L17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z"></path></svg> 
`
  );

export const loadingIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="50%" cy="50%" r="10" fill="none" stroke="#e0e0e0" stroke-width="4"/><circle cx="50%" cy="50%" r="10" fill="none" stroke="#0f62fe" stroke-width="4" stroke-dasharray="40 100"/></svg>`
  );

export const floodIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-label="name"> <g clip-path="url(#name_svg__a)" fill="currentColor"> <path d="M4.375 7.5H2.5a1.251 1.251 0 0 1-1.25-1.25v-2.5A1.251 1.251 0 0 1 2.5 2.5h1.875v1.25H2.5v2.5h1.875V7.5ZM9.375 6.25h-3.75V7.5h3.75V6.25ZM14.375 6.25h-3.75V7.5h3.75V6.25ZM17.5 7.5h-1.875V6.25H17.5v-2.5h-1.875V2.5H17.5a1.252 1.252 0 0 1 1.25 1.25v2.5A1.252 1.252 0 0 1 17.5 7.5ZM14.375 2.5h-3.75v1.25h3.75V2.5ZM9.375 2.5h-3.75v1.25h3.75V2.5ZM17.5 17.5h-15a1.252 1.252 0 0 1-1.25-1.25v-2.5A1.252 1.252 0 0 1 2.5 12.5h15a1.252 1.252 0 0 1 1.25 1.25v2.5a1.252 1.252 0 0 1-1.25 1.25Zm-15-3.75v2.5h15v-2.5h-15ZM18.75 9.375H1.25v1.25h17.5v-1.25Z"></path> </g><defs><clipPath id="name_svg__a"> <path d="M0 0h20v20H0z"></path></clipPath></defs></svg>
`
  );

export const fireScarsIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-label="legend"> <g clip-path="url(#legend_svg__a)" fill="currentColor"> <path d="M18.75 13.75H10V15h8.75v-1.25ZM5.625 12.5h-2.5a.625.625 0 0 0-.625.625v2.5c0 .345.28.625.625.625h2.5c.345 0 .625-.28.625-.625v-2.5a.625.625 0 0 0-.625-.625ZM18.75 5H10v1.25h8.75V5ZM5.938 7.5H2.813a.312.312 0 0 1-.28-.452l1.562-3.14a.325.325 0 0 1 .56 0l1.562 3.14a.313.313 0 0 1-.28.452Z"></path> </g><defs><clipPath id="legend_svg__a"> <path d="M0 0h20v20H0z"></path></clipPath></defs></svg>
`
  );

export const lulcIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-label="language"> <g clip-path="url(#language_svg__a)" fill="currentColor"> <path d="M18.75 6.25v-5h-5v5h1.875v2.5h-1.25V10h4.375V8.75h-1.875v-2.5h1.875ZM15 2.5h2.5V5H15V2.5ZM12.5 14.631l-.881-.881L10 15.369 8.381 13.75l-.881.881 1.619 1.619L7.5 17.869l.881.881L10 17.131l1.619 1.619.881-.881-1.619-1.619 1.619-1.619ZM12.5 8.75h-5V10h1.875v3.125h1.25V10H12.5V8.75ZM4.375 6.163a2.5 2.5 0 1 0-1.25 0V8.75H1.25V10h4.375V8.75h-1.25V6.163ZM2.5 3.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z"></path> </g><defs><clipPath id="language_svg__a"> <path d="M0 0h20v20H0z"></path></clipPath></defs></svg>
`
  );

export const runIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg slot="icon" focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"> <polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/> </svg>
`
  );

export const runIcon2 = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>run</title><path d="M21,16a6,6,0,1,1-6,6,6,6,0,0,1,6-6m0-2a8,8,0,1,0,8,8,8,8,0,0,0-8-8Z"/><path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2h4V26H6V12H28V6A2,2,0,0,0,26,4ZM6,10V6H26v4Z"/><polygon points="19 19 19 25 24 22 19 19"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const arrowLeftIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="14 26 15.41 24.59 7.83 17 28 17 28 15 7.83 15 15.41 7.41 14 6 4 16 14 26"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

export const arrowRightIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M18 6L16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6z"></path><title>Arrow right</title></svg>
`
  );

export const musicAddIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="30 6 26 6 26 2 24 2 24 6 20 6 20 8 24 8 24 12 26 12 26 8 30 8 30 6"/> <path d="M24,15v7.5562A3.9552,3.9552,0,0,0,22,22a4,4,0,1,0,4,4V15ZM22,28a2,2,0,1,1,2-2A2.0027,2.0027,0,0,1,22,28Z"/> <path d="M17,6H10A2.002,2.002,0,0,0,8,8V22.5562A3.9557,3.9557,0,0,0,6,22a4,4,0,1,0,4,4V8h7ZM6,28a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,6,28Z"/> <rect id="_Transparent_Rectangle_" data-name=" Transparent Rectangle " class="cls-1" width="32" height="32"/> </svg> `
  );

export const chevronDownIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve" fill="currentColor"> <style type="text/css"> .st0{fill:none;} </style> <polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/> <rect id="_x3C_Transparent_Rectangle_x3E_" class="st0" width="32" height="32"/> </svg> `
  );

export const renewIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>renew</title><path d="M12,10H6.78A11,11,0,0,1,27,16h2A13,13,0,0,0,6,7.68V4H4v8h8Z"/><path d="M20,22h5.22A11,11,0,0,1,5,16H3a13,13,0,0,0,23,8.32V28h2V20H20Z"/><g id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;"><rect class="cls-1" width="32" height="32"/></g></svg>`
  );

export const splitScreenBlankIcon = (attrs) =>
  svgIcon(
    {},
    `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" style="mix-blend-mode:multiply;fill:transparent"/> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M8.5 2H7.5V14H8.5V2Z" fill="#F4F4F4"/> <path d="M5 3.5V12.5H2V3.5H5ZM5 2.5H2C1.73478 2.5 1.48043 2.60536 1.29289 2.79289C1.10536 2.98043 1 3.23478 1 3.5V12.5C1 12.7652 1.10536 13.0196 1.29289 13.2071C1.48043 13.3946 1.73478 13.5 2 13.5H5C5.26522 13.5 5.51957 13.3946 5.70711 13.2071C5.89464 13.0196 6 12.7652 6 12.5V3.5C6 3.23478 5.89464 2.98043 5.70711 2.79289C5.51957 2.60536 5.26522 2.5 5 2.5Z" fill="#F4F4F4"/> <path d="M14 3.5V12.5H11V3.5H14ZM14 2.5H11C10.7348 2.5 10.4804 2.60536 10.2929 2.79289C10.1054 2.98043 10 3.23478 10 3.5V12.5C10 12.7652 10.1054 13.0196 10.2929 13.2071C10.4804 13.3946 10.7348 13.5 11 13.5H14C14.2652 13.5 14.5196 13.3946 14.7071 13.2071C14.8946 13.0196 15 12.7652 15 12.5V3.5C15 3.23478 14.8946 2.98043 14.7071 2.79289C14.5196 2.60536 14.2652 2.5 14 2.5Z" fill="#F4F4F4"/> </svg>
`
  );

export const splitScreenLeftIcon = (attrs) =>
  svgIcon(
    {},
    `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply;fill:transparent"/> <path d="M8.5 2H7.5V14H8.5V2Z" fill="#F4F4F4"/> <path d="M2 3.5V8V12.5V3.5ZM5 2.5H2C1.73478 2.5 1.48043 2.60536 1.29289 2.79289C1.10536 2.98043 1 3.23478 1 3.5V12.5C1 12.7652 1.10536 13.0196 1.29289 13.2071C1.48043 13.3946 1.73478 13.5 2 13.5H5C5.26522 13.5 5.51957 13.3946 5.70711 13.2071C5.89464 13.0196 6 12.7652 6 12.5V3.5C6 3.23478 5.89464 2.98043 5.70711 2.79289C5.51957 2.60536 5.26522 2.5 5 2.5Z" fill="#F4F4F4"/> <path d="M14 3.5V12.5H11V3.5H14ZM14 2.5H11C10.7348 2.5 10.4804 2.60536 10.2929 2.79289C10.1054 2.98043 10 3.23478 10 3.5V12.5C10 12.7652 10.1054 13.0196 10.2929 13.2071C10.4804 13.3946 10.7348 13.5 11 13.5H14C14.2652 13.5 14.5196 13.3946 14.7071 13.2071C14.8946 13.0196 15 12.7652 15 12.5V3.5C15 3.23478 14.8946 2.98043 14.7071 2.79289C14.5196 2.60536 14.2652 2.5 14 2.5Z" fill="#F4F4F4"/> </svg>
`
  );

export const splitScreenRightIcon = (attrs) =>
  svgIcon(
    {},
    `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply;fill:transparent"/> <path d="M8.5 2H7.5V14H8.5V2Z" fill="#F4F4F4"/> <path d="M5 3.5V12.5H2V3.5H5ZM5 2.5H2C1.73478 2.5 1.48043 2.60536 1.29289 2.79289C1.10536 2.98043 1 3.23478 1 3.5V12.5C1 12.7652 1.10536 13.0196 1.29289 13.2071C1.48043 13.3946 1.73478 13.5 2 13.5H5C5.26522 13.5 5.51957 13.3946 5.70711 13.2071C5.89464 13.0196 6 12.7652 6 12.5V3.5C6 3.23478 5.89464 2.98043 5.70711 2.79289C5.51957 2.60536 5.26522 2.5 5 2.5Z" fill="#F4F4F4"/> <path d="M14 2.5H11C10.7348 2.5 10.4804 2.60536 10.2929 2.79289C10.1054 2.98043 10 3.23478 10 3.5V12.5C10 12.7652 10.1054 13.0196 10.2929 13.2071C10.4804 13.3946 10.7348 13.5 11 13.5H14C14.2652 13.5 14.5196 13.3946 14.7071 13.2071C14.8946 13.0196 15 12.7652 15 12.5V3.5C15 3.23478 14.8946 2.98043 14.7071 2.79289C14.5196 2.60536 14.2652 2.5 14 2.5Z" fill="#F4F4F4"/> </svg>
`
  );

export const documentAddIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="30 24 26 24 26 20 24 20 24 24 20 24 20 26 24 26 24 30 26 30 26 26 30 26 30 24"/> <path d="M16,28H8V4h8v6a2.0058,2.0058,0,0,0,2,2h6v4h2V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,18,2H8A2.0058,2.0058,0,0,0,6,4V28a2.0058,2.0058,0,0,0,2,2h8ZM18,4.4,23.6,10H18Z"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const userIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>user</title><path d="M16,4a5,5,0,1,1-5,5,5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,16,2Z"/><path d="M26,30H24V25a5,5,0,0,0-5-5H13a5,5,0,0,0-5,5v5H6V25a7,7,0,0,1,7-7h6a7,7,0,0,1,7,7Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const searchIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z" transform="translate(0 0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

// *--- MENU BAR ICONS ---*
export const layerIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M16,24a.9967.9967,0,0,1-.4741-.12l-13-7L3.4741,15.12,16,21.8643,28.5259,15.12l.9482,1.7607-13,7A.9967.9967,0,0,1,16,24Z" transform="translate(0 0)"/> <path d="M16,30a.9967.9967,0,0,1-.4741-.12l-13-7L3.4741,21.12,16,27.8643,28.5259,21.12l.9482,1.7607-13,7A.9967.9967,0,0,1,16,30Z" transform="translate(0 0)"/> <path d="M16,18a.9967.9967,0,0,1-.4741-.12l-13-7a1,1,0,0,1,0-1.7607l13-7a.9982.9982,0,0,1,.9482,0l13,7a1,1,0,0,1,0,1.7607l-13,7A.9967.9967,0,0,1,16,18ZM5.1094,10,16,15.8643,26.8906,10,16,4.1358Z" transform="translate(0 0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const recentlyViewedIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>recently-viewed</title><polygon points="20.59 22 15 16.41 15 7 17 7 17 15.58 22 20.59 20.59 22"/><path d="M16,2A13.94,13.94,0,0,0,6,6.23V2H4v8h8V8H7.08A12,12,0,1,1,4,16H2A14,14,0,1,0,16,2Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const datasetIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="25 12 25 3 23 3 23 5 20 5 20 7 23 7 23 12 20 12 20 14 28 14 28 12 25 12"/> <path d="m8.5,5c1.9299,0,3.5,1.5701,3.5,3.5s-1.5701,3.5-3.5,3.5-3.5-1.5701-3.5-3.5,1.5701-3.5,3.5-3.5m0-2c-3.0376,0-5.5,2.4624-5.5,5.5s2.4624,5.5,5.5,5.5,5.5-2.4624,5.5-5.5-2.4624-5.5-5.5-5.5h0Z"/> <path d="m8.5,20c1.9299,0,3.5,1.5701,3.5,3.5s-1.5701,3.5-3.5,3.5-3.5-1.5701-3.5-3.5,1.5701-3.5,3.5-3.5m0-2c-3.0376,0-5.5,2.4624-5.5,5.5s2.4624,5.5,5.5,5.5,5.5-2.4624,5.5-5.5-2.4624-5.5-5.5-5.5h0Z"/> <path d="m23.5,20c1.9299,0,3.5,1.5701,3.5,3.5s-1.5701,3.5-3.5,3.5-3.5-1.5701-3.5-3.5,1.5701-3.5,3.5-3.5m0-2c-3.0376,0-5.5,2.4624-5.5,5.5s2.4624,5.5,5.5,5.5,5.5-2.4624,5.5-5.5-2.4624-5.5-5.5-5.5h0Z"/> <rect id="_Transparent_Rectangle_" data-name="&amp;lt;Transparent Rectangle&amp;gt;" class="cls-1" width="32" height="32"/> </svg>`
  );
// *--- END OF MENU BAR ICONS ---*

// *--- LAYER ICONS ---*
export const baseMapLayer = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M14.6214 2.01508L10.6214 1.01508C10.5193 0.98974 10.4119 0.996996 10.3142 1.03583L5.4642 2.97583L1.62135 2.01508C1.54764 1.99663 1.47069 1.99524 1.39635 2.01099C1.32201 2.02674 1.25225 2.05923 1.19235 2.10598C1.13245 2.15274 1.08399 2.21253 1.05066 2.28082C1.01733 2.3491 1.00001 2.42409 1 2.50008V13.5001C1.00001 13.6116 1.03728 13.7198 1.10589 13.8077C1.17449 13.8956 1.2705 13.958 1.37865 13.9851L5.37865 14.9851C5.41836 14.9949 5.4591 14.9999 5.5 15.0001C5.56366 15.0001 5.62673 14.9879 5.6858 14.9642L10.5358 13.0242L14.3788 13.9851C14.4525 14.0035 14.5294 14.0049 14.6038 13.9892C14.6781 13.9734 14.7478 13.9409 14.8077 13.8941C14.8676 13.8474 14.916 13.7876 14.9494 13.7193C14.9827 13.651 15 13.5761 15 13.5001V2.50008C15 2.38859 14.9627 2.28031 14.8941 2.19243C14.8255 2.10456 14.7295 2.04213 14.6214 2.01508ZM14 5.50008H11V2.14038L14 2.89038V5.50008ZM5 9.50008H2V6.50008H5V9.50008ZM6 5.50008V3.83863L10 2.23863V5.50008H6ZM10 6.50008V9.50008H6V6.50008H10ZM6 10.5001H10V12.1614L6 13.7614V10.5001ZM11 6.50008H14V9.50008H11V6.50008ZM5 3.89038V5.50008H2V3.14038L5 3.89038ZM2 10.5001H5V13.8597L2 13.1097V10.5001ZM11 12.1094V10.5001H14V12.8597L11 12.1094Z" fill="#56976C"/><title>Base map</title></svg>
`
  );

export const defaultLayerIcon = (attrs) =>
  svgIcon(
    attrs,
    `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/><path d="M11.793 6.5L10.5 5.207V3H11.5V4.793L12.5 5.793L11.793 6.5Z" fill="#BEBEBE"/><path d="M11 9C10.2089 9 9.43552 8.76541 8.77772 8.32588C8.11992 7.88635 7.60723 7.26164 7.30448 6.53074C7.00173 5.79983 6.92252 4.99556 7.07686 4.21964C7.2312 3.44372 7.61216 2.73098 8.17157 2.17157C8.73098 1.61216 9.44372 1.2312 10.2196 1.07686C10.9956 0.92252 11.7998 1.00173 12.5307 1.30448C13.2616 1.60723 13.8864 2.11992 14.3259 2.77772C14.7654 3.43552 15 4.20888 15 5C14.9988 6.06049 14.577 7.0772 13.8271 7.82708C13.0772 8.57697 12.0605 8.99878 11 9ZM11 2C10.4067 2 9.82664 2.17595 9.33329 2.50559C8.83994 2.83524 8.45542 3.30377 8.22836 3.85195C8.0013 4.40013 7.94189 5.00333 8.05764 5.58527C8.1734 6.16722 8.45912 6.70176 8.87868 7.12132C9.29824 7.54088 9.83279 7.8266 10.4147 7.94236C10.9967 8.05811 11.5999 7.9987 12.1481 7.77164C12.6962 7.54458 13.1648 7.16006 13.4944 6.66671C13.8241 6.17337 14 5.59335 14 5C13.9991 4.20462 13.6828 3.44207 13.1204 2.87965C12.5579 2.31723 11.7954 2.00088 11 2Z" fill="#BEBEBE"/><path d="M4.315 9L7.815 12H15V11H8.185L4.685 8H2V1H1V14C1.00033 14.2651 1.10579 14.5193 1.29326 14.7067C1.48072 14.8942 1.73489 14.9997 2 15H15V14H2V9H4.315Z" fill="#BEBEBE"/><title>Default layer icon</title></svg>
`
  );

export const osmLayerIcon = (attrs) =>
  svgIcon(
    attrs,
    `
    <svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#915697"><defs><style>.cls-1{fill:none;}</style></defs><title>building</title><path d="M28,2H16a2.002,2.002,0,0,0-2,2V14H4a2.002,2.002,0,0,0-2,2V30H30V4A2.0023,2.0023,0,0,0,28,2ZM9,28V21h4v7Zm19,0H15V20a1,1,0,0,0-1-1H8a1,1,0,0,0-1,1v8H4V16H16V4H28Z"/><rect x="18" y="8" width="2" height="2"/><rect x="24" y="8" width="2" height="2"/><rect x="18" y="14" width="2" height="2"/><rect x="24" y="14" width="2" height="2"/><rect x="18" y="19.9996" width="2" height="2"/><rect x="24" y="19.9996" width="2" height="2"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>
    `
  );

// *--- END OF LAYER ICONS ---*

// *--- HISTORY ICONS ---*
export const calendarIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" transform="translate(0 0.000976562)" fill="white" fill-opacity="0" style="mix-blend-mode:multiply"/> <path d="M13 2.00098H11V1.00098H10V2.00098H6V1.00098H5V2.00098H3C2.73489 2.00131 2.48072 2.10677 2.29326 2.29424C2.10579 2.4817 2.00033 2.73586 2 3.00098V13.001C2.00033 13.2661 2.10579 13.5203 2.29326 13.7077C2.48072 13.8952 2.73489 14.0006 3 14.001H13C13.2651 14.0006 13.5193 13.8952 13.7067 13.7077C13.8942 13.5203 13.9997 13.2661 14 13.001V3.00098C13.9997 2.73586 13.8942 2.4817 13.7067 2.29424C13.5193 2.10677 13.2651 2.00131 13 2.00098ZM3 3.00098H5V4.00098H6V3.00098H10V4.00098H11V3.00098H13V5.00098H3V3.00098ZM3 6.00098H5.5V9.00098H3V6.00098ZM9.5 13.001H6.5V10.001H9.5V13.001ZM9.5 9.00098H6.5V6.00098H9.5V9.00098ZM10.5 13.001V10.001H13L13.0006 13.001H10.5Z" fill="currentColor"/> </svg>`
  );

export const locationIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <title>location</title> <path d="M16,18a5,5,0,1,1,5-5A5.0057,5.0057,0,0,1,16,18Zm0-8a3,3,0,1,0,3,3A3.0033,3.0033,0,0,0,16,10Z"/> <path d="M16,30,7.5645,20.0513c-.0479-.0571-.3482-.4515-.3482-.4515A10.8888,10.8888,0,0,1,5,13a11,11,0,0,1,22,0,10.8844,10.8844,0,0,1-2.2148,6.5973l-.0015.0025s-.3.3944-.3447.4474ZM8.8125,18.395c.001.0007.2334.3082.2866.3744L16,26.9079l6.91-8.15c.0439-.0552.2783-.3649.2788-.3657A8.901,8.901,0,0,0,25,13,9,9,0,1,0,7,13a8.9054,8.9054,0,0,0,1.8125,5.395Z"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32" transform="translate(0 32) rotate(-90)"/> </svg> `
  );

export const modelIcon = (attrs) =>
  svgIcon(
    {},
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M14.2236 8.05276L11.5 6.69091V3.50001C11.5 3.40715 11.4742 3.31613 11.4254 3.23713C11.3765 3.15814 11.3067 3.0943 11.2236 3.05276L8.22365 1.55276C8.1542 1.51806 8.07763 1.5 8 1.5C7.92237 1.5 7.8458 1.51806 7.77635 1.55276L4.77635 3.05276C4.6933 3.0943 4.62346 3.15814 4.57465 3.23713C4.52584 3.31613 4.49999 3.40715 4.5 3.50001V6.69091L1.77635 8.05276C1.6933 8.0943 1.62346 8.15814 1.57465 8.23713C1.52584 8.31613 1.49999 8.40715 1.5 8.50001V12C1.49999 12.0929 1.52584 12.1839 1.57465 12.2629C1.62346 12.3419 1.6933 12.4057 1.77635 12.4473L4.77635 13.9473C4.8458 13.982 4.92237 14 5 14C5.07763 14 5.1542 13.982 5.22365 13.9473L8 12.5591L10.7764 13.9473C10.8458 13.982 10.9224 14 11 14C11.0776 14 11.1542 13.982 11.2236 13.9473L14.2236 12.4473C14.3067 12.4057 14.3765 12.3419 14.4254 12.2629C14.4742 12.1839 14.5 12.0929 14.5 12V8.50001C14.5 8.40715 14.4742 8.31613 14.4254 8.23713C14.3765 8.15814 14.3067 8.0943 14.2236 8.05276ZM10.5 6.69091L8.5 7.69091V5.30911L10.5 4.30911V6.69091ZM8 2.55911L9.88185 3.50001L8 4.44091L6.11815 3.50001L8 2.55911ZM5.5 4.30911L7.5 5.30911V7.69091L5.5 6.69091V4.30911ZM4.5 12.6909L2.5 11.6909V9.30911L4.5 10.3091V12.6909ZM5 9.44091L3.11815 8.50001L5 7.55911L6.88185 8.50001L5 9.44091ZM5.5 10.3091L7.5 9.30911V11.6909L5.5 12.6909V10.3091ZM10.5 12.6909L8.5 11.6909V9.30911L10.5 10.3091V12.6909ZM11 9.44091L9.11815 8.50001L11 7.55911L12.8819 8.50001L11 9.44091ZM13.5 11.6909L11.5 12.6909V10.3091L13.5 9.30911V11.6909Z" fill="#C6C6C6"/> </svg> `
  );

export const popupIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>popup</title><path d="M28,4H10A2.0059,2.0059,0,0,0,8,6V20a2.0059,2.0059,0,0,0,2,2H28a2.0059,2.0059,0,0,0,2-2V6A2.0059,2.0059,0,0,0,28,4Zm0,16H10V6H28Z"/><path d="M18,26H4V16H6V14H4a2.0059,2.0059,0,0,0-2,2V26a2.0059,2.0059,0,0,0,2,2H18a2.0059,2.0059,0,0,0,2-2V24H18Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );
// *--- END OF HISTORY ICONS ---*

export const opacityIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>opacity</title><rect x="6" y="6" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><rect x="14" y="6" width="4" height="4"/><rect x="22" y="6" width="4" height="4"/><rect x="6" y="14" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/><rect x="22" y="14" width="4" height="4"/><rect x="6" y="22" width="4" height="4"/><rect x="14" y="22" width="4" height="4"/><rect x="22" y="22" width="4" height="4"/><rect x="18" y="10" width="4" height="4"/><rect x="10" y="18" width="4" height="4"/><rect x="18" y="18" width="4" height="4"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const apiKeyIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } .cls-1, .cls-2 { stroke-width: 0px; } </style> </defs> <path class="cls-2" d="m28,26c-.178,0-.3472.0308-.5115.0742l-1.0554-1.0552c.3516-.5947.5669-1.2798.5669-2.019s-.2153-1.4243-.5669-2.019l1.0554-1.0552c.1643.0435.3335.0742.5115.0742,1.1045,0,2-.8955,2-2s-.8955-2-2-2-2,.8955-2,2c0,.1777.0308.3472.0742.5117l-1.0552,1.0552c-.595-.3516-1.2795-.5669-2.019-.5669s-1.4241.2153-2.019.5669l-1.0552-1.0552c.0435-.1646.0742-.334.0742-.5117,0-1.1045-.8955-2-2-2s-2,.8955-2,2,.8955,2,2,2c.178,0,.3472-.0308.5115-.0742l1.0554,1.0552c-.3516.5947-.5669,1.2798-.5669,2.019s.2153,1.4243.5669,2.019l-1.0554,1.0552c-.1643-.0435-.3335-.0742-.5115-.0742-1.1045,0-2,.8955-2,2s.8955,2,2,2,2-.8955,2-2c0-.1777-.0308-.3472-.0742-.5117l1.0552-1.0552c.595.3516,1.2795.5669,2.019.5669s1.4241-.2153,2.019-.5669l1.0552,1.0552c-.0435.1646-.0742.334-.0742.5117,0,1.1045.8955,2,2,2s2-.8955,2-2-.8955-2-2-2Zm-7-3c0-1.1025.8972-2,2-2s2,.8975,2,2-.8972,2-2,2-2-.8975-2-2Z"/> <circle class="cls-2" cx="22" cy="10" r="2"/> <path class="cls-2" d="m21,2c-4.9626,0-9,4.0371-9,9,0,.7788.0989,1.5469.2944,2.291L2,23.5859v6.4141h6.4143l7-7-2.7073-2.707-1.4141,1.4141,1.2927,1.293-1.5896,1.5898-1.2869-1.2949-1.4185,1.4102,1.2913,1.2988-1.9963,1.9961h-3.5857v-3.5859l9.7122-9.7119.8555-.8677-.1982-.5845c-.2451-.7217-.3694-1.4785-.3694-2.25,0-3.8599,3.1401-7,7-7s7,3.1401,7,7h2c0-4.9629-4.0374-9-9-9Z"/> <rect id="_Transparent_Rectangle_" data-name="&amp;lt;Transparent Rectangle&amp;gt;" class="cls-1" width="32" height="32"/> </svg>`
  );
// *--- STATUS ICONS ---*
export const readyStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none" > <rect width="16" height="16" transform="translate(0 0.501953)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply" /> <rect x="4" y="4.50195" width="8" height="8" fill="black" /> <rect width="16" height="16" transform="translate(0 0.501953)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply" /> <path d="M8 1.50195C6.61553 1.50195 5.26216 1.9125 4.11101 2.68167C2.95987 3.45084 2.06266 4.54409 1.53285 5.82317C1.00303 7.10225 0.86441 8.50972 1.13451 9.86759C1.4046 11.2255 2.07129 12.4727 3.05026 13.4517C4.02922 14.4307 5.2765 15.0974 6.63437 15.3674C7.99224 15.6375 9.3997 15.4989 10.6788 14.9691C11.9579 14.4393 13.0511 13.5421 13.8203 12.3909C14.5895 11.2398 15 9.88642 15 8.50195C15 6.64544 14.2625 4.86496 12.9497 3.55221C11.637 2.23945 9.85652 1.50195 8 1.50195ZM7 11.2974L4.5 8.79735L5.2953 8.00195L7 9.70655L10.705 6.00195L11.5029 6.7949L7 11.2974Z" fill="${
      attrs?.fill ? attrs.fill : "#42BE65"
    }" /> </svg>`
  );

export const stopStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#FA4D56"><defs><style>.cls-1{fill:none;}</style></defs><title>stop--solid--filled</title><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm6,18a2,2,0,0,1-2,2H12a2,2,0,0,1-2-2V12a2,2,0,0,1,2-2h8a2,2,0,0,1,2,2Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const completedWithErrorsStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#42BE65"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M30,24a6,6,0,1,0-6,6A6.0066,6.0066,0,0,0,30,24Zm-2,0a3.9521,3.9521,0,0,1-.5669,2.019L21.981,20.5669A3.9529,3.9529,0,0,1,24,20,4.0045,4.0045,0,0,1,28,24Zm-8,0a3.9521,3.9521,0,0,1,.5669-2.019l5.4521,5.4521A3.9529,3.9529,0,0,1,24,28,4.0045,4.0045,0,0,1,20,24Z" transform="translate(0 0)" fill="red"/> <path d="M14,2a12,12,0,1,0,2,23.82V24a8,8,0,0,1,8-8h1.82A11.9348,11.9348,0,0,0,14,2ZM12,18.5908l-4-4L9.5908,13,12,15.4092,17.4092,10,19,11.5908Z" transform="translate(0 0)"/> <polygon id="inner-path" class="cls-1" points="12 18.591 8 14.591 9.591 13 12 15.409 17.409 10 19 11.591 12 18.591"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

export const partiallyCompletedStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#42BE65"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M23.7642,6.8593l1.2851-1.5315A13.976,13.976,0,0,0,20.8672,2.887l-.6836,1.8776A11.9729,11.9729,0,0,1,23.7642,6.8593Z" transform="translate(0 0)"/> <path d="M27.81,14l1.9677-.4128A13.8888,13.8888,0,0,0,28.14,9.0457L26.4087,10A12.52,12.52,0,0,1,27.81,14Z" transform="translate(0 0)"/> <path d="M20.1836,27.2354l.6836,1.8776a13.976,13.976,0,0,0,4.1821-2.4408l-1.2851-1.5315A11.9729,11.9729,0,0,1,20.1836,27.2354Z" transform="translate(0 0)"/> <path d="M26.4087,22,28.14,23a14.14,14.14,0,0,0,1.6382-4.5872L27.81,18.0659A12.1519,12.1519,0,0,1,26.4087,22Z" transform="translate(0 0)"/> <path d="M16,30V2a14,14,0,0,0,0,28Z" transform="translate(0 0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

export const errorStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" transform="translate(0 0.50293)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <rect x="4" y="4.50293" width="8" height="8" fill="black"/> <rect width="16" height="16" transform="translate(0 0.50293)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M7.99998 1.50306C7.07913 1.49735 6.16631 1.67452 5.31446 2.02428C4.4626 2.37404 3.68866 2.88944 3.03751 3.54059C2.38636 4.19174 1.87096 4.96568 1.5212 5.81754C1.17143 6.6694 0.994272 7.58222 0.999981 8.50306C0.994272 9.42391 1.17143 10.3367 1.5212 11.1886C1.87096 12.0404 2.38636 12.8144 3.03751 13.4655C3.68866 14.1167 4.4626 14.6321 5.31446 14.9818C6.16631 15.3316 7.07913 15.5088 7.99998 15.5031C8.92083 15.5088 9.83365 15.3316 10.6855 14.9818C11.5374 14.6321 12.3113 14.1167 12.9625 13.4655C13.6136 12.8144 14.129 12.0404 14.4788 11.1886C14.8285 10.3367 15.0057 9.42391 15 8.50306C15.0057 7.58222 14.8285 6.6694 14.4788 5.81754C14.129 4.96568 13.6136 4.19174 12.9625 3.54059C12.3113 2.88944 11.5374 2.37404 10.6855 2.02428C9.83365 1.67452 8.92083 1.49735 7.99998 1.50306ZM10.7224 12.0031L4.49998 5.78091L5.27783 5.00306L11.5 11.2255L10.7224 12.0031Z" fill="#FA4D56"/> </svg>`
  );

export const progressStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" transform="translate(0 0.503906)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <rect width="16" height="16" transform="translate(0 0.503906)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M8 1.50391C6.61553 1.50391 5.26216 1.91445 4.11101 2.68362C2.95987 3.45279 2.06266 4.54604 1.53285 5.82512C1.00303 7.10421 0.86441 8.51167 1.13451 9.86954C1.4046 11.2274 2.07129 12.4747 3.05026 13.4537C4.02922 14.4326 5.2765 15.0993 6.63437 15.3694C7.99224 15.6395 9.3997 15.5009 10.6788 14.9711C11.9579 14.4412 13.0511 13.544 13.8203 12.3929C14.5895 11.2418 15 9.88838 15 8.50391C14.9979 6.64803 14.2597 4.86877 12.9474 3.55647C11.6351 2.24417 9.85588 1.506 8 1.50391ZM8 14.5039C6.4087 14.5039 4.88258 13.8718 3.75736 12.7465C2.63214 11.6213 2 10.0952 2 8.50391C2 6.91261 2.63214 5.38648 3.75736 4.26127C4.88258 3.13605 6.4087 2.50391 8 2.50391V8.50391L12.2406 12.7446C11.6845 13.3027 11.0236 13.7454 10.2958 14.0473C9.56809 14.3492 8.78788 14.5044 8 14.5039Z" fill="#4589FF"/> </svg>`
  );
export const pendingStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="16" height="16" transform="translate(0.285645 0.503906)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/>
<rect width="16" height="16" transform="translate(0.285645 0.503906)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/>
<rect width="16" height="16" transform="translate(0.285645 0.503906)" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/>
<path d="M4.78565 9.50391C5.33793 9.50391 5.78565 9.05619 5.78565 8.50391C5.78565 7.95162 5.33793 7.50391 4.78565 7.50391C4.23336 7.50391 3.78565 7.95162 3.78565 8.50391C3.78565 9.05619 4.23336 9.50391 4.78565 9.50391Z" fill="#6F6F6F"/>
<path d="M11.7856 9.50391C12.3379 9.50391 12.7856 9.05619 12.7856 8.50391C12.7856 7.95162 12.3379 7.50391 11.7856 7.50391C11.2334 7.50391 10.7856 7.95162 10.7856 8.50391C10.7856 9.05619 11.2334 9.50391 11.7856 9.50391Z" fill="#6F6F6F"/>
<path d="M8.28565 9.50391C8.83793 9.50391 9.28565 9.05619 9.28565 8.50391C9.28565 7.95162 8.83793 7.50391 8.28565 7.50391C7.73336 7.50391 7.28565 7.95162 7.28565 8.50391C7.28565 9.05619 7.73336 9.50391 8.28565 9.50391Z" fill="#6F6F6F"/>
<path d="M8.28565 15.5039C6.90118 15.5039 5.5478 15.0934 4.39666 14.3242C3.24551 13.555 2.3483 12.4618 1.81849 11.1827C1.28868 9.90361 1.15005 8.49614 1.42015 7.13828C1.69025 5.78041 2.35693 4.53313 3.3359 3.55416C4.31487 2.57519 5.56215 1.90851 6.92002 1.63841C8.27788 1.36832 9.68535 1.50694 10.9644 2.03675C12.2435 2.56657 13.3368 3.46377 14.1059 4.61492C14.8751 5.76606 15.2856 7.11944 15.2856 8.50391C15.2836 10.3598 14.5454 12.139 13.2331 13.4513C11.9208 14.7636 10.1415 15.5018 8.28565 15.5039ZM8.28565 2.50391C7.09896 2.50391 5.93892 2.8558 4.95223 3.51509C3.96553 4.17438 3.1965 5.11145 2.74237 6.20781C2.28824 7.30417 2.16942 8.51056 2.40094 9.67445C2.63245 10.8383 3.20389 11.9074 4.04301 12.7465C4.88212 13.5857 5.95122 14.1571 7.11511 14.3886C8.27899 14.6201 9.48539 14.5013 10.5817 14.0472C11.6781 13.5931 12.6152 12.824 13.2745 11.8373C13.9338 10.8506 14.2856 9.6906 14.2856 8.50391C14.2838 6.91317 13.6511 5.3881 12.5263 4.26327C11.4015 3.13845 9.87639 2.50572 8.28565 2.50391Z" fill="#6F6F6F"/>
</svg>`
  );

export const warningStatusIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16" height="17" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve" fill="#f1c21b"> <style type="text/css"> .st0{fill:none;} .st1{opacity:0;fill-opacity:0;} </style> <rect id="Transparent_Rectangle" class="st0" width="32" height="32"/> <path id="Compound_Path" d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25 c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"/> <path id="inner-path" class="st1" d="M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22 C16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z"/> </svg>`
  );

export const unknownStatusIcon = () => "";

// *--- END OF STATUS ICONS ---*

// *--- CONTENT SWITCHER ICONS ---*

export const gridIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M6 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V6C2 6.26522 2.10536 6.51957 2.29289 6.70711C2.48043 6.89464 2.73478 7 3 7H6C6.26522 7 6.51957 6.89464 6.70711 6.70711C6.89464 6.51957 7 6.26522 7 6V3C7 2.73478 6.89464 2.48043 6.70711 2.29289C6.51957 2.10536 6.26522 2 6 2ZM6 6H3V3H6V6Z" fill="currentColor"/> <path d="M13 2H10C9.73478 2 9.48043 2.10536 9.29289 2.29289C9.10536 2.48043 9 2.73478 9 3V6C9 6.26522 9.10536 6.51957 9.29289 6.70711C9.48043 6.89464 9.73478 7 10 7H13C13.2652 7 13.5196 6.89464 13.7071 6.70711C13.8946 6.51957 14 6.26522 14 6V3C14 2.73478 13.8946 2.48043 13.7071 2.29289C13.5196 2.10536 13.2652 2 13 2ZM13 6H10V3H13V6Z" fill="currentColor"/> <path d="M6 9H3C2.73478 9 2.48043 9.10536 2.29289 9.29289C2.10536 9.48043 2 9.73478 2 10V13C2 13.2652 2.10536 13.5196 2.29289 13.7071C2.48043 13.8946 2.73478 14 3 14H6C6.26522 14 6.51957 13.8946 6.70711 13.7071C6.89464 13.5196 7 13.2652 7 13V10C7 9.73478 6.89464 9.48043 6.70711 9.29289C6.51957 9.10536 6.26522 9 6 9ZM6 13H3V10H6V13Z" fill="currentColor"/> <path d="M13 9H10C9.73478 9 9.48043 9.10536 9.29289 9.29289C9.10536 9.48043 9 9.73478 9 10V13C9 13.2652 9.10536 13.5196 9.29289 13.7071C9.48043 13.8946 9.73478 14 10 14H13C13.2652 14 13.5196 13.8946 13.7071 13.7071C13.8946 13.5196 14 13.2652 14 13V10C14 9.73478 13.8946 9.48043 13.7071 9.29289C13.5196 9.10536 13.2652 9 13 9ZM13 13H10V10H13V13Z" fill="currentColor"/> </svg> `
  );

export const listIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M14 3H5V4H14V3Z" fill="currentColor"/> <path d="M14 12H5V13H14V12Z" fill="currentColor"/> <path d="M14 7.5H5V8.5H14V7.5Z" fill="currentColor"/> <path d="M3 7.5H2V8.5H3V7.5Z" fill="currentColor"/> <path d="M3 3H2V4H3V3Z" fill="currentColor"/> <path d="M3 12H2V13H3V12Z" fill="currentColor"/> </svg> `
  );
// *--- END OF CONTENT SWITCHER ICONS ---*

// *--- ACTION BAR ICONS ---*
export const launchIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <title>launch</title><path d="M26,28H6a2.0027,2.0027,0,0,1-2-2V6A2.0027,2.0027,0,0,1,6,4H16V6H6V26H26V16h2V26A2.0027,2.0027,0,0,1,26,28Z"/> <polygon points="20 2 20 4 26.586 4 18 12.586 19.414 14 28 5.414 28 12 30 12 30 2 20 2"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const saveIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>save</title><path d="M27.71,9.29l-5-5A1,1,0,0,0,22,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V10A1,1,0,0,0,27.71,9.29ZM12,6h8v4H12Zm8,20H12V18h8Zm2,0V18a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2v8H6V6h4v4a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V6.41l4,4V26Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const checkmarkIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <polygon points="13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const editIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_7917_164172)"> <rect width="16" height="16" transform="translate(0.5)" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M15.5 13H1.5V14H15.5V13Z" fill="currentColor"/> <path d="M13.2 4.5C13.6 4.1 13.6 3.5 13.2 3.1L11.4 1.3C11 0.9 10.4 0.9 10 1.3L2.5 8.8V12H5.7L13.2 4.5ZM10.7 2L12.5 3.8L11 5.3L9.2 3.5L10.7 2ZM3.5 11V9.2L8.5 4.2L10.3 6L5.3 11H3.5Z" fill="currentColor"/> </g> <defs> <clipPath id="clip0_7917_164172"> <rect width="16" height="16" fill="currentColor" transform="translate(0.5)"/> </clipPath> </defs> </svg> `
  );

export const downloadIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_7917_164179)"> <rect width="16" height="16" transform="translate(0.5)" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M13.5 12V14H3.5V12H2.5V14C2.5 14.2652 2.60536 14.5196 2.79289 14.7071C2.98043 14.8946 3.23478 15 3.5 15H13.5C13.7652 15 14.0196 14.8946 14.2071 14.7071C14.3946 14.5196 14.5 14.2652 14.5 14V12H13.5Z" fill="currentColor"/> <path d="M13.5 7L12.795 6.295L9 10.085V1H8V10.085L4.205 6.295L3.5 7L8.5 12L13.5 7Z" fill="currentColor"/> </g> <defs> <clipPath id="clip0_7917_164179"> <rect width="16" height="16" fill="currentColor" transform="translate(0.5)"/> </clipPath> </defs> </svg> `
  );

export const documentDownloadIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <title>document--download</title> <polygon points="30 25 28.586 23.586 26 26.172 26 18 24 18 24 26.172 21.414 23.586 20 25 25 30 30 25"/> <path d="M18,28H8V4h8v6a2.0058,2.0058,0,0,0,2,2h6v3l2,0V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,18,2H8A2.0058,2.0058,0,0,0,6,4V28a2.0058,2.0058,0,0,0,2,2H18ZM18,4.4,23.6,10H18Z"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg> `
  );

export const scriptIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>script</title><polygon points="18.83 26 21.41 23.42 20 22 16 26 20 30 21.42 28.59 18.83 26"/><polygon points="27.17 26 24.59 28.58 26 30 30 26 26 22 24.58 23.41 27.17 26"/><path d="M14,28H8V4h8v6a2.0058,2.0058,0,0,0,2,2h6v6h2V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,18,2H8A2.0058,2.0058,0,0,0,6,4V28a2.0058,2.0058,0,0,0,2,2h6ZM18,4.4,23.6,10H18Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const resetIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>reset</title><path d="M18,28A12,12,0,1,0,6,16v6.2L2.4,18.6,1,20l6,6,6-6-1.4-1.4L8,22.2V16H8A10,10,0,1,1,18,26Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const shareIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_7917_164186)"> <rect width="16" height="16" transform="translate(0.5)" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M11.9998 10.0001C11.6256 10.002 11.2565 10.0879 10.9199 10.2514C10.5833 10.415 10.2876 10.652 10.0548 10.9451L6.39985 8.6601C6.53306 8.23018 6.53306 7.77002 6.39985 7.3401L10.0548 5.0551C10.4258 5.51446 10.9474 5.82769 11.5272 5.93931C12.107 6.05092 12.7076 5.95372 13.2226 5.66491C13.7376 5.37611 14.1338 4.91435 14.3409 4.36143C14.548 3.8085 14.5528 3.20011 14.3543 2.64402C14.1558 2.08793 13.767 1.62003 13.2565 1.32322C12.7461 1.0264 12.1471 0.919827 11.5656 1.02237C10.9841 1.12491 10.4577 1.42996 10.0796 1.88346C9.70152 2.33697 9.49613 2.90966 9.49985 3.5001C9.50221 3.72369 9.53587 3.94585 9.59985 4.1601L5.94485 6.4451C5.62217 6.03889 5.18112 5.74313 4.68282 5.5988C4.18453 5.45447 3.65368 5.46873 3.16385 5.63961C2.67403 5.81048 2.24949 6.1295 1.94909 6.55245C1.64869 6.9754 1.4873 7.48133 1.4873 8.0001C1.4873 8.51888 1.64869 9.0248 1.94909 9.44775C2.24949 9.8707 2.67403 10.1897 3.16385 10.3606C3.65368 10.5315 4.18453 10.5457 4.68282 10.4014C5.18112 10.2571 5.62217 9.96131 5.94485 9.5551L9.59985 11.8401C9.53587 12.0544 9.50221 12.2765 9.49985 12.5001C9.49985 12.9946 9.64647 13.4779 9.92117 13.889C10.1959 14.3002 10.5863 14.6206 11.0431 14.8098C11.5 14.999 12.0026 15.0485 12.4876 14.9521C12.9725 14.8556 13.418 14.6175 13.7676 14.2679C14.1172 13.9182 14.3553 13.4728 14.4518 12.9878C14.5483 12.5029 14.4988 12.0002 14.3095 11.5434C14.1203 11.0866 13.7999 10.6961 13.3888 10.4214C12.9776 10.1467 12.4943 10.0001 11.9998 10.0001ZM11.9998 2.0001C12.2965 2.0001 12.5865 2.08808 12.8332 2.2529C13.0799 2.41772 13.2721 2.65199 13.3857 2.92608C13.4992 3.20017 13.5289 3.50177 13.471 3.79274C13.4131 4.08371 13.2703 4.35098 13.0605 4.56076C12.8507 4.77054 12.5835 4.9134 12.2925 4.97128C12.0015 5.02916 11.6999 4.99945 11.4258 4.88592C11.1517 4.77239 10.9175 4.58013 10.7526 4.33346C10.5878 4.08678 10.4998 3.79677 10.4998 3.5001C10.4998 3.10228 10.6579 2.72075 10.9392 2.43944C11.2205 2.15814 11.602 2.0001 11.9998 2.0001ZM3.99985 9.5001C3.70318 9.5001 3.41317 9.41213 3.16649 9.24731C2.91982 9.08248 2.72756 8.84822 2.61403 8.57413C2.5005 8.30004 2.47079 7.99844 2.52867 7.70747C2.58655 7.4165 2.72941 7.14922 2.93919 6.93944C3.14897 6.72966 3.41624 6.5868 3.70721 6.52892C3.99818 6.47105 4.29978 6.50075 4.57387 6.61428C4.84796 6.72781 5.08223 6.92007 5.24705 7.16675C5.41187 7.41342 5.49985 7.70343 5.49985 8.0001C5.49985 8.39793 5.34181 8.77946 5.06051 9.06076C4.7792 9.34207 4.39767 9.5001 3.99985 9.5001ZM11.9998 14.0001C11.7032 14.0001 11.4132 13.9121 11.1665 13.7473C10.9198 13.5825 10.7276 13.3482 10.614 13.0741C10.5005 12.8 10.4708 12.4984 10.5287 12.2075C10.5865 11.9165 10.7294 11.6492 10.9392 11.4394C11.149 11.2297 11.4162 11.0868 11.7072 11.0289C11.9982 10.971 12.2998 11.0008 12.5739 11.1143C12.848 11.2278 13.0822 11.4201 13.2471 11.6667C13.4119 11.9134 13.4998 12.2034 13.4998 12.5001C13.4998 12.8979 13.3418 13.2795 13.0605 13.5608C12.7792 13.8421 12.3977 14.0001 11.9998 14.0001Z" fill="currentColor"/> </g> <defs> <clipPath id="clip0_7917_164186"> <rect width="16" height="16" fill="currentColor" transform="translate(0.5)"/> </clipPath> </defs> </svg> `
  );

export const replicateIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M28,8h2V4a2.0021,2.0021,0,0,0-2-2H24V4h4Z" transform="translate(0 0)"/> <rect x="17" y="2" width="4" height="2"/> <rect x="28" y="11" width="2" height="4"/> <path d="M28,18v4H24V10a2.0023,2.0023,0,0,0-2-2H10V4h4V2H10A2.0023,2.0023,0,0,0,8,4V8H4a2.0023,2.0023,0,0,0-2,2V28a2.0023,2.0023,0,0,0,2,2H22a2.0023,2.0023,0,0,0,2-2V24h4a2.0023,2.0023,0,0,0,2-2V18ZM22,28H4V10H22Z" transform="translate(0 0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>`
  );

export const demoteIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_8020_23275)"> <rect width="16" height="16" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M10 5H3.90745L5.70115 3.20705L5 2.5L2 5.5L5 8.5L5.70115 7.7927L3.90895 6H10C10.7956 6 11.5587 6.31607 12.1213 6.87868C12.6839 7.44129 13 8.20435 13 9C13 9.79565 12.6839 10.5587 12.1213 11.1213C11.5587 11.6839 10.7956 12 10 12H6V13H10C11.0609 13 12.0783 12.5786 12.8284 11.8284C13.5786 11.0783 14 10.0609 14 9C14 7.93913 13.5786 6.92172 12.8284 6.17157C12.0783 5.42143 11.0609 5 10 5Z" fill="currentColor"/> </g> <defs> <clipPath id="clip0_8020_23275"> <rect width="16" height="16" fill="currentColor"/> </clipPath> </defs> </svg>`
  );

export const modelBuilderIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"> <path fill="currentColor" d="M22,4V7H10V4H2v8h8V9h7.0234A4.9463,4.9463,0,0,0,16,12v8A3.0037,3.0037,0,0,1,13,23H10V20H2v8h8V25H13A5.0062,5.0062,0,0,0,18,20V12a2.9982,2.9982,0,0,1,2.9971-3H22v3h8V4ZM8,10H4V6H8ZM8,26H4V22H8ZM28,10H24V6h4Z"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" fill="none" width="32" height="32"/> </svg>`
  );

export const dashboardIcon2 = (attrs) =>
  svgIcon(
    attrs,
    `<svg fill="currentColor" id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="24" y="21" width="2" height="5"/><rect x="20" y="16" width="2" height="10"/><path d="M11,26a5.0059,5.0059,0,0,1-5-5H8a3,3,0,1,0,3-3V16a5,5,0,0,1,0,10Z"/><path d="M28,2H4A2.002,2.002,0,0,0,2,4V28a2.0023,2.0023,0,0,0,2,2H28a2.0027,2.0027,0,0,0,2-2V4A2.0023,2.0023,0,0,0,28,2Zm0,9H14V4H28ZM12,4v7H4V4ZM4,28V13H28.0007l.0013,15Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" fill="none" width="32" height="32"/></svg>`
  );
// *--- END OF ACTION BAR ICONS ---*

export const fineTuneIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_7917_164192)"> <rect width="16" height="16" fill="currentColor" fill-opacity="0.01" style="mix-blend-mode:multiply"/> <path d="M12 15V12.95C13.15 12.7 14 11.7 14 10.5C14 9.3 13.15 8.3 12 8.05V1H11V8.05C9.85 8.3 9 9.3 9 10.5C9 11.7 9.85 12.7 11 12.95V15H12ZM10 10.5C10 9.65 10.65 9 11.5 9C12.35 9 13 9.65 13 10.5C13 11.35 12.35 12 11.5 12C10.65 12 10 11.35 10 10.5Z" fill="currentColor"/> <path d="M4 1V3.05C2.85 3.3 2 4.3 2 5.5C2 6.7 2.85 7.7 4 7.95V15H5V7.95C6.15 7.7 7 6.7 7 5.5C7 4.3 6.15 3.3 5 3.05V1H4ZM6 5.5C6 6.35 5.35 7 4.5 7C3.65 7 3 6.35 3 5.5C3 4.65 3.65 4 4.5 4C5.35 4 6 4.65 6 5.5Z" fill="currentColor"/> </g> <defs> <clipPath id="clip0_7917_164192"> <rect width="16" height="16" fill="currentColor"/> </clipPath> </defs> </svg> `
  );

export const expiredIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" > {" "} <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply" />{" "} <rect width="16" height="16" fill="white" fill-opacity="0.01" style="mix-blend-mode:multiply" />{" "} <path d="M8 1C4.15 1 1 4.15 1 8C1 11.85 4.15 15 8 15C11.85 15 15 11.85 15 8C15 4.15 11.85 1 8 1ZM7.45 4H8.55V9.5H7.45V4ZM8 12.5C7.6 12.5 7.25 12.15 7.25 11.75C7.25 11.35 7.6 11 8 11C8.4 11 8.75 11.35 8.75 11.75C8.75 12.15 8.4 12.5 8 12.5Z" fill="#FA4D56" />{" "} </svg>`
  );

export const feedbackIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"> <defs> <style> .cls-1 { fill: none; } .cls-1, .cls-2 { stroke-width: 0px; } </style> </defs> <path class="cls-2" d="m19,3h10c1.1035,0,2,.8965,2,2v6c0,1.1035-.8965,2-2,2h-2.4229s-1.7314,3-1.7314,3l-1.7324-1,2.3096-4h3.5771s0-6,0-6h-10s0,6,0,6h3v2h-3c-1.1035,0-2-.8965-2-2v-6c0-1.1035.8965-2,2-2Z"/> <path class="cls-2" d="m15,30h-2v-5c-.0018-1.6561-1.3439-2.9982-3-3h-4c-1.6561.0018-2.9982,1.3439-3,3v5H1v-5c.0033-2.7601,2.2399-4.9967,5-5h4c2.7601.0033,4.9967,2.2399,5,5v5Z"/> <path class="cls-2" d="m8,10c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3-3-1.3431-3-3c.0019-1.6561,1.3439-2.9981,3-3m0-2c-2.7614,0-5,2.2386-5,5s2.2386,5,5,5,5-2.2386,5-5-2.2386-5-5-5Z"/> <rect id="_Transparent_Rectangle_" data-name="&amp;lt;Transparent Rectangle&amp;gt;" class="cls-1" width="32" height="32" transform="translate(32 32) rotate(180)"/> </svg>`
  );

export const mapIcon = (attrs) =>
  svgIcon(
    attrs,
    `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><defs><style>.cls-1{fill:none;}</style></defs><title>map</title><path d="M16,24l-6.09-8.6A8.14,8.14,0,0,1,16,2a8.08,8.08,0,0,1,8,8.13,8.2,8.2,0,0,1-1.8,5.13ZM16,4a6.07,6.07,0,0,0-6,6.13,6.19,6.19,0,0,0,1.49,4L16,20.52,20.63,14A6.24,6.24,0,0,0,22,10.13,6.07,6.07,0,0,0,16,4Z" transform="translate(0 0)"/><circle cx="16" cy="9" r="2"/><path d="M28,12H26v2h2V28H4V14H6V12H4a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V14A2,2,0,0,0,28,12Z" transform="translate(0 0)"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  );

export const quickStartIcon1 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern1)"/>
<defs>
<pattern id="pattern1" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2089_14967" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2089_14967" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const quickStartIcon2 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern2)"/>
<defs>
<pattern id="pattern2" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2089_14967" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2089_14967" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const quickStartIcon3 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern3)"/>
<defs>
<pattern id="pattern3" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2488_4204" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2488_4204" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const quickStartIcon4 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern4)"/>
<defs>
<pattern id="pattern4" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2488_3417" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2488_3417" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const quickStartIcon5 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern5)"/>
<defs>
<pattern id="pattern5" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2488_7674" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2488_7674" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const quickStartIcon6 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" fill="url(#pattern6)"/>
<defs>
<pattern id="pattern6" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2488_6724" transform="scale(0.00625)"/>
</pattern>
<image id="image0_2488_6724" width="160" height="160" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;
