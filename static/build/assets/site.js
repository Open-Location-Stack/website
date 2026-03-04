const year = document.getElementById("year");
if (year) {
  year.textContent = String((/* @__PURE__ */ new Date()).getFullYear());
}
