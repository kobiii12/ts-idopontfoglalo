import { createEl } from "../utils/dom.js";
import { Hairdresser } from "../models/Hairdresser.js";
import { Appointment } from "../models/Appointment.js";
import { ApiClient } from "../api/ApiClient.js";

export class AppointmentForm {
  private hairdresser: Hairdresser;
  private container: HTMLElement;
  private onSuccess: () => void;
  private onCancel: () => void;

  constructor(hairdresser: Hairdresser, onSuccess: () => void, onCancel: () => void) {
    this.hairdresser = hairdresser;
    this.onSuccess = onSuccess;
    this.onCancel = onCancel;
    this.container = this.createForm();
  }

  private createForm(): HTMLElement {
    const formContainer = createEl("div", { className: "appointment-form" });
    const title = createEl("h2", { text: `Időpontfoglalás: ${this.hairdresser.name}` });
    formContainer.appendChild(title);

    const createInput = (labelText: string, type: string, placeholder?: string): HTMLInputElement => {
      const label = createEl("label", { text: labelText });
      formContainer.appendChild(label);
      const input = createEl("input", { attributes: { type, placeholder: placeholder || "" } }) as HTMLInputElement;
      input.required = true;
      formContainer.appendChild(input);
      return input;
    };

    const dateInput = createInput("Válassz dátumot:", "date");

    const timeslotsContainer = createEl("div", { className: "timeslots-container" });
    formContainer.appendChild(timeslotsContainer);

    dateInput.addEventListener("change", async () => {
      timeslotsContainer.innerHTML = "";
      if (dateInput.value) {
        const availableSlots = this.getAvailableTimeSlots(dateInput.value);
        let takenSlots: string[] = [];
        try {
          const appointments = await ApiClient.getAppointments();
          takenSlots = appointments
            .filter(app =>
              Number(app.hairdresser_id) === this.hairdresser.id &&
              app.appointment_date.startsWith(dateInput.value)
            )
            .map(app => app.appointment_date.split(" ")[1].slice(0, 5));
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
        availableSlots.forEach(slot => {
          const tile = createEl("div", { className: "timeslot-tile", text: slot });
          if (takenSlots.includes(slot)) {
            tile.classList.add("taken");
          } else {
            tile.classList.add("available");
            tile.addEventListener("click", () => {
              const allTiles = timeslotsContainer.querySelectorAll(".timeslot-tile");
              allTiles.forEach(t => t.classList.remove("selected"));
              tile.classList.add("selected");
              timeslotsContainer.setAttribute("data-selected-slot", slot);
            });
          }
          timeslotsContainer.appendChild(tile);
        });
      }
    });

    const nameInput = createInput("Név:", "text");
    const phoneInput = createInput("Telefonszám:", "tel");

    const serviceLabel = createEl("label", { text: "Szolgáltatás:" });
    formContainer.appendChild(serviceLabel);
    const serviceSelect = createEl("select") as HTMLSelectElement;
    this.hairdresser.services.forEach(s => {
      const option = createEl("option", { text: s });
      option.value = s;
      serviceSelect.appendChild(option);
    });
    formContainer.appendChild(serviceSelect);

    const buttonsContainer = createEl("div", { className: "form-buttons" });
    const submitButton = createEl("button", { text: "Lefoglalom" });
    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const selectedSlot = timeslotsContainer.getAttribute("data-selected-slot");
      if (!dateInput.value || !selectedSlot || !nameInput.value || !phoneInput.value) {
        alert("Kérlek tölts ki minden mezőt és válassz időpontot.");
        return;
      }
      try {
        const appointments = await ApiClient.getAppointments();
        const conflict = appointments.some(app =>
          app.hairdresser_id === this.hairdresser.id &&
          app.appointment_date === `${dateInput.value} ${selectedSlot}:00`
        );
        if (conflict) {
          alert("Ez az időpont már foglalt. Válassz másikat.");
          return;
        }
      } catch (error) {
        console.error("Hiba az ellenőrzés során:", error);
      }
      const appointmentDate = `${dateInput.value} ${selectedSlot}:00`;
      const appointment: Appointment = {
        hairdresser_id: this.hairdresser.id,
        customer_name: nameInput.value,
        customer_phone: phoneInput.value,
        appointment_date: appointmentDate,
        service: serviceSelect.value
      };
      try {
        await ApiClient.createAppointment(appointment);
        alert("Foglalásod rögzítettük!");
        this.onSuccess();
      } catch (error) {
        alert("Hiba történt az időpont foglalás során.");
        console.error(error);
      }
    });
    buttonsContainer.appendChild(submitButton);

    const cancelButton = createEl("button", { text: "Mégse" });
    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.onCancel();
    });
    buttonsContainer.appendChild(cancelButton);

    formContainer.appendChild(buttonsContainer);

    return formContainer;
  }

  private getAvailableTimeSlots(date: string): string[] {
    let startHour = 9, endHour = 17;
    if (this.hairdresser.work_start_time && this.hairdresser.work_end_time) {
      const [startH] = this.hairdresser.work_start_time.split(":").map(Number);
      const [endH] = this.hairdresser.work_end_time.split(":").map(Number);
      startHour = startH;
      endHour = endH;
    }
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(this.formatTime(hour, 0));
      slots.push(this.formatTime(hour, 30));
    }
    return slots;
  }

  private formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}