import { Hairdresser } from "../models/Hairdresser.js";
import { Appointment } from "../models/Appointment.js";

export class ApiClient {
  private static baseUrl: string = "http://salonsapi.prooktatas.hu/api";

  public static async getHairdressers(): Promise<Hairdresser[]> {
    const response = await fetch(`${this.baseUrl}/hairdressers`);
    if (!response.ok) {
      throw new Error("Hiba történt a fodrászok lekérdezése során");
    }
    const data = await response.json();
    return data;
  }

  public static async createAppointment(appointment: Appointment): Promise<any> {
    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });
    if (!response.ok) {
      throw new Error("Hiba történt az időpont létrehozása során");
    }
    return await response.json();
  }

  public static async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${this.baseUrl}/appointments`);
    if (!response.ok) {
      throw new Error("Hiba történt a foglalások lekérdezése során");
    }
    const data = await response.json();
    return data;
  }
}