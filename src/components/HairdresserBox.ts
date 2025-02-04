import { Hairdresser } from "../models/Hairdresser.js";

export class HairdresserBox {
  private hairdresser: Hairdresser;
  private element: HTMLElement;
  private onSelect: (hairdresser: Hairdresser) => void;

  constructor(hairdresser: Hairdresser, onSelect: (hairdresser: Hairdresser) => void) {
    this.hairdresser = hairdresser;
    this.onSelect = onSelect;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const container = document.createElement("div");
    container.className = "hairdresser-box";

    const nameEl = document.createElement("h3");
    nameEl.textContent = this.hairdresser.name;
    container.appendChild(nameEl);

    if (this.hairdresser.work_start_time && this.hairdresser.work_end_time) {
      const hoursEl = document.createElement("p");
      hoursEl.textContent = `Munkaidő: ${this.hairdresser.work_start_time} - ${this.hairdresser.work_end_time}`;
      container.appendChild(hoursEl);
    }

    const selectButton = document.createElement("button");
    selectButton.textContent = "Időpontfoglalás";
    selectButton.addEventListener("click", () => this.onSelect(this.hairdresser));
    container.appendChild(selectButton);

    return container;
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}