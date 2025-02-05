import { AdminInterface } from "./views/AdminInterface.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminUI = new AdminInterface("adminApp");
  adminUI.init();
});