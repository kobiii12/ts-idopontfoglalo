import { Hairdresser } from "../models/Hairdresser.js";
import { createEl } from "../utils/dom.js";

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
    const container = createEl("div", { className: "hairdresser-box" });
    const nameEl = createEl("h3", { text: this.hairdresser.name });
    container.appendChild(nameEl);
    if (this.hairdresser.work_start_time && this.hairdresser.work_end_time) {
      const hoursEl = createEl("p", { text: `Munkaidő: ${this.hairdresser.work_start_time.slice(0, 5)} - ${this.hairdresser.work_end_time.slice(0, 5)}` });
      container.appendChild(hoursEl);
    }
    const selectButton = createEl("button", { text: "Időpontfoglalás" });
    selectButton.addEventListener("click", () => this.onSelect(this.hairdresser));
    container.appendChild(selectButton);
    return container;
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}