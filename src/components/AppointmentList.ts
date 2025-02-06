import { createEl } from "../utils/dom.js";
import { Appointment } from "../models/Appointment.js";
import { Hairdresser } from "../models/Hairdresser.js";
import { ApiClient } from "../api/ApiClient.js";

export class AppointmentList {
  private container: HTMLElement;
  private hairdressers: Hairdresser[] = [];
  private appointments: Appointment[] = [];
  private filterCustomer: string = "";
  private filterDate: string = "";
  private filterHairdresser: string = "";

  constructor() {
    this.container = createEl("div", { className: "appointment-list-admin" });
  }

  public async init(): Promise<void> {
    this.container.innerHTML = "<h1>Foglalások</h1>";
    try {
      this.hairdressers = await ApiClient.getHairdressers();
    } catch (error) {
      this.container.innerHTML += "<p>Hiba történt a fodrászok lekérdezése során.</p>";
      return;
    }
    await this.loadAppointments();
    this.renderControls();
    this.renderList();
  }

  private async loadAppointments() {
    try {
      this.appointments = await ApiClient.getAppointments();
    } catch (error) {
      console.error("Hiba a foglalások betöltése során:", error);
      this.appointments = [];
    }
  }

  private renderControls() {
    const controlsDiv = createEl("div", { className: "admin-controls" });

    const customerLabel = createEl("label", { text: "Ügyfél név:" });
    controlsDiv.appendChild(customerLabel);
    const customerInput = createEl("input", { attributes: { type: "text", placeholder: "Keresés ügyfél névre..." } }) as HTMLInputElement;
    customerInput.addEventListener("input", () => {
      this.filterCustomer = customerInput.value.trim().toLowerCase();
      this.renderList();
    });
    controlsDiv.appendChild(customerInput);

    const dateLabel = createEl("label", { text: "Dátum:" });
    controlsDiv.appendChild(dateLabel);
    const dateInput = createEl("input", { attributes: { type: "date" } }) as HTMLInputElement;
    dateInput.addEventListener("change", () => {
      this.filterDate = dateInput.value;
      this.renderList();
    });
    controlsDiv.appendChild(dateInput);

    const hdLabel = createEl("label", { text: "Fodrász:" });
    controlsDiv.appendChild(hdLabel);
    const hdSelect = createEl("select") as HTMLSelectElement;
    const allOption = createEl("option", { text: "Összes", attributes: { value: "" } });
    hdSelect.appendChild(allOption);
    this.hairdressers.forEach(hd => {
      const option = createEl("option", { text: hd.name, attributes: { value: hd.id.toString() } });
      hdSelect.appendChild(option);
    });
    hdSelect.addEventListener("change", () => {
      this.filterHairdresser = hdSelect.value;
      this.renderList();
    });
    controlsDiv.appendChild(hdSelect);

    this.container.appendChild(controlsDiv);
  }

  private renderList() {
    const existingList = this.container.querySelector(".appointments-container");
    if (existingList) existingList.remove();

    let filteredAppointments = this.appointments;
    if (this.filterCustomer) {
      filteredAppointments = filteredAppointments.filter(app =>
        app.customer_name.toLowerCase().includes(this.filterCustomer)
      );
    }
    if (this.filterDate) {
      filteredAppointments = filteredAppointments.filter(app =>
        app.appointment_date.startsWith(this.filterDate)
      );
    }
    if (this.filterHairdresser) {
      filteredAppointments = filteredAppointments.filter(app =>
        Number(app.hairdresser_id) === Number(this.filterHairdresser)
      );
    }

    const listContainer = createEl("div", { className: "appointments-container" });
    if (filteredAppointments.length === 0) {
      const noData = createEl("p", { text: "Nincsenek foglalások a megadott szűrőkkel." });
      listContainer.appendChild(noData);
    } else {
      filteredAppointments.forEach(app => {
        const card = createEl("div", { className: "appointment-card" });
        const hd = this.hairdressers.find(h => h.id === Number(app.hairdresser_id));
        const hdName = hd ? hd.name : "Ismeretlen";
        card.appendChild(createEl("div", { text: `Fodrász: ${hdName}` }));
        card.appendChild(createEl("div", { text: `Dátum és idő: ${app.appointment_date}` }));
        card.appendChild(createEl("div", { text: `Ügyfél: ${app.customer_name}` }));
        card.appendChild(createEl("div", { text: `Telefonszám: ${app.customer_phone}` }));
        card.appendChild(createEl("div", { text: `Szolgáltatás: ${app.service}` }));
        listContainer.appendChild(card);
      });
    }
    this.container.appendChild(listContainer);
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}