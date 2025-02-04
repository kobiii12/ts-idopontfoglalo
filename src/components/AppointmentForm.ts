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
    const formContainer = document.createElement("div");
    formContainer.className = "appointment-form";

    const title = document.createElement("h2");
    title.textContent = `Időpontfoglalás: ${this.hairdresser.name}`;
    formContainer.appendChild(title);

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Válassz dátumot:";
    formContainer.appendChild(dateLabel);

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.required = true;
    formContainer.appendChild(dateInput);

    const timeslotsContainer = document.createElement("div");
    timeslotsContainer.className = "timeslots-container";
    formContainer.appendChild(timeslotsContainer);

    dateInput.addEventListener("change", async () => {
      timeslotsContainer.innerHTML = "";
      if (dateInput.value) {
        const availableSlots = this.getAvailableTimeSlots(dateInput.value);
        let takenSlots: string[] = [];
        try {
          const appointments = await ApiClient.getAppointments();
          takenSlots = appointments
            .filter(app => app.hairdresser_id === this.hairdresser.id && app.appointment_date.startsWith(dateInput.value))
            .map(app => app.appointment_date.split(" ")[1].slice(0, 5));
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
        availableSlots.forEach(slot => {
          const slotButton = document.createElement("button");
          slotButton.textContent = slot;
          slotButton.className = "timeslot-button";
          if (takenSlots.includes(slot)) {
            slotButton.disabled = true;
            slotButton.classList.add("taken");
            slotButton.title = "Ez az időpont már foglalt";
          } else {
            slotButton.addEventListener("click", () => {
              timeslotsContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));
              slotButton.classList.add("selected");
              timeslotsContainer.setAttribute("data-selected-slot", slot);
            });
          }
          timeslotsContainer.appendChild(slotButton);
        });
      }
    });

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Név:";
    formContainer.appendChild(nameLabel);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.required = true;
    formContainer.appendChild(nameInput);

    const phoneLabel = document.createElement("label");
    phoneLabel.textContent = "Telefonszám:";
    formContainer.appendChild(phoneLabel);

    const phoneInput = document.createElement("input");
    phoneInput.type = "tel";
    phoneInput.required = true;
    formContainer.appendChild(phoneInput);

    const serviceLabel = document.createElement("label");
    serviceLabel.textContent = "Szolgáltatás:";
    formContainer.appendChild(serviceLabel);

    const serviceSelect = document.createElement("select");
    this.hairdresser.services.forEach(s => {
      const option = document.createElement("option");
      option.value = s;
      option.textContent = s;
      serviceSelect.appendChild(option);
    });
    formContainer.appendChild(serviceSelect);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Lefoglalom";
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
        console.error("Error checking conflicts:", error);
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
        alert("Időpont foglalás sikeres!");
        this.onSuccess();
      } catch (error) {
        alert("Hiba történt az időpont foglalás során.");
        console.error(error);
      }
    });
    formContainer.appendChild(submitButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Mégse";
    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.onCancel();
    });
    formContainer.appendChild(cancelButton);

    return formContainer;
  }

  private getAvailableTimeSlots(date: string): string[] {
    let startHour = 9;
    let endHour = 17;
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