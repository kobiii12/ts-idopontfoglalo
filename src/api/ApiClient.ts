import { Hairdresser } from "../models/Hairdresser.js";
import { Appointment } from "../models/Appointment.js";

export class ApiClient {
  private static baseUrl: string = "http://salonsapi.prooktatas.hu/api";

  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Huiba a kérésben: ${response.status}`);
    }
    return (await response.json()) as T;
  }

  public static async getHairdressers(): Promise<Hairdresser[]> {
    return this.request<Hairdresser[]>(`${this.baseUrl}/hairdressers`);
  }

  public static async createAppointment(appointment: Appointment): Promise<any> {
    return this.request<any>(`${this.baseUrl}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });
  }

  public static async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>(`${this.baseUrl}/appointments`);
  }
}