import { Appointment } from "../models/Appointment.js";
import { Hairdresser } from "../models/Hairdresser.js";
import { ApiClient } from "../api/ApiClient.js";

export class AppointmentList {
  private container: HTMLElement;
  private hairdressers: Hairdresser[] = [];
  private appointments: Appointment[] = [];

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "appointment-list-admin";
  }

  public async init(): Promise<void> {
    this.container.innerHTML = "<h1>Admin Felület - Foglalások </h1>";
    try {
      this.hairdressers = await ApiClient.getHairdressers();
    } catch (error) {
      this.container.innerHTML += "<p>Hiba történt a fodrászok lekérdezése során.</p>";
      return;
    }
    await this.loadAppointments();
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

  private renderList() {
    const existingList = this.container.querySelector(".appointments-container");
    if (existingList) {
      existingList.remove();
    }
    
    const listContainer = document.createElement("div");
    listContainer.className = "appointments-container";
    
    if (this.appointments.length === 0) {
      const noData = document.createElement("p");
      noData.textContent = "Nincsenek foglalások.";
      listContainer.appendChild(noData);
    } else {
      this.appointments.forEach(app => {
        const card = document.createElement("div");
        card.className = "appointment-card";
        
        const hd = this.hairdressers.find(h => h.id === Number(app.hairdresser_id));
        const hdName = hd ? hd.name : "Ismeretlen";
        
        const hdDiv = document.createElement("div");
        hdDiv.textContent = `Fodrász: ${hdName}`;
        card.appendChild(hdDiv);
        
        const dateDiv = document.createElement("div");
        dateDiv.textContent = `Dátum és idő: ${app.appointment_date}`;
        card.appendChild(dateDiv);
        
        const nameDiv = document.createElement("div");
        nameDiv.textContent = `Ügyfél: ${app.customer_name}`;
        card.appendChild(nameDiv);
        
        const phoneDiv = document.createElement("div");
        phoneDiv.textContent = `Telefonszám: ${app.customer_phone}`;
        card.appendChild(phoneDiv);
        
        const serviceDiv = document.createElement("div");
        serviceDiv.textContent = `Szolgáltatás: ${app.service}`;
        card.appendChild(serviceDiv);
        
        listContainer.appendChild(card);
      });
    }
    
    this.container.appendChild(listContainer);
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}