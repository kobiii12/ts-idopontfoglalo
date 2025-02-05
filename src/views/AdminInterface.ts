import { AppointmentList } from "../components/AppointmentList.js";

export class AdminInterface {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`A "${containerId}" ID-jú elem nem található.`);
    }
    this.container = container;
  }

  public async init(): Promise<void> {
    this.container.innerHTML = "";
    const appointmentList = new AppointmentList();
    await appointmentList.init();
    this.container.appendChild(appointmentList.getElement());
  }
}