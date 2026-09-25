export type RsvpStatus = "pending" | "yes" | "no";

export interface Guest {
  id: string;
  code: string;
  name: string;
  /** Lugares reservados para esta invitación (la persona + acompañantes) */
  seats: number;
  /** Nombres de los acompañantes (hasta seats - 1). Puede tener huecos vacíos. */
  companions: string[];
  phone?: string;
  note?: string;
  status: RsvpStatus;
  /** Personas que asistirán (solo cuando status === "yes") */
  attending: number;
  message?: string;
  createdAt: string;
  openedAt?: string;
  respondedAt?: string;
}

/** Lo que el invitado puede ver de sí mismo */
export interface PublicGuest {
  code: string;
  name: string;
  seats: number;
  companions: string[];
  status: RsvpStatus;
  attending: number;
  message?: string;
}

export function toPublic(g: Guest): PublicGuest {
  return {
    code: g.code,
    name: g.name,
    seats: g.seats,
    companions: (g.companions ?? []).filter(Boolean),
    status: g.status,
    attending: g.attending,
    message: g.message,
  };
}
