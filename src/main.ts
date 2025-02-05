import { UserInterface } from "./views/UserInterface.js";

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UserInterface("app");
  ui.init();
});