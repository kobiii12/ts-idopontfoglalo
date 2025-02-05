import { ApiClient } from "../api/ApiClient.js";
import { Hairdresser } from "../models/Hairdresser.js";
import { HairdresserBox } from "../components/HairdresserBox.js";
import { AppointmentForm } from "../components/AppointmentForm.js";

export class UserInterface {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`A "${containerId}" ID-jú elem nem található..`);
    }
    this.container = container;
  }

  public async init(): Promise<void> {
    this.renderHairdressers();
  }

  private async renderHairdressers(): Promise<void> {
    this.container.innerHTML = "<h1>Időpontfoglalás</h1>";
    let hairdressers: Hairdresser[] = [];
    try {
      hairdressers = await ApiClient.getHairdressers();
    } catch (error) {
      this.container.innerHTML += "<p>Hiba történt a fodrászok betöltése során.</p>";
      console.error(error);
      return;
    }
    const listContainer = document.createElement("div");
    listContainer.className = "hairdresser-list";
    hairdressers.forEach(hairdresser => {
      const box = new HairdresserBox(hairdresser, (selectedHairdresser) => {
        this.renderAppointmentForm(selectedHairdresser);
      });
      listContainer.appendChild(box.getElement());
    });
    this.container.appendChild(listContainer);
  }

  private renderAppointmentForm(hairdresser: Hairdresser): void {
    this.container.innerHTML = "";
    const form = new AppointmentForm(hairdresser, () => {
      this.renderConfirmation();
    }, () => {
      this.renderHairdressers();
    });
    this.container.appendChild(form.getElement());
  }

  private renderConfirmation(): void {
    this.container.innerHTML = "<h2>Foglalásod megerősítettük!</h2>";
    const backButton = document.createElement("button");
    backButton.textContent = "Vissza a főoldalra";
    backButton.addEventListener("click", () => {
      this.renderHairdressers();
    });
    this.container.appendChild(backButton);
  }
}